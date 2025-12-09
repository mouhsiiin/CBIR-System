# /home/muhammed/Documents/SmartGallery/backend/README.md

# SmartGallery Backend - Flask REST API

Content-based image search system with YOLOv8 object detection and visual feature extraction.

## Architecture

### Services
- **ObjectDetectionService**: YOLO-based object detection using fine-tuned model
- **FeatureExtractionService**: Extract color, texture, and shape features
- **SimilaritySearchService**: Find similar objects using feature matching
- **ImageManager**: Handle image upload, storage, and transformations

### Features Extracted

#### Color Features
- RGB and HSV histograms (32 bins each)
- Dominant colors (k-means clustering)
- Color moments (mean, standard deviation)

#### Texture Features
- **Tamura descriptors**: coarseness, contrast, directionality
- **Gabor filters**: Multi-scale and orientation responses

#### Shape Features
- **Hu moments**: 7 invariant moments from object contours
- **HOG**: Histogram of Oriented Gradients

## API Endpoints

### Image Management
- `POST /api/images/upload` - Upload images
- `GET /api/images` - List all images
- `GET /api/images/<id>` - Get image details
- `DELETE /api/images/<id>` - Delete image
- `POST /api/images/<id>/transform` - Apply transformations

### Object Detection
- `POST /api/detect` - Detect objects in image
- `POST /api/detect/batch` - Batch detection

### Feature Extraction
- `POST /api/features/extract` - Extract features from object
- `POST /api/features/extract/batch` - Batch extraction
- `GET /api/features/<image_id>/<object_id>` - Get formatted features

### Similarity Search
- `POST /api/search/similar` - Find similar objects

### Utilities
- `GET /api/stats` - Database statistics
- `GET /api/health` - Health check

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
