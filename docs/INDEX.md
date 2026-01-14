# CBIR System - Documentation Index

Welcome to the CBIR System documentation! This index helps you navigate through all available documentation based on your needs.

## 🚀 Getting Started

### New Users
1. **[Main README](../README.md)** - Start here for project overview and setup
2. **[Quick Start - 3D](QUICKSTART_3D.md)** - Get 3D search running in 5 minutes
3. **[Category Reference](../CATEGORIES.md)** - Understand the 15 object categories

### Developers
1. **[Backend API](../backend/README.md)** - 2D image API reference
2. **[3D API Documentation](3D_API_DOCUMENTATION.md)** - 3D model API reference
3. **[Feature Algorithms](ALGORITHMS.md)** - How features are extracted

---

## 📚 Documentation by Topic

### 2D Image Retrieval

#### Core Documentation
| Document | Description | Audience |
|----------|-------------|----------|
| [Main README](../README.md) | Project overview, installation, basic usage | Everyone |
| [Backend README](../backend/README.md) | API endpoints, request/response formats | Developers |
| [CATEGORIES.md](../CATEGORIES.md) | 15 object categories with WordNet synsets | Users, Researchers |
| [ALGORITHMS.md](ALGORITHMS.md) | Feature extraction algorithms (color, texture, shape) | Researchers, Developers |

#### Technical Details
- **Object Detection**: YOLOv8n fine-tuned on 15 ImageNet categories
- **Color Features**: RGB/HSV histograms, K-Means dominant colors
- **Texture Features**: Tamura, Gabor filters, LBP
- **Shape Features**: Hu moments, HOG, contour orientation

#### API Endpoints (2D)
```
POST   /api/images/upload          # Upload image
GET    /api/images                 # List all images
POST   /api/detect                 # Detect objects
POST   /api/features/extract       # Extract features
POST   /api/search/similar         # Search similar objects
```

---

### 3D Shape Retrieval

#### Core Documentation
| Document | Description | Audience | Length |
|----------|-------------|----------|--------|
| **[3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md)** | **Complete guide** - everything about 3D search | Everyone | ~100 pages |
| [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md) | API reference with examples | Developers | 40 pages |
| [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) | Mathematical theory and research background | Researchers | 60 pages |
| [QUICKSTART_3D.md](QUICKSTART_3D.md) | Quick start guide with curl examples | New Users | 20 pages |

#### Quick Reference

**7D Feature Vector**:
1. Volume
2. Surface Area  
3. Compactness
4. Aspect Ratio XY
5. Aspect Ratio XZ
6. Moment of Inertia X
7. Moment of Inertia Y

**Normalization**: Translation → PCA Rotation → Scale to unit sphere

**Similarity**: Euclidean distance with optional feature weighting

**File Format**: Wavefront OBJ (`.obj`)

#### API Endpoints (3D)
```
POST   /api/3d/upload                     # Upload .obj file
GET    /api/3d/models                     # List all models
POST   /api/3d/features/extract           # Extract features
POST   /api/3d/features/extract/batch     # Batch extraction
POST   /api/3d/search                     # Search similar models
GET    /api/3d/database/stats             # Database statistics
```

#### When to Read What

**Just want to try it?**
→ [QUICKSTART_3D.md](QUICKSTART_3D.md)

**Building an application?**
→ [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md)

**Need deep understanding?**
→ [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md)

**Research or academic work?**
→ [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md)

---

## 🎯 Use Case Based Navigation

### Use Case: "I want to build an image search app"

1. Read [Main README](../README.md) - Setup and overview
2. Review [Backend API](../backend/README.md) - API integration
3. Check [Frontend components](../frontend/README.md) - UI examples
4. Explore [ALGORITHMS.md](ALGORITHMS.md) - Feature customization

### Use Case: "I want to add 3D model search to my app"

1. Read [QUICKSTART_3D.md](QUICKSTART_3D.md) - Quick start
2. Study [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md) - API integration
3. Review [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) - Complete reference
4. Check frontend examples in `frontend/src/components/Model3DSearch.jsx`

### Use Case: "I'm researching shape retrieval methods"

1. Read [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) - Theory and references
2. Check [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) - Implementation
3. Review `backend/services/shape3d_features.py` - Code implementation
4. See **Research Papers** section for citations

### Use Case: "I need to understand the features"

**For 2D Images:**
→ [ALGORITHMS.md](ALGORITHMS.md) - All 2D features explained

**For 3D Models:**
→ [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) - Section 1 (Theory)
→ [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) - Section 4 (Features)

### Use Case: "I'm getting errors"

**2D Image Issues:**
→ [Backend README](../backend/README.md) - Error codes

**3D Model Issues:**
→ [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) - Section 10 (Troubleshooting)
→ Run `python test_3d_api.py` for diagnostics

---

## 📖 Document Descriptions

### Main Documents

#### [Main README](../README.md)
**Purpose**: Project homepage and entry point
**Contents**:
- Project overview and features
- Installation instructions (backend + frontend)
- Basic usage workflow
- System architecture
- API endpoint summary
- Object categories
- Quick links to detailed docs

**Read this first if**: You're new to the project

---

#### [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) ⭐
**Purpose**: Comprehensive reference for everything 3D-related
**Contents**:
- System architecture with diagrams
- Mathematical foundations (normalization, features)
- Detailed feature descriptions with formulas
- Similarity computation algorithms
- Complete API reference with examples
- Frontend integration guide
- Usage examples (curl, Python, JavaScript)
- Performance analysis and optimization
- Troubleshooting guide

**Length**: ~100 pages (most comprehensive)

**Read this if**: 
- You need complete understanding of 3D search
- Building a production application
- Customizing or extending the system
- Debugging issues

---

#### [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md)
**Purpose**: API reference for developers
**Contents**:
- Feature vector description
- Preprocessing and normalization
- All API endpoints with request/response examples
- curl examples for each endpoint
- Python and JavaScript client examples
- Error handling

**Length**: ~40 pages

**Read this if**:
- You're integrating the API into your application
- Need quick API reference
- Writing client code

---

#### [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md)
**Purpose**: Academic/research documentation
**Contents**:
- Theoretical foundations
- Mathematical formulas with detailed explanations
- Literature review and citations
- Pros and cons of global features
- Implementation strategy
- Research background

**Length**: ~60 pages

**Read this if**:
- You're doing academic research
- Need to cite this work
- Want deep theoretical understanding
- Comparing different retrieval methods

---

#### [QUICKSTART_3D.md](QUICKSTART_3D.md)
**Purpose**: Get started quickly
**Contents**:
- Prerequisites
- Starting the server
- Interactive test script
- curl examples for all endpoints
- Automated test suite

**Length**: ~20 pages

**Read this if**:
- You want to try 3D search immediately
- Need working examples fast
- Testing the API manually

---

#### [ALGORITHMS.md](ALGORITHMS.md)
**Purpose**: 2D feature extraction algorithms
**Contents**:
- Color feature algorithms
- Texture feature algorithms (Tamura, Gabor, LBP)
- Shape feature algorithms (Hu moments, HOG)
- Mathematical formulas
- Implementation details

**Read this if**:
- Working with 2D image features
- Need to understand feature extraction
- Customizing feature weights

---

#### [CATEGORIES.md](../CATEGORIES.md)
**Purpose**: Object category reference
**Contents**:
- 15 ImageNet categories used
- COCO dataset class IDs
- WordNet synsets
- Category descriptions

**Read this if**:
- Need to know what objects can be detected
- Working with specific categories
- Understanding classification

---

### Model Documentation

#### [model.md](model.md)
**Purpose**: YOLOv8 model training documentation (French)
**Contents**:
- Training process
- Dataset preparation
- Model performance metrics
- Fine-tuning details

**Read this if**:
- Interested in model training
- Want to train your own model
- Read French

---

## 🔍 Search by Keyword

| Keyword | Primary Document | Section |
|---------|------------------|---------|
| Installation | [Main README](../README.md) | Getting Started |
| 3D Upload | [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md) | Upload 3D Model |
| 3D Features | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Feature Extraction |
| 3D Search | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Similarity Computation |
| 3D Theory | [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) | Theoretical Synthesis |
| 3D Quick Test | [QUICKSTART_3D.md](QUICKSTART_3D.md) | Quick Test |
| OBJ Format | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | File Format |
| Volume | [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) | Key Descriptors |
| Compactness | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Feature Descriptions |
| Aspect Ratio | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Feature Descriptions |
| Moments of Inertia | [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) | Statistical Moments |
| PCA Alignment | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Normalization Pipeline |
| Euclidean Distance | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Similarity Computation |
| Feature Weights | [3D_API_DOCUMENTATION.md](3D_API_DOCUMENTATION.md) | Similarity Measure |
| 2D Features | [ALGORITHMS.md](ALGORITHMS.md) | All sections |
| Color Histogram | [ALGORITHMS.md](ALGORITHMS.md) | Color Features |
| Tamura Texture | [ALGORITHMS.md](ALGORITHMS.md) | Texture Features |
| Hu Moments | [ALGORITHMS.md](ALGORITHMS.md) | Shape Features |
| YOLO Detection | [Main README](../README.md) | Object Detection |
| API Errors | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Troubleshooting |
| Performance | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Performance & Limitations |
| Frontend | [Main README](../README.md) | Frontend Setup |
| React Components | `frontend/src/components/` | Model3DSearch.jsx |
| Python Client | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Usage Examples |
| JavaScript Client | [3D_SEARCH_COMPLETE_GUIDE.md](3D_SEARCH_COMPLETE_GUIDE.md) | Usage Examples |

---

## 📊 Document Comparison

| Document | Length | Depth | Audience | Purpose |
|----------|--------|-------|----------|---------|
| README | Medium | Overview | Everyone | Introduction |
| 3D Complete Guide | Long | Deep | All levels | Everything 3D |
| 3D API Docs | Medium | Practical | Developers | API integration |
| 3D Shape Features | Long | Very Deep | Researchers | Theory |
| 3D Quickstart | Short | Practical | Beginners | Quick start |
| Algorithms | Medium | Deep | Technical | 2D features |
| Categories | Short | Reference | Users | Object types |

**Reading Path for Beginners**:
1. Main README (30 min)
2. QUICKSTART_3D (15 min)
3. 3D API Docs (1 hour)
4. 3D Complete Guide (3+ hours)

**Reading Path for Researchers**:
1. Main README (30 min)
2. 3D Shape Features (2+ hours)
3. 3D Complete Guide (2+ hours)
4. Review source code

**Reading Path for Developers**:
1. Main README (30 min)
2. 3D API Docs (1 hour)
3. 3D Complete Guide - relevant sections (1 hour)
4. Code examples

---

## 🛠️ Code Reference

### Backend Services

| File | Purpose | Related Docs |
|------|---------|--------------|
| `backend/app.py` | Main Flask app with routes | All API docs |
| `backend/services/shape3d_features.py` | 3D feature extraction | 3D Complete Guide, 3D Shape Features |
| `backend/services/feature_extraction.py` | 2D feature extraction | ALGORITHMS.md |
| `backend/services/object_detection.py` | YOLO detection | Main README |
| `backend/services/similarity_search.py` | Search engine | Main README |

### Frontend Components

| File | Purpose | Related Docs |
|------|---------|--------------|
| `frontend/src/components/Model3DSearch.jsx` | 3D search UI | 3D Complete Guide |
| `frontend/src/components/ModelViewer3D.jsx` | 3D visualization | 3D Complete Guide |
| `frontend/src/pages/Gallery3D.jsx` | 3D gallery page | 3D API Docs |
| `frontend/src/services/api.js` | API client | All API docs |

### Test Scripts

| File | Purpose | Related Docs |
|------|---------|--------------|
| `backend/test_3d_api.py` | 3D API test suite | QUICKSTART_3D |
| `backend/test_api.py` | 2D API tests | Backend README |

---

## 📝 External Resources

### Tools
- [MeshLab](https://www.meshlab.net/) - 3D mesh processing
- [Blender](https://www.blender.org/) - 3D modeling
- [Three.js](https://threejs.org/) - WebGL visualization

### Research Papers
See [3D_SHAPE_FEATURES.md](3D_SHAPE_FEATURES.md) - Bibliography section

### Related Projects
- [YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection
- [ImageNet](https://image-net.org) - Dataset

---

## 🤝 Contributing

Found an issue in the documentation? Want to add examples?

1. Fork the repository
2. Make your changes
3. Submit a pull request

Documentation follows Markdown format with:
- Clear headings and structure
- Code examples with syntax highlighting
- Mathematical formulas in KaTeX/LaTeX
- Tables for comparisons
- Diagrams where helpful

---

## 📧 Support

- **GitHub Issues**: Bug reports and feature requests
- **Documentation Issues**: Submit PR or open issue
- **Questions**: Check existing documentation first

---

**Last Updated**: January 2026
**Maintained by**: Mouhsin
**License**: MIT
