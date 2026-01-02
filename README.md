# 🖼️ CBIR System - Content-Based Image Retrieval

A sophisticated Content-Based Image Retrieval (CBIR) system powered by YOLOv8 object detection and comprehensive visual feature extraction. Search for similar images based on visual content rather than metadata or tags.

![CBIR System](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00CCFF)
![License](https://img.shields.io/badge/License-MIT-green)

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

## 🏗️ Architecture

```
CBIR-System/
├── backend/              # Flask REST API
│   ├── app.py           # Main application entry point
│   ├── services/        # Core services
│   │   ├── object_detection.py      # YOLOv8 detection
│   │   ├── feature_extraction.py    # Visual features
│   │   ├── similarity_search.py     # Search engine
│   │   └── image_manager.py         # Image operations
│   ├── database/        # Feature database (JSON)
│   └── uploads/         # Uploaded images storage
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   └── services/    # API client
│   └── public/          # Static assets
├── models/              # YOLOv8 trained model
└── docs/                # Documentation
```

### System Components

1. **Backend Services** (Python/Flask)
   - `ObjectDetectionService`: YOLO-based object detection
   - `FeatureExtractionService`: Comprehensive feature extraction
   - `SimilaritySearchService`: Multi-feature similarity computation
   - `ImageManager`: Image handling and transformations

2. **Frontend Application** (React)
   - Step-by-step workflow interface
   - Real-time object detection visualization
   - Interactive feature weight adjustment
   - Gallery and search results display

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

See [docs/model.md](docs/model.md) for detailed information about the model training process.

## 💡 Usage

### Basic Workflow

1. **Upload Image**: Select and upload an image to analyze
2. **Detect Objects**: Automatic detection of objects using YOLOv8
3. **Configure Search**: Select detected objects and adjust feature weights
4. **Search Similar**: Find visually similar objects in the database

### API Endpoints

The backend provides RESTful API endpoints for all operations:

#### Image Management
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

For detailed API documentation, see [backend/README.md](backend/README.md)

## 🎯 Object Categories

The system detects 15 ImageNet categories:

| Category | Description |
|----------|-------------|
| Person | Human beings, people |
| Bicycle | Two-wheeled vehicles |
| Car | Automobiles, motor cars |
| Airplane | Aircraft, aeroplanes |
| Boat | Watercraft, ships |
| Traffic Light | Traffic signals |
| Bird | Avian species |
| Cat | Domestic cats, felines |
| Dog | Domestic dogs, canines |
| Horse | Equines |
| Umbrella | Rain protection devices |
| Bottle | Containers for liquids |
| Apple | Fruit, apples |
| Pizza | Italian food dish |
| Laptop | Portable computers |

See [CATEGORIES.md](CATEGORIES.md) for detailed information about each category.

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

For detailed model training notes, see [docs/model.md](docs/model.md)

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
│   │   ├── object_detection.py   # Object detection service
│   │   ├── feature_extraction.py # Feature extraction service
│   │   ├── similarity_search.py  # Similarity search service
│   │   └── image_manager.py      # Image management service
│   ├── database/                 # Feature database
│   ├── uploads/                  # Image storage
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Application pages
│   │   ├── services/             # API services
│   │   └── App.jsx               # Main application
│   ├── package.json              # Node dependencies
│   └── vite.config.js            # Vite configuration
├── models/
│   └── yolov8n_15classes_finetuned.pt  # Trained model
├── docs/
│   └── model.md                  # Model training documentation
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

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Mouhsin**

- GitHub: [@mouhsiiin](https://github.com/mouhsiiin)

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection framework
- [ImageNet](https://image-net.org) - Image dataset
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool

## 📚 References

1. Deng, J., et al. "ImageNet: A large-scale hierarchical image database." CVPR 2009.
2. Jocher, G., et al. "Ultralytics YOLOv8." GitHub, 2023.
3. Tamura, H., et al. "Textural features corresponding to visual perception." IEEE SMC, 1978.
4. Hu, M. K. "Visual pattern recognition by moment invariants." IRE Transactions, 1962.

---

**Note**: This is an educational/research project demonstrating CBIR techniques and deep learning-based object detection.
