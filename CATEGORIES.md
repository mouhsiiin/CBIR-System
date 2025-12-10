# ImageNet Categories for CBIR System

This document describes the 15 ImageNet categories used in this Content-Based Image Retrieval (CBIR) system. The YOLOv8n model has been fine-tuned on these specific categories.

## Selected Categories

| ID | Category Name | WordNet Synset | Description |
|----|---------------|----------------|-------------|
| 0 | Person | n07942152 | Human beings, people |
| 1 | Bicycle | n02834778 | Two-wheeled vehicles |
| 2 | Car | n02958343 | Automobiles, motor cars |
| 4 | Airplane | n02691156 | Aircraft, aeroplanes |
| 8 | Boat | n02858304 | Watercraft, ships |
| 9 | Traffic Light | n06874185 | Traffic signals |
| 14 | Bird | n01503061 | Avian species |
| 15 | Cat | n02121620 | Domestic cats, felines |
| 16 | Dog | n02084071 | Domestic dogs, canines |
| 17 | Horse | n02374451 | Equines |
| 25 | Umbrella | n04507155 | Rain protection devices |
| 39 | Bottle | n02876657 | Containers for liquids |
| 47 | Apple | n07739125 | Fruit, apples |
| 52 | Pizza | n07873807 | Italian food dish |
| 63 | Laptop | n03642806 | Portable computers |

## Category Distribution

The categories were selected to provide diverse coverage across:

### Living Beings
- **Person** (n07942152): Most common object in everyday images
- **Bird** (n01503061): Represents flying animals
- **Cat** (n02121620): Common household pet
- **Dog** (n02084071): Common household pet
- **Horse** (n02374451): Larger domestic animal

### Vehicles & Transportation
- **Bicycle** (n02834778): Human-powered vehicle
- **Car** (n02958343): Most common motor vehicle
- **Airplane** (n02691156): Air transportation
- **Boat** (n02858304): Water transportation

### Objects & Items
- **Traffic Light** (n06874185): Urban infrastructure
- **Umbrella** (n04507155): Common accessory
- **Bottle** (n02876657): Everyday container
- **Apple** (n07739125): Common food item
- **Pizza** (n07873807): Popular food dish
- **Laptop** (n03642806): Technology device

## Model Training

The YOLOv8n model was fine-tuned using the following approach:

1. **Base Model**: YOLOv8n pre-trained on COCO dataset
2. **Training Data**: Subset of ImageNet images for the 15 categories
3. **Data Augmentation**: 
   - Random horizontal flip
   - Random scaling (0.5-1.5x)
   - Random rotation (±15°)
   - Color jittering
4. **Training Parameters**:
   - Epochs: 100
   - Batch size: 16
   - Learning rate: 0.01
   - Optimizer: SGD with momentum

## Feature Extraction

For each detected object, the following visual features are extracted:

### Color Features
- RGB Histogram (48 bins)
- HSV Histogram (48 bins)
- Mean RGB values
- Standard deviation RGB
- **Dominant Colors** (5 colors via K-Means clustering)

### Texture Features
- **Tamura Descriptors**: Coarseness, Contrast, Directionality
- **Gabor Filter Responses**: 8 orientations × 2 frequencies
- **Local Binary Pattern (LBP)**: Rotation-invariant texture

### Shape Features
- **Hu Moments**: 7 invariant moments
- **HOG Descriptors**: Histogram of Oriented Gradients
- **Contour Orientation Histogram**: Edge direction distribution

## Usage

To use this CBIR system:

1. **Upload Images**: Add images to the gallery
2. **Object Detection**: Automatically detect objects using YOLOv8n
3. **Feature Extraction**: Extract visual features from detected objects
4. **Similarity Search**: Find similar objects based on visual content

## ImageNet Resources

- **Official Website**: [https://image-net.org](https://image-net.org)
- **WordNet**: [https://wordnet.princeton.edu](https://wordnet.princeton.edu)
- **ILSVRC**: ImageNet Large Scale Visual Recognition Challenge

## References

1. Deng, J., et al. "ImageNet: A large-scale hierarchical image database." CVPR 2009.
2. Jocher, G., et al. "Ultralytics YOLOv8." GitHub, 2023.
3. Tamura, H., et al. "Textural features corresponding to visual perception." IEEE SMC, 1978.
4. Hu, M. K. "Visual pattern recognition by moment invariants." IRE Transactions, 1962.
