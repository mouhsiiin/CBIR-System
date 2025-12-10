# /home/muhammed/Documents/SmartGallery/backend/services/similarity_search.py

import json
import numpy as np
from pathlib import Path
from datetime import datetime
from sklearn.preprocessing import normalize

class SimilaritySearchService:
    """Service for similarity search and feature database management"""
    
    def __init__(self, database_path):
        self.database_path = Path(database_path)
        self.database = self._load_database()
    
    def _load_database(self):
        """Load feature database from JSON"""
        if self.database_path.exists():
            with open(self.database_path, 'r') as f:
                return json.load(f)
        return {'images': {}, 'metadata': {'created': datetime.now().isoformat()}}
    
    def _save_database(self):
        """Save feature database to JSON"""
        self.database['metadata']['updated'] = datetime.now().isoformat()
        with open(self.database_path, 'w') as f:
            json.dump(self.database, f, indent=2)
    
    def save_detections(self, image_id, detections):
        """Save object detections for an image"""
        if image_id not in self.database['images']:
            self.database['images'][image_id] = {'detections': [], 'features': []}
        
        self.database['images'][image_id]['detections'] = detections
        self._save_database()
    
    def get_detections(self, image_id):
        """Get detections for an image"""
        if image_id in self.database['images']:
            return self.database['images'][image_id].get('detections', [])
        return None
    
    def save_features(self, image_id, object_id, features):
        """Save extracted features for an object"""
        if image_id not in self.database['images']:
            self.database['images'][image_id] = {'detections': [], 'features': []}
        
        # Ensure features list is long enough
        while len(self.database['images'][image_id]['features']) <= object_id:
            self.database['images'][image_id]['features'].append(None)
        
        self.database['images'][image_id]['features'][object_id] = features
        self._save_database()
    
    def get_features(self, image_id, object_id):
        """Get features for a specific object"""
        if image_id in self.database['images']:
            features_list = self.database['images'][image_id].get('features', [])
            if object_id < len(features_list):
                return features_list[object_id]
        return None
    
    def find_similar(self, query_features, query_class, top_k=10, weights=None, 
                     exclude_image_id=None, same_class_only=True, class_weight=0.8):
        """
        Find similar objects based on feature similarity
        
        Args:
            query_features: Features of query object
            query_class: Class name of query object (e.g., "airplane")
            top_k: Number of results to return
            weights: Optional dict of feature weights
            exclude_image_id: Image ID to exclude from results
            same_class_only: If True, only return objects of same class (RECOMMENDED)
            class_weight: Weight for class matching bonus (0.0 to 1.0)
            
        Returns:
            List of similar objects with scores
        """
        # Default weights (can be customized)
        if weights is None:
            weights = {
                'color': 0.25,
                'texture_tamura': 0.15,
                'texture_gabor': 0.15,
                'texture_lbp': 0.10,
                'shape_hu': 0.10,
                'shape_hog': 0.15,
                'shape_contour': 0.10
            }
        
        similarities = []
        
        for image_id, data in self.database['images'].items():
            # Skip excluded image
            if image_id == exclude_image_id:
                continue
            
            features_list = data.get('features', [])
            detections = data.get('detections', [])
            
            for obj_idx, target_features in enumerate(features_list):
                if not target_features:
                    continue
                
                # Get detection info
                detection_info = detections[obj_idx] if obj_idx < len(detections) else {}
                target_class = detection_info.get('class', 'unknown')
                
                # ✅ CLASS FILTERING - Only compare same classes!
                if same_class_only and target_class.lower() != query_class.lower():
                    continue  # Skip different classes entirely
                
                # Compute visual similarity
                visual_similarity = self._compute_similarity(
                    query_features, 
                    target_features, 
                    weights
                )
                
                # ✅ CLASS BONUS - If not filtering, give bonus for same class
                if not same_class_only:
                    if target_class.lower() == query_class.lower():
                        # Same class: boost similarity
                        final_similarity = visual_similarity * (1 - class_weight) + class_weight
                    else:
                        # Different class: reduce similarity
                        final_similarity = visual_similarity * (1 - class_weight)
                else:
                    # Already filtered by class, no need for bonus
                    final_similarity = visual_similarity
                
                # Clamp to [0, 1]
                final_similarity = max(0.0, min(1.0, final_similarity))
                
                similarities.append({
                    'image_id': image_id,
                    'object_id': obj_idx,
                    'similarity': final_similarity,
                    'visual_similarity': visual_similarity,  # Keep original for debugging
                    'class': target_class,
                    'confidence': detection_info.get('confidence', 0.0),
                    'bbox': detection_info.get('bbox', [])
                })
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        
        return similarities[:top_k]
    
    def _compute_similarity(self, features1, features2, weights):
        """Compute weighted similarity between two feature sets"""
        total_similarity = 0.0
        total_weight = 0.0
        
        # Color similarity
        if 'color' in features1 and 'color' in features2:
            sim = self._color_similarity(features1['color'], features2['color'])
            total_similarity += sim * weights.get('color', 0.3)
            total_weight += weights.get('color', 0.3)
        
        # Tamura texture similarity
        if 'texture_tamura' in features1 and 'texture_tamura' in features2:
            sim = self._tamura_similarity(features1['texture_tamura'], features2['texture_tamura'])
            total_similarity += sim * weights.get('texture_tamura', 0.2)
            total_weight += weights.get('texture_tamura', 0.2)
        
        # Gabor texture similarity
        if 'texture_gabor' in features1 and 'texture_gabor' in features2:
            sim = self._gabor_similarity(features1['texture_gabor'], features2['texture_gabor'])
            total_similarity += sim * weights.get('texture_gabor', 0.2)
            total_weight += weights.get('texture_gabor', 0.2)
        
        # Hu moments similarity
        if 'shape_hu' in features1 and 'shape_hu' in features2:
            sim = self._hu_similarity(features1['shape_hu'], features2['shape_hu'])
            total_similarity += sim * weights.get('shape_hu', 0.15)
            total_weight += weights.get('shape_hu', 0.15)
        
        # HOG similarity
        if 'shape_hog' in features1 and 'shape_hog' in features2:
            sim = self._hog_similarity(features1['shape_hog'], features2['shape_hog'])
            total_similarity += sim * weights.get('shape_hog', 0.15)
            total_weight += weights.get('shape_hog', 0.15)
        
        # LBP texture similarity
        if 'texture_lbp' in features1 and 'texture_lbp' in features2:
            sim = self._lbp_similarity(features1['texture_lbp'], features2['texture_lbp'])
            total_similarity += sim * weights.get('texture_lbp', 0.10)
            total_weight += weights.get('texture_lbp', 0.10)
        
        # Contour orientation similarity
        if 'shape_contour' in features1 and 'shape_contour' in features2:
            sim = self._contour_similarity(features1['shape_contour'], features2['shape_contour'])
            total_similarity += sim * weights.get('shape_contour', 0.10)
            total_weight += weights.get('shape_contour', 0.10)
        
        if total_weight > 0:
            return total_similarity / total_weight
        return 0.0
    
    def _color_similarity(self, color1, color2):
        """Compute color similarity using histogram intersection"""
        hist1 = np.array(color1.get('hist_rgb', []))
        hist2 = np.array(color2.get('hist_rgb', []))
        
        if len(hist1) == 0 or len(hist2) == 0:
            return 0.0
        
        # Histogram intersection
        intersection = np.minimum(hist1, hist2).sum()
        return float(intersection)
    
    def _tamura_similarity(self, tamura1, tamura2):
        """Compute Tamura feature similarity"""
        features1 = np.array([
            tamura1.get('coarseness', 0),
            tamura1.get('contrast', 0),
            tamura1.get('directionality', 0)
        ])
        features2 = np.array([
            tamura2.get('coarseness', 0),
            tamura2.get('contrast', 0),
            tamura2.get('directionality', 0)
        ])
        
        # Normalize and compute cosine similarity
        if np.linalg.norm(features1) > 0 and np.linalg.norm(features2) > 0:
            features1 = features1 / np.linalg.norm(features1)
            features2 = features2 / np.linalg.norm(features2)
            similarity = np.dot(features1, features2)
            return float(max(0, similarity))
        return 0.0
    
    def _gabor_similarity(self, gabor1, gabor2):
        """Compute Gabor feature similarity"""
        features1 = np.array(gabor1.get('gabor_responses', []))
        features2 = np.array(gabor2.get('gabor_responses', []))
        
        if len(features1) == 0 or len(features2) == 0:
            return 0.0
        
        # Cosine similarity
        if np.linalg.norm(features1) > 0 and np.linalg.norm(features2) > 0:
            features1 = features1 / np.linalg.norm(features1)
            features2 = features2 / np.linalg.norm(features2)
            similarity = np.dot(features1, features2)
            return float(max(0, similarity))
        return 0.0
    
    def _hu_similarity(self, hu1, hu2):
        """Compute Hu moments similarity"""
        moments1 = np.array(hu1.get('hu_moments', []))
        moments2 = np.array(hu2.get('hu_moments', []))
        
        if len(moments1) == 0 or len(moments2) == 0:
            return 0.0
        
        # Use distance-based similarity
        distance = np.linalg.norm(moments1 - moments2)
        similarity = 1.0 / (1.0 + distance)
        return float(similarity)
    
    def _hog_similarity(self, hog1, hog2):
        """Compute HOG feature similarity"""
        features1 = np.array(hog1.get('hog', []))
        features2 = np.array(hog2.get('hog', []))
        
        if len(features1) == 0 or len(features2) == 0:
            return 0.0
        
        # Cosine similarity
        if np.linalg.norm(features1) > 0 and np.linalg.norm(features2) > 0:
            features1 = features1 / np.linalg.norm(features1)
            features2 = features2 / np.linalg.norm(features2)
            similarity = np.dot(features1, features2)
            return float(max(0, similarity))
        return 0.0
    
    def _lbp_similarity(self, lbp1, lbp2):
        """Compute LBP histogram similarity using histogram intersection"""
        hist1 = np.array(lbp1.get('lbp_hist', []))
        hist2 = np.array(lbp2.get('lbp_hist', []))
        
        if len(hist1) == 0 or len(hist2) == 0:
            return 0.0
        
        # Histogram intersection
        intersection = np.minimum(hist1, hist2).sum()
        return float(intersection)
    
    def _contour_similarity(self, contour1, contour2):
        """Compute contour orientation histogram similarity"""
        hist1 = np.array(contour1.get('orientation_hist', []))
        hist2 = np.array(contour2.get('orientation_hist', []))
        
        if len(hist1) == 0 or len(hist2) == 0:
            return 0.0
        
        # Histogram intersection for orientation
        intersection = np.minimum(hist1, hist2).sum()
        return float(intersection)
    
    def get_statistics(self):
        """Get database statistics"""
        total_images = len(self.database['images'])
        total_objects = sum(
            len(data.get('detections', []))
            for data in self.database['images'].values()
        )
        total_features = sum(
            len([f for f in data.get('features', []) if f is not None])
            for data in self.database['images'].values()
        )
        
        # Class distribution
        class_counts = {}
        for data in self.database['images'].values():
            for detection in data.get('detections', []):
                class_name = detection.get('class', 'unknown')
                class_counts[class_name] = class_counts.get(class_name, 0) + 1
        
        return {
            'total_images': total_images,
            'total_objects': total_objects,
            'total_features_extracted': total_features,
            'class_distribution': class_counts
        }