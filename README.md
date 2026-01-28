# 🖼️ CBIR System - Content-Based Image Retrieval

A sophisticated Content-Based Image Retrieval (CBIR) system powered by YOLOv8 object detection and comprehensive visual feature extraction. Search for similar images based on visual content rather than metadata or tags. **Now with 3D shape similarity search!**

![CBIR System](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00CCFF)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Quick Navigation

### Documentation Index
- **[📚 Complete Documentation Index](docs/INDEX.md)** - Navigate all documentation
- **[3D Search Complete Guide](docs/3D_SEARCH_COMPLETE_GUIDE.md)** - Comprehensive 3D shape search documentation
- **[3D API Documentation](docs/3D_API_DOCUMENTATION.md)** - 3D API endpoints reference
- **[3D Shape Features](docs/3D_SHAPE_FEATURES.md)** - Theoretical foundation for 3D features
- **[3D Quick Start](docs/QUICKSTART_3D.md)** - Get started with 3D search quickly
- **[Feature Algorithms](docs/ALGORITHMS.md)** - 2D feature extraction algorithms
- **[Model Training](docs/model.md)** - YOLOv8 model training notes (French)
- **[Category Reference](CATEGORIES.md)** - 15 ImageNet categories supported

### Features at a Glance
- 🖼️ **2D Image Search**: Object detection + multi-feature similarity
- 🎲 **3D Model Search**: Geometric shape-based retrieval
- 🔍 **Smart Retrieval**: Weighted feature matching
- ⚡ **Real-time Processing**: Fast detection and search
- 📊 **Modern UI**: React-based interactive interface

## 🌟 Features

### Core Capabilities
- **🎯 Object Detection**: Fine-tuned YOLOv8n model detecting 15 ImageNet categories
- **🔍 Visual Feature Extraction**: Multi-dimensional feature analysis
  - **Color Features**: RGB/HSV histograms, dominant colors (K-Means clustering)
  - **Texture Features**: Tamura descriptors, Gabor filters, Local Binary Patterns (LBP)
  - **Shape Features**: Hu moments, HOG descriptors, contour orientation histograms
- **🔎 Similarity Search**: Weighted multi-feature similarity matching
- **🖼️ Image Management**: Upload, transform, download, and batch operations
- **⚡ Real-time Processing**: Fast object detection and feature extraction
- **📊 Interactive UI**: Modern React-based interface with step-by-step workflow

### Advanced Features
- Batch image upload and processing
- Image transformations (crop, resize, rotate, flip)
- Customizable feature weights for similarity search
- Gallery view with object detection visualization
- Feature visualization and analysis tools
- **🎲 3D Shape Search**: Content-based retrieval for 3D models using global geometric features
  - Upload `.obj` models and search for similar shapes
  - 7D feature vector (volume, surface area, compactness, aspect ratios, moments of inertia)
  - Translation, rotation, and scale invariant
  - Real-time similarity search with customizable weights
  - Interactive 3D visualization with Three.js

## 🏗️ Architecture

```
CBIR-System/
├── backend/              # Flask REST API
│   ├── app.py           # Main application entry point
│   ├── services/        # Core services
│   │   ├── object_detection.py      # YOLOv8 detection (2D images)
│   │   ├── feature_extraction.py    # Visual features (2D)
│   │   ├── shape3d_features.py      # 3D shape features
│   │   ├── similarity_search.py     # Search engine
│   │   └── image_manager.py         # Image operations
│   ├── database/        # Feature database (JSON)
│   │   ├── features.json            # 2D image features
│   │   └── features_3d.json         # 3D model features
│   └── uploads/         # Uploaded files storage
│       ├── images/                  # 2D images
│       └── 3d_models/               # 3D models (.obj)
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # UI components
│   │   │   ├── Model3DSearch.jsx    # 3D search interface
│   │   │   ├── ModelViewer3D.jsx    # 3D visualization
│   │   │   └── ...                  # Other components
│   │   ├── pages/       # Application pages
│   │   │   ├── Gallery.jsx          # 2D image gallery
│   │   │   └── Gallery3D.jsx        # 3D model gallery
│   │   └── services/    # API client
│   └── public/          # Static assets
├── models/              # YOLOv8 trained model
└── docs/                # Documentation
    ├── 3D_SEARCH_COMPLETE_GUIDE.md  # Comprehensive 3D guide
    ├── 3D_API_DOCUMENTATION.md      # 3D API reference
    ├── 3D_SHAPE_FEATURES.md         # 3D features theory
    ├── QUICKSTART_3D.md             # 3D quick start
    ├── ALGORITHMS.md                # Feature algorithms
    └── model.md                     # Model training
```

### System Components

1. **Backend Services** (Python/Flask)
   - `ObjectDetectionService`: YOLO-based object detection (2D images)
   - `FeatureExtractionService`: Comprehensive visual feature extraction (2D)
   - `Shape3DFeatureExtractor`: Global geometric features for 3D models
   - `SimilaritySearchService`: Multi-feature similarity computation
   - `ImageManager`: Image handling and transformations

2. **Frontend Application** (React)
   - Step-by-step workflow interface (2D image search)
   - Real-time object detection visualization
   - Interactive feature weight adjustment
   - 3D model upload and search interface
   - Gallery views (2D images and 3D models)
   - 3D visualization with Three.js

3. **Database Storage**
   - `features.json`: 2D image feature vectors
   - `features_3d.json`: 3D model feature vectors
   - JSON-based for simplicity and portability

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **Model File**: YOLOv8n fine-tuned model (place in `models/` directory)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/mouhsiiin/CBIR-System.git
cd CBIR-System
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend server will start at `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend application will start at `http://localhost:5173`

### Model Setup

Place your fine-tuned YOLOv8n model file in the `models/` directory:
```
models/yolov8n_15classes_finetuned.pt
```

See [docs/model.md](docs/model.md) for detailed information about the model training process (documentation in French).

## 💡 Usage

### 2D Image Search Workflow

1. **Upload Image**: Select and upload an image to analyze
2. **Detect Objects**: Automatic detection of objects using YOLOv8
3. **Configure Search**: Select detected objects and adjust feature weights
4. **Search Similar**: Find visually similar objects in the database

### 3D Model Search Workflow

1. **Upload 3D Model**: Select and upload a `.obj` file
2. **Extract Features**: Automatic extraction of 7D geometric features
3. **Search Similar**: Find geometrically similar 3D models
4. **View Results**: Visualize similar models with interactive 3D preview

For detailed 3D search documentation, see [docs/3D_SEARCH_COMPLETE_GUIDE.md](docs/3D_SEARCH_COMPLETE_GUIDE.md)

### API Endpoints

The backend provides RESTful API endpoints for all operations:

#### 2D Image Management
- `POST /api/images/upload` - Upload images
- `GET /api/images` - List all images
- `GET /api/images/<id>` - Get image details
- `DELETE /api/images/<id>` - Delete image
- `POST /api/images/<id>/transform` - Apply transformations

#### Object Detection
- `POST /api/detect` - Detect objects in image
- `POST /api/detect/batch` - Batch detection

#### Feature Extraction
- `POST /api/features/extract` - Extract features
- `GET /api/features/<image_id>/<object_id>` - Get formatted features

#### Similarity Search
- `POST /api/search/similar` - Find similar objects

#### 3D Model Management
- `POST /api/3d/upload` - Upload 3D model (.obj)
- `GET /api/3d/models` - List all 3D models
- `GET /api/3d/models/file/<filename>` - Get 3D model file
- `DELETE /api/3d/models/<model_id>` - Delete 3D model

#### 3D Feature Extraction
- `POST /api/3d/features/extract` - Extract features from single model
- `POST /api/3d/features/extract/batch` - Batch feature extraction
- `GET /api/3d/features/<model_id>` - Get model features

#### 3D Similarity Search
- `POST /api/3d/search` - Find similar 3D models
- `GET /api/3d/database/stats` - Database statistics

For detailed API documentation, see:
- 2D Images: [backend/README.md](backend/README.md)
- 3D Models: [docs/3D_API_DOCUMENTATION.md](docs/3D_API_DOCUMENTATION.md)

## 🎯 Object Categories

The system detects 15 ImageNet categories (using COCO dataset class IDs):

| COCO ID | Category | Description |
|---------|----------|-------------|
| 0 | Person | Human beings, people |
| 1 | Bicycle | Two-wheeled vehicles |
| 2 | Car | Automobiles, motor cars |
| 4 | Airplane | Aircraft, aeroplanes |
| 8 | Boat | Watercraft, ships |
| 9 | Traffic Light | Traffic signals |
| 14 | Bird | Avian species |
| 15 | Cat | Domestic cats, felines |
| 16 | Dog | Domestic dogs, canines |
| 17 | Horse | Equines |
| 25 | Umbrella | Rain protection devices |
| 39 | Bottle | Containers for liquids |
| 47 | Apple | Fruit, apples |
| 52 | Pizza | Italian food dish |
| 63 | Laptop | Portable computers |

See [CATEGORIES.md](CATEGORIES.md) for detailed information about each category, including WordNet synsets and feature extraction details.

## 🔧 Configuration

### Feature Weights

Customize similarity search by adjusting feature weights:

```json
{
  "color": 0.25,
  "tamura_texture": 0.15,
  "gabor_texture": 0.15,
  "lbp_texture": 0.10,
  "hu_moments": 0.10,
  "hog_shape": 0.15,
  "contour_orientation": 0.10
}
```

### Image Transformations

Supported transformations:
- **Crop**: Extract region from image
- **Resize**: Change dimensions
- **Scale**: Maintain aspect ratio
- **Rotate**: Rotate by angle
- **Flip**: Horizontal/vertical flip

## 📊 Model Performance

The fine-tuned YOLOv8n model achieves:
- **mAP@50**: 89.7% (test set)
- **mAP@50-95**: 62.7% (test set)
- **Precision**: 85.9%
- **Recall**: 83.0%
- **Generalization Gap**: -1.7% ✅

For detailed model training notes, see [docs/model.md](docs/model.md) (documentation in French)

## 🛠️ Development

### Backend Development

```bash
cd backend
source venv/bin/activate
python app.py
```

### Frontend Development

```bash
cd frontend
npm run dev
```

Build for production:
```bash
npm run build
```

Lint code:
```bash
npm run lint
```

## 📁 Project Structure

```
CBIR-System/
├── backend/
│   ├── app.py                    # Flask application
│   ├── services/
│   │   ├── object_detection.py   # Object detection service (2D)
│   │   ├── feature_extraction.py # Feature extraction service (2D)
│   │   ├── shape3d_features.py   # 3D shape feature extraction
│   │   ├── similarity_search.py  # Similarity search service
│   │   └── image_manager.py      # Image management service
│   ├── database/                 # Feature database
│   │   ├── features.json         # 2D image features
│   │   └── features_3d.json      # 3D model features
│   ├── uploads/                  # Storage
│   │   ├── images/               # Uploaded images
│   │   └── 3d_models/            # Uploaded 3D models
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Model3DSearch.jsx # 3D search component
│   │   │   ├── ModelViewer3D.jsx # 3D visualization
│   │   │   └── ...
│   │   ├── pages/                # Application pages
│   │   │   ├── Gallery.jsx       # 2D gallery
│   │   │   └── Gallery3D.jsx     # 3D gallery
│   │   ├── services/             # API services
│   │   └── App.jsx               # Main application
│   ├── package.json              # Node dependencies
│   └── vite.config.js            # Vite configuration
├── models/
│   └── yolov8n_15classes_finetuned.pt  # Trained YOLO model
├── docs/
│   ├── 3D_SEARCH_COMPLETE_GUIDE.md # Comprehensive 3D documentation
│   ├── 3D_API_DOCUMENTATION.md     # 3D API reference
│   ├── 3D_SHAPE_FEATURES.md        # 3D features theory
│   ├── QUICKSTART_3D.md            # 3D quick start
│   ├── ALGORITHMS.md               # Feature algorithms
│   └── model.md                    # Model training documentation
├── CATEGORIES.md                 # Category documentation
└── README.md                     # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection framework
- [ImageNet](https://image-net.org) - Image dataset
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool

## 📚 References

### 2D Image Retrieval
1. Deng, J., et al. "ImageNet: A large-scale hierarchical image database." CVPR 2009.
2. Jocher, G., et al. "Ultralytics YOLOv8." GitHub, 2023.
3. Tamura, H., et al. "Textural features corresponding to visual perception." IEEE SMC, 1978.
4. Hu, M. K. "Visual pattern recognition by moment invariants." IRE Transactions, 1962.

### 3D Shape Retrieval
5. Osada, R., et al. "Shape Distributions." ACM TOG, 2002.
6. Zhang, D., & Chen, M. "A Survey on 3D Mesh Segmentation." 2001.
7. Paquet, E., et al. "Description of Shape Information for 2-D and 3-D Objects." Signal Processing: Image Communication, 2000.
8. Tangelder, J. W. H., & Veltkamp, R. C. "A Survey of Content-Based 3D Shape Retrieval Methods." Multimedia Tools and Applications, 2008.

---

**Note**: This is an educational/research project demonstrating CBIR techniques and deep learning-based object detection.
