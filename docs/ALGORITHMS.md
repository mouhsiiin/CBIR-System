# CBIR System - Mathematical Algorithms & Methods Documentation

> **Content-Based Image Retrieval (CBIR) System**
> 
> This document provides comprehensive documentation of all mathematical algorithms, formulas, and methods used in the CBIR system for feature extraction, similarity computation, and object detection.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Object Detection](#2-object-detection)
3. [Feature Extraction](#3-feature-extraction)
   - [Color Features](#31-color-features)
   - [Texture Features](#32-texture-features)
   - [Shape Features](#33-shape-features)
4. [Similarity Computation](#4-similarity-computation)
5. [Score Normalization](#5-score-normalization)
6. [Class-Specific Weights](#6-class-specific-weights)

---

## 1. System Overview

The CBIR system performs image retrieval using a multi-stage pipeline:

```
Input Image → Object Detection → Segmentation → Feature Extraction → Similarity Search → Results
```

**Feature Categories:**
- **Color Features**: Dominant colors, histograms, color moments
- **Texture Features**: Tamura descriptors, Gabor filters, LBP
- **Shape Features**: Hu moments, HOG, contour orientations

---

## 2. Object Detection

### 2.1 YOLOv8 Detection

The system uses a **fine-tuned YOLOv8** model for object detection.

**Detection Process:**
1. Input image is passed through YOLOv8 neural network
2. Non-maximum suppression (NMS) filters overlapping boxes
3. Outputs bounding boxes with class predictions and confidence scores

**Output Format:**
$$\text{Detection} = \{bbox: [x_1, y_1, x_2, y_2], class, confidence\}$$

**Supported Classes (15):**
`person`, `bicycle`, `car`, `airplane`, `boat`, `traffic_light`, `bird`, `cat`, `dog`, `horse`, `umbrella`, `bottle`, `apple`, `pizza`, `laptop`

### 2.2 Instance Segmentation

For background removal, YOLOv8-seg model generates pixel-level masks:

$$\text{Mask}(x, y) = \begin{cases} 1 & \text{if pixel belongs to object} \\ 0 & \text{if pixel is background} \end{cases}$$

---

## 3. Feature Extraction

### 3.1 Color Features

#### 3.1.1 Color Histograms

**RGB Histogram:**
The image is analyzed in RGB color space with 16 bins per channel (48 total bins).

$$H_c(i) = \frac{\text{count of pixels in bin } i}{\text{total pixels}}, \quad c \in \{R, G, B\}$$

Where bin $i$ covers the intensity range:
$$\left[\frac{256 \cdot i}{16}, \frac{256 \cdot (i+1)}{16}\right)$$

**HSV Histogram:**
Similarly computed in HSV color space:
- **H (Hue)**: 16 bins over [0, 180)
- **S (Saturation)**: 16 bins over [0, 256)
- **V (Value)**: 16 bins over [0, 256)

**Normalization:**
$$H_{normalized}(i) = \frac{H(i)}{\sum_{j=0}^{n-1} H(j) + \epsilon}$$

where $\epsilon = 10^{-7}$ prevents division by zero.

---

#### 3.1.2 Color Moments

**Mean (First Moment):**
$$\mu_c = \frac{1}{N} \sum_{i=1}^{N} p_{c,i}$$

where $p_{c,i}$ is the intensity of pixel $i$ in channel $c$, and $N$ is the total number of pixels.

**Standard Deviation (Second Moment):**
$$\sigma_c = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (p_{c,i} - \mu_c)^2}$$

---

#### 3.1.3 Dominant Color Extraction (K-Means Clustering)

**Algorithm:** K-Means clustering with $k=5$ clusters

**Objective Function (Minimize):**
$$J = \sum_{i=1}^{k} \sum_{x \in C_i} \|x - \mu_i\|^2$$

where:
- $C_i$ = cluster $i$
- $\mu_i$ = centroid of cluster $i$
- $x$ = RGB pixel value

**Cluster Assignment:**
$$C_i = \{x : \|x - \mu_i\| \leq \|x - \mu_j\| \text{ for all } j \neq i\}$$

**Centroid Update:**
$$\mu_i = \frac{1}{|C_i|} \sum_{x \in C_i} x$$

**Percentage Calculation:**
$$\text{percentage}_i = \frac{|C_i|}{N} \times 100\%$$

---

### 3.2 Texture Features

#### 3.2.1 Tamura Features

Tamura texture features model human visual perception of texture:

##### Coarseness

Measures the scale of texture patterns (fine vs coarse).

**Step 1:** Compute moving averages at different scales $k$:
$$A_k(x, y) = \frac{1}{2^{2k}} \sum_{i=x-2^{k-1}}^{x+2^{k-1}-1} \sum_{j=y-2^{k-1}}^{y+2^{k-1}-1} I(i, j)$$

**Step 2:** Compute horizontal and vertical differences:
$$E_{k,h}(x, y) = |A_k(x + 2^{k-1}, y) - A_k(x - 2^{k-1}, y)|$$
$$E_{k,v}(x, y) = |A_k(x, y + 2^{k-1}) - A_k(x, y - 2^{k-1})|$$

**Step 3:** Find optimal scale $k^*$ that maximizes $E$:
$$k^*(x, y) = \arg\max_k \max(E_{k,h}(x, y), E_{k,v}(x, y))$$

**Step 4:** Coarseness is the average optimal scale:
$$F_{coarseness} = \frac{1}{M \times N} \sum_{x,y} 2^{k^*(x,y)}$$

##### Contrast

Measures the dynamic range of intensity values.

$$F_{contrast} = \frac{\sigma}{\kappa^{1/4}}$$

where:
- $\sigma$ = standard deviation of intensities
- $\kappa$ = kurtosis = $\frac{E[(I - \mu)^4]}{\sigma^4}$

##### Directionality

Measures the presence of oriented patterns.

**Step 1:** Compute gradients using Sobel operators:
$$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix} * I, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix} * I$$

**Step 2:** Compute gradient magnitude and direction:
$$|G| = \sqrt{G_x^2 + G_y^2}$$
$$\theta = \arctan\left(\frac{G_y}{G_x}\right)$$

**Step 3:** Build histogram of significant directions (top 25% by magnitude):
$$H_\theta(i) = \text{count of pixels with } \theta \in \text{bin } i$$

**Step 4:** Compute entropy as directionality measure:
$$F_{directionality} = -\sum_i P(\theta_i) \log P(\theta_i)$$

---

#### 3.2.2 Gabor Filters

Gabor filters capture texture information at different scales and orientations.

**Gabor Kernel:**
$$g(x, y; \lambda, \theta, \psi, \sigma, \gamma) = \exp\left(-\frac{x'^2 + \gamma^2 y'^2}{2\sigma^2}\right) \cos\left(2\pi \frac{x'}{\lambda} + \psi\right)$$

where:
$$x' = x \cos\theta + y \sin\theta$$
$$y' = -x \sin\theta + y \cos\theta$$

**Parameters:**
- $\lambda$ = wavelength (frequencies: 0.1, 0.2)
- $\theta$ = orientation (4 orientations: 0°, 45°, 90°, 135°)
- $\sigma$ = standard deviation of Gaussian envelope
- $\gamma$ = spatial aspect ratio

**Filter Bank:** 8 filters (4 orientations × 2 frequencies)

**Response Features (per filter):**
$$\mu_{gabor} = \text{mean}(I * g)$$
$$\sigma_{gabor} = \text{std}(I * g)$$

---

#### 3.2.3 Local Binary Patterns (LBP)

LBP captures local texture patterns by comparing each pixel with its neighbors.

**LBP Computation:**

For a pixel at $(x_c, y_c)$ with neighbors at radius $R=1$ and $P=8$ points:

$$LBP_{P,R}(x_c, y_c) = \sum_{p=0}^{P-1} s(g_p - g_c) \cdot 2^p$$

where:
$$s(x) = \begin{cases} 1 & \text{if } x \geq 0 \\ 0 & \text{if } x < 0 \end{cases}$$

- $g_c$ = intensity of center pixel
- $g_p$ = intensity of neighbor pixel $p$

**Uniform LBP:**
Only considers "uniform" patterns (at most 2 bitwise transitions):
$$U(LBP) = |s(g_{P-1} - g_c) - s(g_0 - g_c)| + \sum_{p=1}^{P-1} |s(g_p - g_c) - s(g_{p-1} - g_c)|$$

**LBP Histogram:**
$$H_{LBP}(i) = \frac{\text{count of pixels with } LBP = i}{\text{total pixels}}$$

Number of bins: $P + 2 = 10$ (8 uniform patterns + 1 non-uniform + 1 flat)

---

### 3.3 Shape Features

#### 3.3.1 Hu Moments

Hu moments are 7 invariant moments derived from central moments, invariant to translation, scale, and rotation.

**Raw Moments:**
$$m_{pq} = \sum_x \sum_y x^p y^q I(x, y)$$

**Central Moments:**
$$\mu_{pq} = \sum_x \sum_y (x - \bar{x})^p (y - \bar{y})^q I(x, y)$$

where $\bar{x} = \frac{m_{10}}{m_{00}}$ and $\bar{y} = \frac{m_{01}}{m_{00}}$

**Normalized Central Moments:**
$$\eta_{pq} = \frac{\mu_{pq}}{\mu_{00}^\gamma}, \quad \gamma = \frac{p + q}{2} + 1$$

**The 7 Hu Moments:**

$$h_1 = \eta_{20} + \eta_{02}$$

$$h_2 = (\eta_{20} - \eta_{02})^2 + 4\eta_{11}^2$$

$$h_3 = (\eta_{30} - 3\eta_{12})^2 + (3\eta_{21} - \eta_{03})^2$$

$$h_4 = (\eta_{30} + \eta_{12})^2 + (\eta_{21} + \eta_{03})^2$$

$$h_5 = (\eta_{30} - 3\eta_{12})(\eta_{30} + \eta_{12})[(\eta_{30} + \eta_{12})^2 - 3(\eta_{21} + \eta_{03})^2] + (3\eta_{21} - \eta_{03})(\eta_{21} + \eta_{03})[3(\eta_{30} + \eta_{12})^2 - (\eta_{21} + \eta_{03})^2]$$

$$h_6 = (\eta_{20} - \eta_{02})[(\eta_{30} + \eta_{12})^2 - (\eta_{21} + \eta_{03})^2] + 4\eta_{11}(\eta_{30} + \eta_{12})(\eta_{21} + \eta_{03})$$

$$h_7 = (3\eta_{21} - \eta_{03})(\eta_{30} + \eta_{12})[(\eta_{30} + \eta_{12})^2 - 3(\eta_{21} + \eta_{03})^2] - (\eta_{30} - 3\eta_{12})(\eta_{21} + \eta_{03})[3(\eta_{30} + \eta_{12})^2 - (\eta_{21} + \eta_{03})^2]$$

**Log Transform (for better scale invariance):**
$$h'_i = -\text{sign}(h_i) \cdot \log_{10}(|h_i| + 10^{-10})$$

---

#### 3.3.2 Histogram of Oriented Gradients (HOG)

HOG describes shape through the distribution of gradient orientations.

**Step 1:** Compute gradients
$$G_x = I(x+1, y) - I(x-1, y)$$
$$G_y = I(x, y+1) - I(x, y-1)$$

**Step 2:** Compute magnitude and orientation
$$|G| = \sqrt{G_x^2 + G_y^2}$$
$$\theta = \arctan\left(\frac{G_y}{G_x}\right)$$

**Step 3:** Create orientation histogram per cell
- Image resized to 32×64 pixels
- Cell size: 16×16 pixels
- Orientations: 9 bins (0° to 180°, 20° per bin)

**Histogram for cell $(c_x, c_y)$:**
$$H_\theta^{cell}(k) = \sum_{(x,y) \in cell} |G(x,y)| \cdot w_k(\theta(x,y))$$

where $w_k$ distributes the vote to adjacent bins using bilinear interpolation.

**Step 4:** Block normalization (L2-norm)
- Block size: 2×2 cells
- Normalize feature vector within each block:
$$v_{normalized} = \frac{v}{\sqrt{\|v\|^2 + \epsilon^2}}$$

---

#### 3.3.3 Contour Orientation Histogram

Captures the distribution of edge directions in object contours.

**Step 1:** Edge Detection (Canny)
$$E = \text{Canny}(I, \tau_{low}=50, \tau_{high}=150)$$

**Step 2:** Contour Extraction
Find the largest external contour from edge image.

**Step 3:** Compute segment orientations
For consecutive contour points $(p_i, p_{i+1})$:
$$\theta_i = \arctan\left(\frac{p_{i+1}.y - p_i.y}{p_{i+1}.x - p_i.x}\right)$$

**Step 4:** Normalize angles to [0, π)
$$\theta_{norm} = (\theta + \pi) \mod \pi$$

**Step 5:** Build histogram (18 bins, 10° each)
$$H_{contour}(k) = \frac{\text{count of segments in bin } k}{\text{total segments}}$$

**Derived Statistics:**
- Main orientation: $\arg\max_k H_{contour}(k) \times 10°$
- Orientation variance: $\text{Var}(\theta_{norm})$

---

## 4. Similarity Computation

### 4.1 Overall Similarity

The final similarity score is a weighted combination of feature similarities:

$$S_{total} = \frac{\sum_{f \in F} w_f \cdot S_f}{\sum_{f \in F} w_f}$$

where:
- $F$ = set of available features
- $w_f$ = weight for feature $f$
- $S_f$ = similarity score for feature $f$

---

### 4.2 Color Similarity

**Combined Color Similarity:**
$$S_{color} = 0.7 \cdot S_{hist} + 0.2 \cdot S_{dominant} + 0.1 \cdot S_{mean}$$

#### 4.2.1 Histogram Similarity (Chi-Square)

$$\chi^2(H_1, H_2) = \frac{1}{2} \sum_i \frac{(H_1(i) - H_2(i))^2}{H_1(i) + H_2(i) + \epsilon}$$

$$S_{hist} = \frac{1}{1 + \chi^2}$$

#### 4.2.2 Dominant Color Similarity

Uses **Earth Mover's Distance (EMD)** approximation with bidirectional matching:

$$D_{EMD} = \frac{1}{2}\left(\sum_{i} w_i^{(1)} \cdot d_{min}(c_i^{(1)}, C^{(2)}) + \sum_{j} w_j^{(2)} \cdot d_{min}(c_j^{(2)}, C^{(1)})\right)$$

where:
$$d_{min}(c, C) = \min_{c' \in C} \frac{\|c - c'\|_2}{441.67}$$

The normalization constant 441.67 = $\sqrt{255^2 + 255^2 + 255^2}$ (max RGB distance).

$$S_{dominant} = 1 - D_{EMD}$$

#### 4.2.3 Mean Color Similarity

$$S_{mean} = 1 - \frac{\|\mu_1 - \mu_2\|_2}{441.67}$$

---

### 4.3 Texture Similarities

#### 4.3.1 Tamura Similarity

$$S_{tamura} = 0.5 \cdot S_{coarseness} + 0.3 \cdot S_{contrast} + 0.2 \cdot S_{directionality}$$

where:
$$S_{coarseness} = 1 - \min\left(\frac{|c_1 - c_2|}{10}, 1\right)$$
$$S_{contrast} = 1 - \min\left(\frac{|k_1 - k_2|}{100}, 1\right)$$
$$S_{directionality} = 1 - \min\left(\frac{|d_1 - d_2|}{5}, 1\right)$$

#### 4.3.2 Gabor Similarity (Cosine Similarity)

$$S_{gabor} = \frac{v_1 \cdot v_2}{\|v_1\|_2 \cdot \|v_2\|_2}$$

where $v_1, v_2$ are Gabor response vectors.

#### 4.3.3 LBP Similarity

$$S_{LBP} = 0.8 \cdot S_{hist} + 0.2 \cdot S_{stats}$$

**Histogram (Chi-Square):**
$$S_{hist} = \frac{1}{1 + \chi^2(H_1, H_2)}$$

**Statistics:**
$$S_{stats} = 1 - \frac{1}{2}\left(\frac{|\mu_1 - \mu_2|}{255} + \frac{|\sigma_1 - \sigma_2|}{100}\right)$$

---

### 4.4 Shape Similarities

#### 4.4.1 Hu Moments Similarity

Uses weighted Euclidean distance with decreasing weights for higher-order moments:

$$w = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4]$$

$$D_{Hu} = \sqrt{\sum_{i=1}^{7} w_i \cdot (h_i^{(1)} - h_i^{(2)})^2}$$

$$S_{Hu} = \frac{1}{1 + D_{Hu}/10}$$

#### 4.4.2 HOG Similarity (Cosine Similarity)

$$S_{HOG} = \frac{v_1 \cdot v_2}{\|v_1\|_2 \cdot \|v_2\|_2}$$

#### 4.4.3 Contour Orientation Similarity

$$S_{contour} = 0.6 \cdot S_{hist} + 0.25 \cdot S_{angle} + 0.15 \cdot S_{var}$$

**Histogram Similarity:**
$$S_{hist} = \frac{1}{1 + \chi^2}$$

**Main Angle Similarity:**
$$\Delta\theta = \min(|\theta_1 - \theta_2|, 180° - |\theta_1 - \theta_2|)$$
$$S_{angle} = 1 - \frac{\Delta\theta}{90°}$$

**Variance Similarity:**
$$S_{var} = \frac{1}{1 + |\sigma_1^2 - \sigma_2^2|}$$

---

## 5. Score Normalization

### 5.1 Min-Max Normalization

Raw similarity scores are normalized for better visual distinction:

$$S_{norm} = 0.3 + 0.7 \cdot \frac{S - S_{min}}{S_{max} - S_{min}}$$

This maps scores from $[S_{min}, S_{max}]$ to $[0.3, 1.0]$.

### 5.2 Power Transform

A power transformation spreads middle values:

$$S_{final} = S_{norm}^{0.8}$$

### 5.3 Score Clamping

All scores are clamped to valid range:
$$S = \max(0, \min(1, S))$$

---

## 6. Class-Specific Weights

Different object classes use optimized feature weights:

### 6.1 Weight Profiles by Category

| Category | Color | Tamura | Gabor | LBP | Hu | HOG | Contour |
|----------|-------|--------|-------|-----|-----|-----|---------|
| **Vehicles** (car, airplane, boat, bicycle) | 0.15-0.20 | 0.10 | 0.10 | 0.05 | 0.15-0.20 | **0.30** | 0.10 |
| **Animals** (dog, cat, horse) | **0.25** | 0.15 | 0.15 | 0.10 | 0.10 | 0.15 | 0.10 |
| **Birds** | **0.30** | 0.15 | 0.15 | 0.10 | 0.10 | 0.10 | 0.10 |
| **People** | 0.15 | 0.10 | 0.10 | 0.10 | 0.15 | **0.30** | 0.10 |
| **Food** (pizza, apple) | **0.35-0.40** | 0.15-0.20 | 0.15 | 0.10-0.15 | 0.05-0.10 | 0.05 | 0.05 |
| **Objects** (bottle, laptop, umbrella) | 0.20-0.30 | 0.15 | 0.10-0.15 | 0.10 | 0.10-0.15 | 0.15 | 0.10 |
| **Default** | 0.25 | 0.15 | 0.15 | 0.10 | 0.10 | 0.15 | 0.10 |

### 6.2 Class-Specific Thresholds

Minimum similarity thresholds for results:

| Class | Threshold |
|-------|-----------|
| traffic_light | 0.35 |
| car, bicycle, airplane, boat, apple, laptop | 0.30 |
| dog, cat, horse, pizza, bottle, umbrella | 0.25 |
| bird, person | 0.20 |
| Default | 0.25 |

---

## 7. Summary Table

| Feature Type | Method | Dimensionality | Key Invariance |
|--------------|--------|----------------|----------------|
| Color Histogram | RGB/HSV histograms | 96 (48+48) | Rotation, Translation |
| Dominant Colors | K-Means | 5 colors + % | Rotation, Translation |
| Color Moments | Mean, Std | 6 (3+3) | Rotation, Translation |
| Tamura | Coarseness, Contrast, Directionality | 3 | - |
| Gabor | Filter bank responses | 16 (8×2) | Scale, Rotation |
| LBP | Uniform LBP histogram | 10 | Grayscale invariant |
| Hu Moments | 7 invariant moments | 7 | Translation, Scale, Rotation |
| HOG | Gradient histograms | ~36 | - |
| Contour | Orientation histogram | 20 (18+2) | Scale |

---

## References

1. **Hu Moments**: Hu, M. K. (1962). Visual pattern recognition by moment invariants. *IRE Transactions on Information Theory*, 8(2), 179-187.

2. **Tamura Features**: Tamura, H., Mori, S., & Yamawaki, T. (1978). Textural features corresponding to visual perception. *IEEE Transactions on Systems, Man, and Cybernetics*, 8(6), 460-473.

3. **LBP**: Ojala, T., Pietikäinen, M., & Harwood, D. (1996). A comparative study of texture measures with classification based on featured distributions. *Pattern Recognition*, 29(1), 51-59.

4. **HOG**: Dalal, N., & Triggs, B. (2005). Histograms of oriented gradients for human detection. *CVPR 2005*.

5. **Gabor Filters**: Daugman, J. G. (1985). Uncertainty relation for resolution in space, spatial frequency, and orientation optimized by two-dimensional visual cortical filters. *JOSA A*, 2(7), 1160-1169.

6. **YOLOv8**: Jocher, G., Chaurasia, A., & Qiu, J. (2023). YOLO by Ultralytics.

7. **K-Means**: Lloyd, S. (1982). Least squares quantization in PCM. *IEEE Transactions on Information Theory*, 28(2), 129-137.

---

*Document generated for CBIR System - Master S3 Multimedia Project*
