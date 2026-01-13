# /home/muhammed/Documents/SmartGallery/backend/app.py

from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api, Resource
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from pathlib import Path
import json

from services.object_detection import ObjectDetectionService
from services.feature_extraction import FeatureExtractionService
from services.similarity_search import SimilaritySearchService
from services.image_manager import ImageManager
from services.shape3d_features import Shape3DFeatureExtractor, Shape3DSimilaritySearch

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend
api = Api(app)

# Configuration
app.config['UPLOAD_FOLDER'] = Path(__file__).parent / 'uploads'
app.config['3D_MODELS_FOLDER'] = Path(__file__).parent / 'uploads' / '3d_models'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
app.config['ALLOWED_3D_EXTENSIONS'] = {'obj'}
app.config['MODEL_PATH'] = Path(__file__).parent.parent / 'models' / 'yolov8n_15classes_finetuned.pt'
app.config['DATABASE_PATH'] = Path(__file__).parent / 'database' / 'features.json'
app.config['DATABASE_3D_PATH'] = Path(__file__).parent / 'database' / 'features_3d.json'

# Create necessary directories
app.config['UPLOAD_FOLDER'].mkdir(parents=True, exist_ok=True)
app.config['3D_MODELS_FOLDER'].mkdir(parents=True, exist_ok=True)
(Path(__file__).parent / 'database').mkdir(parents=True, exist_ok=True)

# Initialize services
detection_service = ObjectDetectionService(str(app.config['MODEL_PATH']))
feature_service = FeatureExtractionService()
similarity_service = SimilaritySearchService(str(app.config['DATABASE_PATH']))
image_manager = ImageManager(str(app.config['UPLOAD_FOLDER']))
shape3d_extractor = Shape3DFeatureExtractor()
shape3d_similarity = Shape3DSimilaritySearch(str(app.config['DATABASE_3D_PATH']))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def allowed_3d_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_3D_EXTENSIONS']


# REST API Resources
class ImageUpload(Resource):
    """Upload single or multiple images"""
    def post(self):
        if 'images' not in request.files:
            return {'error': 'No images provided'}, 400
        
        files = request.files.getlist('images')
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                result = image_manager.save_image(file)
                results.append(result)
        
        return {'uploaded': results}, 201


class ImageList(Resource):
    """Get all images or delete multiple"""
    def get(self):
        images = image_manager.get_all_images()
        return {'images': images}, 200
    
    def delete(self):
        """Delete multiple images"""
        data = request.get_json()
        image_ids = data.get('image_ids', [])
        results = image_manager.delete_images(image_ids)
        return {'deleted': results}, 200


class ImageDetail(Resource):
    """Get, update or delete single image"""
    def get(self, image_id):
        image_info = image_manager.get_image(image_id)
        if not image_info:
            return {'error': 'Image not found'}, 404
        return image_info, 200
    
    def delete(self, image_id):
        success = image_manager.delete_image(image_id)
        if not success:
            return {'error': 'Image not found'}, 404
        return {'message': 'Image deleted successfully'}, 200


class ImageTransform(Resource):
    """Apply transformations to images (crop, resize, rotate)"""
    def post(self, image_id):
        data = request.get_json()
        transform_type = data.get('transform_type')
        params = data.get('params', {})
        
        result = image_manager.transform_image(image_id, transform_type, params)
        if 'error' in result:
            return result, 400
        
        return result, 201


class ObjectDetect(Resource):
    """Detect objects in an image"""
    def post(self):
        data = request.get_json()
        image_id = data.get('image_id')
        
        if not image_id:
            return {'error': 'image_id required'}, 400
        
        image_path = image_manager.get_image_path(image_id)
        if not image_path:
            return {'error': 'Image not found'}, 404
        
        detections = detection_service.detect(image_path)
        
        # Save detections to database
        similarity_service.save_detections(image_id, detections)
        
        return {
            'image_id': image_id,
            'detections': detections
        }, 200


class ObjectDetectBatch(Resource):
    """Detect objects in multiple images"""
    def post(self):
        data = request.get_json()
        image_ids = data.get('image_ids', [])
        
        results = []
        for image_id in image_ids:
            image_path = image_manager.get_image_path(image_id)
            if image_path:
                detections = detection_service.detect(image_path)
                similarity_service.save_detections(image_id, detections)
                results.append({
                    'image_id': image_id,
                    'detections': detections
                })
        
        return {'results': results}, 200


class FeatureExtract(Resource):
    """Extract visual features from detected objects"""
    def post(self):
        data = request.get_json()
        image_id = data.get('image_id')
        object_id = data.get('object_id')  # Index of the detected object
        
        if not image_id:
            return {'error': 'image_id required'}, 400
        
        image_path = image_manager.get_image_path(image_id)
        if not image_path:
            return {'error': 'Image not found'}, 404
        
        # Get detection bbox
        detections = similarity_service.get_detections(image_id)
        if not detections or object_id >= len(detections):
            return {'error': 'Object not found'}, 404
        
        bbox = detections[object_id]['bbox']
        
        # Extract features
        features = feature_service.extract_all_features(image_path, bbox)
        
        # Save features
        similarity_service.save_features(image_id, object_id, features)
        
        return {
            'image_id': image_id,
            'object_id': object_id,
            'features': features
        }, 200


class FeatureExtractBatch(Resource):
    """Extract features for all objects in one or multiple images"""
    def post(self):
        data = request.get_json()
        image_ids = data.get('image_ids', [])
        
        results = []
        for image_id in image_ids:
            image_path = image_manager.get_image_path(image_id)
            if not image_path:
                continue
            
            detections = similarity_service.get_detections(image_id)
            if not detections:
                continue
            
            for obj_idx, detection in enumerate(detections):
                bbox = detection['bbox']
                features = feature_service.extract_all_features(image_path, bbox)
                similarity_service.save_features(image_id, obj_idx, features)
                results.append({
                    'image_id': image_id,
                    'object_id': obj_idx,
                    'class': detection['class'],
                    'confidence': detection['confidence']
                })
        
        return {'processed': results}, 200


class SimilaritySearch(Resource):
    """Search for similar objects"""
    def post(self):
        data = request.get_json()
        query_image_id = data.get('query_image_id')
        query_object_id = data.get('query_object_id')
        top_k = data.get('top_k', 10)
        weights = data.get('weights', None)
        
        if not query_image_id or query_object_id is None:
            return {'error': 'query_image_id and query_object_id required'}, 400
        
        query_features = similarity_service.get_features(query_image_id, query_object_id)
        if not query_features:
            return {'error': 'Features not found. Extract features first.'}, 404
        
        detections = similarity_service.get_detections(query_image_id)
        if not detections or query_object_id >= len(detections):
            return {'error': 'Detection not found'}, 404
        
        query_class = detections[query_object_id]['class']
        
        similar_objects = similarity_service.find_similar(
            query_features=query_features,
            query_class=query_class,
            top_k=top_k * 2,  # Get more results to filter
            weights=weights,
            exclude_image_id=query_image_id,
            same_class_only=True
        )
        
        # ✅ FILTER OUT MISSING IMAGES & ADD FILENAME
        valid_results = []
        for obj in similar_objects:
            image_info = image_manager.get_image(obj['image_id'])
            if image_info:  # Only include if image file still exists
                obj['filename'] = image_info['filename']
                valid_results.append(obj)
                if len(valid_results) >= top_k:  # Stop when we have enough valid results
                    break
        
        return {
            'query_image_id': query_image_id,
            'query_object_id': query_object_id,
            'query_class': query_class,
            'similar_objects': valid_results
        }, 200

class FeatureVisualize(Resource):
    """Get formatted features for visualization"""
    def get(self, image_id, object_id):
        features = similarity_service.get_features(image_id, int(object_id))
        if not features:
            return {'error': 'Features not found'}, 404
        
        # Format features for display
        formatted = feature_service.format_features_for_display(features)
        
        return {
            'image_id': image_id,
            'object_id': object_id,
            'features': formatted
        }, 200


class DatabaseStats(Resource):
    """Get database statistics"""
    def get(self):
        stats = similarity_service.get_statistics()
        return stats, 200


# ===== 3D Model API Resources =====

class Model3DUpload(Resource):
    """Upload 3D model (.obj file)"""
    def post(self):
        if 'model' not in request.files:
            return {'error': 'No model file provided'}, 400
        
        file = request.files['model']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
        
        if file and allowed_3d_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = app.config['3D_MODELS_FOLDER'] / filename
            
            # Save file
            file.save(str(filepath))
            
            # Generate unique ID from filename
            model_id = Path(filename).stem
            
            return {
                'model_id': model_id,
                'filename': filename,
                'path': str(filepath)
            }, 201
        
        return {'error': 'Invalid file type. Only .obj files allowed'}, 400


class Model3DList(Resource):
    """Get all 3D models"""
    def get(self):
        models = []
        models_dir = app.config['3D_MODELS_FOLDER']
        
        for obj_file in models_dir.glob('*.obj'):
            model_id = obj_file.stem
            
            # Check if features are extracted
            has_features = model_id in shape3d_similarity.database
            
            models.append({
                'model_id': model_id,
                'filename': obj_file.name,
                'path': str(obj_file),
                'has_features': has_features
            })
        
        return {'models': models}, 200


class Model3DFeatureExtract(Resource):
    """Extract features from a 3D model and add to database"""
    def post(self):
        data = request.get_json()
        model_id = data.get('model_id')
        metadata = data.get('metadata', {})
        
        if not model_id:
            return {'error': 'model_id required'}, 400
        
        # Find the .obj file
        obj_path = app.config['3D_MODELS_FOLDER'] / f'{model_id}.obj'
        
        if not obj_path.exists():
            return {'error': f'Model file not found: {model_id}.obj'}, 404
        
        try:
            # Extract features and add to database
            features = shape3d_similarity.add_model(model_id, str(obj_path), metadata)
            
            return {
                'model_id': model_id,
                'features': features,
                'message': 'Features extracted and saved successfully'
            }, 200
        
        except Exception as e:
            return {'error': f'Feature extraction failed: {str(e)}'}, 500


class Model3DFeatureExtractBatch(Resource):
    """Extract features from multiple 3D models"""
    def post(self):
        data = request.get_json()
        model_ids = data.get('model_ids', [])
        
        results = []
        errors = []
        
        for model_id in model_ids:
            obj_path = app.config['3D_MODELS_FOLDER'] / f'{model_id}.obj'
            
            if not obj_path.exists():
                errors.append({'model_id': model_id, 'error': 'File not found'})
                continue
            
            try:
                features = shape3d_similarity.add_model(model_id, str(obj_path))
                results.append({
                    'model_id': model_id,
                    'success': True,
                    'features': features
                })
            except Exception as e:
                errors.append({'model_id': model_id, 'error': str(e)})
        
        return {
            'processed': results,
            'errors': errors
        }, 200


class Model3DSimilaritySearch(Resource):
    """Search for similar 3D models using global features"""
    def post(self):
        data = request.get_json()
        query_model_id = data.get('query_model_id')
        top_k = data.get('top_k', 10)
        weights = data.get('weights', None)
        
        if not query_model_id:
            return {'error': 'query_model_id required'}, 400
        
        # Get query model path
        query_obj_path = app.config['3D_MODELS_FOLDER'] / f'{query_model_id}.obj'
        
        if not query_obj_path.exists():
            return {'error': f'Query model not found: {query_model_id}'}, 404
        
        try:
            # Convert weights to numpy array if provided
            if weights:
                import numpy as np
                weights = np.array(weights)
            
            # Search for similar models
            results = shape3d_similarity.search_similar(
                str(query_obj_path),
                top_k=top_k,
                weights=weights
            )
            
            return {
                'query_model_id': query_model_id,
                'results': results
            }, 200
        
        except Exception as e:
            return {'error': f'Search failed: {str(e)}'}, 500


class Model3DDetail(Resource):
    """Get details and features of a specific 3D model"""
    def get(self, model_id):
        obj_path = app.config['3D_MODELS_FOLDER'] / f'{model_id}.obj'
        
        if not obj_path.exists():
            return {'error': 'Model not found'}, 404
        
        # Get features from database if available
        features = None
        metadata = {}
        
        if model_id in shape3d_similarity.database:
            model_data = shape3d_similarity.database[model_id]
            features = model_data['features']
            metadata = model_data.get('metadata', {})
        
        return {
            'model_id': model_id,
            'filename': f'{model_id}.obj',
            'path': str(obj_path),
            'has_features': features is not None,
            'features': features,
            'metadata': metadata
        }, 200
    
    def delete(self, model_id):
        """Delete a 3D model and its features"""
        obj_path = app.config['3D_MODELS_FOLDER'] / f'{model_id}.obj'
        
        if not obj_path.exists():
            return {'error': 'Model not found'}, 404
        
        try:
            # Delete file
            obj_path.unlink()
            
            # Remove from database
            if model_id in shape3d_similarity.database:
                del shape3d_similarity.database[model_id]
                shape3d_similarity._save_database()
            
            return {'message': f'Model {model_id} deleted successfully'}, 200
        
        except Exception as e:
            return {'error': f'Deletion failed: {str(e)}'}, 500


class Model3DStats(Resource):
    """Get 3D database statistics"""
    def get(self):
        stats = shape3d_similarity.get_database_stats()
        return stats, 200


# Register API routes
api.add_resource(ImageUpload, '/api/images/upload')
api.add_resource(ImageList, '/api/images')
api.add_resource(ImageDetail, '/api/images/<string:image_id>')
api.add_resource(ImageTransform, '/api/images/<string:image_id>/transform')
api.add_resource(ObjectDetect, '/api/detect')
api.add_resource(ObjectDetectBatch, '/api/detect/batch')
api.add_resource(FeatureExtract, '/api/features/extract')
api.add_resource(FeatureExtractBatch, '/api/features/extract/batch')
api.add_resource(SimilaritySearch, '/api/search/similar')
api.add_resource(FeatureVisualize, '/api/features/<string:image_id>/<int:object_id>')
api.add_resource(DatabaseStats, '/api/stats')

# 3D Model API routes
api.add_resource(Model3DUpload, '/api/3d/upload')
api.add_resource(Model3DList, '/api/3d/models')
api.add_resource(Model3DDetail, '/api/3d/models/<string:model_id>')
api.add_resource(Model3DFeatureExtract, '/api/3d/features/extract')
api.add_resource(Model3DFeatureExtractBatch, '/api/3d/features/extract/batch')
api.add_resource(Model3DSimilaritySearch, '/api/3d/search')
api.add_resource(Model3DStats, '/api/3d/stats')

# Serve uploaded images
@app.route('/api/images/file/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Serve 3D model files
@app.route('/api/3d/models/file/<path:filename>')
def serve_3d_model(filename):
    """Serve .obj files for download or preview"""
    return send_from_directory(app.config['3D_MODELS_FOLDER'], filename)


# Download image endpoint
@app.route('/api/images/download/<string:image_id>')
def download_image(image_id):
    """Download an image by its ID"""
    image_path = image_manager.get_image_path(image_id)
    if not image_path:
        return jsonify({'error': 'Image not found'}), 404
    
    from pathlib import Path
    filepath = Path(image_path)
    return send_from_directory(
        filepath.parent, 
        filepath.name, 
        as_attachment=True,
        download_name=filepath.name
    )


@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': detection_service.is_loaded()}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)