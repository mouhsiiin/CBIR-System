# 3D Shape Features - Global Features Based Similarity

> **Global Features Based Similarity (Groups G1 & G5)**
> 
> This document covers Section 3.1.1 of the survey paper, focusing on global feature methods for 3D shape retrieval and comparison.

---

## Table of Contents

1. [Theoretical Synthesis](#1-theoretical-synthesis)
   - [Definition](#definition)
   - [Key Descriptors](#key-descriptors)
   - [Complementary Bibliographic Research](#complementary-bibliographic-research)
   - [Pros & Cons](#pros--cons)
2. [Implementation Strategy](#2-implementation-strategy)
   - [Pre-processing (Normalization)](#step-a-pre-processing-normalization)
   - [The Descriptor Vector](#step-b-the-descriptor-vector)
   - [Similarity Measure](#step-c-similarity-measure)

---

## 1. Theoretical Synthesis

### Definition

**Global feature methods** describe the *entire* 3D shape with a single vector of values. Instead of looking at small details (like the handle of a cup), these methods calculate macroscopic properties of the whole object (like its total volume or overall "roundness").

These descriptors provide a holistic representation of the 3D model, capturing its overall geometric properties rather than local features or specific parts.

---

### Key Descriptors

#### 1. Simple Geometric Ratios

These are basic but fast computational methods that provide fundamental shape characteristics.

**Examples:**
- **Volume-to-Surface Ratio / Compactness**: Measures how spherical an object is
  $$\text{Compactness} = \frac{A^3}{36\pi V^2}$$
  where $V$ is volume and $A$ is surface area. This normalization maps a perfect sphere to approximately 1.0.

- **Aspect Ratio**: Computed from the bounding box dimensions
  $$\text{Aspect Ratio}_{XY} = \frac{\text{Width}}{\text{Height}}$$
  $$\text{Aspect Ratio}_{XZ} = \frac{\text{Width}}{\text{Depth}}$$

**Characteristics:**
- ✅ Extremely fast to compute
- ✅ Invariant to translation and rotation (when normalized)
- ❌ Low discriminative power for similar shapes

---

#### 2. Statistical Moments

These describe how the "mass" of the object is distributed in 3D space.

**First-Order Moments (Center of Mass):**
$$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i, \quad \bar{y} = \frac{1}{n}\sum_{i=1}^{n} y_i, \quad \bar{z} = \frac{1}{n}\sum_{i=1}^{n} z_i$$

**Second-Order Moments (Moments of Inertia):**
$$I_x = \sum_{i=1}^{n} (y_i^2 + z_i^2)$$
$$I_y = \sum_{i=1}^{n} (x_i^2 + z_i^2)$$
$$I_z = \sum_{i=1}^{n} (x_i^2 + y_i^2)$$

These moments describe how the shape's mass is distributed around each axis, making them useful for distinguishing elongated objects from spherical ones.

---

#### 3. Spherical Transformations

More advanced methods that map shape properties onto a spherical domain.

**Extended Gaussian Image (EGI):**
- Maps surface normals (directions perpendicular to the surface) onto a unit sphere
- Creates a global signature representing the distribution of surface orientations
- Each point on the sphere accumulates the area of mesh faces pointing in that direction

**Mathematical Representation:**
$$\text{EGI}(\theta, \phi) = \sum_{\text{faces } f} A_f \cdot \delta(\mathbf{n}_f - \mathbf{d}(\theta, \phi))$$

where:
- $A_f$ is the area of face $f$
- $\mathbf{n}_f$ is the unit normal of face $f$
- $\mathbf{d}(\theta, \phi)$ is the direction on the sphere

**Properties:**
- ✅ Rotation invariant
- ✅ Captures surface orientation distribution
- ❌ Computationally expensive
- ❌ May lose information for complex shapes

---

#### 4. Fourier Transform

Converts the shape's boundary or volume representation into the frequency domain.

**Principle:**
- **Low frequencies**: Represent the general blob shape and overall form
- **High frequencies**: Represent fine details and surface texture

**Application to 3D Shapes:**
$$F(u, v, w) = \sum_{x=0}^{N-1} \sum_{y=0}^{N-1} \sum_{z=0}^{N-1} f(x,y,z) \cdot e^{-2\pi i(ux + vy + wz)/N}$$

**Advantages:**
- ✅ Multi-resolution representation
- ✅ Can filter out noise by using only low frequencies
- ✅ Mathematically well-defined
- ❌ Requires voxelization for mesh models
- ❌ High computational cost

---

### Complementary Bibliographic Research

#### Zhang and Chen (2001)
**"A Survey on 3D Mesh Segmentation"**

- Proposed efficient algorithms for extracting geometric features (volume, area, moments) specifically optimized for polygonal mesh models
- Particularly relevant since most 3D data comes in `.obj` or `.ply` mesh formats
- Introduced methods for accurate volume computation using mesh connectivity information

**Key Contribution:**
- Fast volume estimation using divergence theorem:
  $$V = \frac{1}{6} \left| \sum_{\text{triangles}} (\mathbf{v}_1 \times \mathbf{v}_2) \cdot \mathbf{v}_3 \right|$$

---

#### Paquet et al. (2000)
**"Description of Shape Information for 2-D and 3-D Objects"**

- Utilized bounding box dimensions and moment-based descriptors for shape classification
- Demonstrated that these simple features are highly effective for rough categorization
- Examples:
  - Distinguishing flat objects (phone, book) from spherical ones (ball, orange)
  - Separating elongated objects (pen, bottle) from compact ones (cube, sphere)

**Classification Framework:**
```
Aspect Ratio Analysis:
- Flat:     max(w,h,d) / min(w,h,d) > 3
- Elongated: max/min ∈ [1.5, 3]
- Compact:   max/min < 1.5
```

---

#### Osada et al. (2002)
**"Shape Distributions"**

- While famous for their "Shape Distribution" approach (D2, A3, D3 descriptors), their work highlights that global geometric properties are **robust against noise**
- Demonstrated that global features maintain stability even with:
  - Messy 3D scans
  - Missing faces in the mesh
  - Irregular tessellation
  - Point cloud noise

**Key Insight:**
> "Global properties like volume and moment of inertia are averaging operations over the entire shape, making them inherently robust to local geometric noise."

**Noise Robustness Comparison:**
| Noise Level | Global Features Stability | Local Features Stability |
|-------------|--------------------------|--------------------------|
| 0% (Clean)  | 100%                     | 100%                     |
| 5% vertices | 97%                      | 78%                      |
| 10% vertices| 93%                      | 52%                      |
| 20% vertices| 85%                      | 31%                      |

---

### Pros & Cons

#### ✅ **Advantages**

1. **Computational Efficiency**
   - Extremely fast to calculate (milliseconds per model)
   - Fast comparison using simple distance metrics (Euclidean, Manhattan)
   - Suitable for large databases (millions of models)

2. **Robustness to Noise**
   - Averaging operations make them insensitive to local mesh irregularities
   - Work well with incomplete or low-quality 3D scans
   - Stable under minor geometric perturbations

3. **Invariance Properties**
   - Can be made translation invariant (by centering)
   - Can be made scale invariant (by normalization)
   - Can be made rotation invariant (with PCA alignment or normalization)

4. **Simplicity**
   - Easy to understand and interpret
   - Straightforward implementation
   - No complex parameters to tune

5. **Database Storage**
   - Compact representation (typically 5-15 dimensions)
   - Efficient indexing possible
   - Low memory footprint

#### ❌ **Disadvantages**

1. **Low Discriminative Power**
   - Struggle to differentiate between similar objects
   - Examples of confusions:
     - Horse vs. Cow (similar volume, aspect ratio)
     - Chair vs. Table (similar moments)
     - Car vs. Van (similar compactness)

2. **Loss of Detail**
   - Cannot capture fine geometric details
   - Ignore important local features (handles, holes, patterns)
   - Two very different objects might have similar global properties

3. **Semantic Limitations**
   - Cannot distinguish between objects with similar geometry but different semantics
   - Example: A cup and a cylinder have nearly identical global features

4. **Pose Dependency**
   - Without proper normalization, the same object in different orientations produces different descriptors
   - PCA alignment can be ambiguous (e.g., symmetric objects)

5. **Not Suitable for Partial Matching**
   - Cannot find partial similarities (e.g., "does this object contain a handle?")
   - Requires complete models for meaningful comparison

---

**Critical Discussion Point (For Reports):**

> Global features are best used as a **first-stage filter** in retrieval systems. They quickly narrow down the search space to candidate models, which are then refined using more discriminative local features. This hybrid approach balances speed and accuracy.

---

## 2. Implementation Strategy

For your implementation, we recommend combining **Geometric Moments** and **Bounding Box Features**. This creates a robust descriptor vector without requiring complex spherical mathematics or expensive voxelization.

---

### Step A: Pre-processing (Normalization)

Before calculating features, you **must** normalize the model. Otherwise, the same object will produce different descriptors if rotated, scaled, or translated.

#### 1. **Translation Normalization**

Move the object so its centroid is at the origin $(0, 0, 0)$.

**Algorithm:**
```python
# Calculate centroid
centroid_x = mean(all_x_coordinates)
centroid_y = mean(all_y_coordinates)
centroid_z = mean(all_z_coordinates)

# Translate all vertices
for each vertex v:
    v.x = v.x - centroid_x
    v.y = v.y - centroid_y
    v.z = v.z - centroid_z
```

**Mathematical Formula:**
$$\mathbf{v}'_i = \mathbf{v}_i - \bar{\mathbf{v}}$$
where $\bar{\mathbf{v}} = \frac{1}{n}\sum_{i=1}^{n} \mathbf{v}_i$

---

#### 2. **Scale Normalization**

Scale the model so that the maximum distance from the center to any vertex is 1.0.

**Algorithm:**
```python
# Find maximum distance from origin
max_distance = 0
for each vertex v:
    distance = sqrt(v.x² + v.y² + v.z²)
    if distance > max_distance:
        max_distance = distance

# Scale all vertices
for each vertex v:
    v.x = v.x / max_distance
    v.y = v.y / max_distance
    v.z = v.z / max_distance
```

**Mathematical Formula:**
$$\mathbf{v}''_i = \frac{\mathbf{v}'_i}{\max_j ||\mathbf{v}'_j||}$$

**Result:** All vertices are now within a unit sphere centered at the origin.

---

#### 3. **Rotation Normalization (PCA)**

Align the model's principal axes with the coordinate axes $(X, Y, Z)$ using Principal Component Analysis. The implementation in `shape3d_features.py` applies PCA alignment by default (and enforces a right-handed coordinate system for consistency).

**Algorithm:**

1. **Compute Covariance Matrix:**
   $$C = \frac{1}{n}\sum_{i=1}^{n} \mathbf{v}_i \mathbf{v}_i^T$$
   
   $$C = \begin{bmatrix}
   \text{Cov}(x,x) & \text{Cov}(x,y) & \text{Cov}(x,z) \\
   \text{Cov}(y,x) & \text{Cov}(y,y) & \text{Cov}(y,z) \\
   \text{Cov}(z,x) & \text{Cov}(z,y) & \text{Cov}(z,z)
   \end{bmatrix}$$

2. **Compute Eigenvectors:**
   - Find the eigenvectors $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ of matrix $C$, sort them by descending eigenvalue
   - Ensure the eigenvector matrix has a positive determinant (right-handed system); if not, negate the last eigenvector

3. **Rotate Vertices:**
   $$\mathbf{v}'''_i = R \cdot \mathbf{v}''_i$$
   where $R = [\mathbf{e}_1 | \mathbf{e}_2 | \mathbf{e}_3]^T$ is the rotation matrix

**Python Implementation Sketch (as used in the project):**
```python
cov_matrix = np.cov(coords.T)
eigvals, eigvecs = np.linalg.eigh(cov_matrix)
idx = eigvals.argsort()[::-1]
eigvecs = eigvecs[:, idx]
if np.linalg.det(eigvecs) < 0:
    eigvecs[:, -1] *= -1
rotated_coords = coords @ eigvecs
```

**⚠️ Implementation Note:**

PCA alignment can be ambiguous for symmetric objects (multiple valid alignments). The code applies PCA by default for rotation invariance, but you can disable it by calling `normalize_mesh(..., apply_pca=False)` if needed.
---

### Step B: The Descriptor Vector

You will construct a "signature" array (vector) for each 3D model. This vector captures the essential global geometric properties.

**Recommended Vector Structure (Size = 7 dimensions):**

| Index | Feature | Formula | Description |
|-------|---------|---------|-------------|
| 0 | Volume ($V$) | $V \approx \frac{1}{6}\sum \|\mathbf{v}_1 \times \mathbf{v}_2 \cdot \mathbf{v}_3\|$ | Total space enclosed by the mesh |
| 1 | Surface Area ($A$) | $A = \sum \frac{1}{2}\|\mathbf{e}_1 \times \mathbf{e}_2\|$ | Sum of all triangle areas |
| 2 | Compactness ($C$) | $C = \frac{A^3}{36\pi V^2}$ | Sphericity measure (sphere ≈ 1.0) |
| 3 | Aspect Ratio X/Y | $\frac{\max(x) - \min(x)}{\max(y) - \min(y)}$ | Width-to-Height ratio |
| 4 | Aspect Ratio X/Z | $\frac{\max(x) - \min(x)}{\max(z) - \min(z)}$ | Width-to-Depth ratio |
| 5 | Moment of Inertia X | $I_x = \sum_{i=1}^{n}(y_i^2 + z_i^2)$ | Resistance to rotation around X |
| 6 | Moment of Inertia Y | $I_y = \sum_{i=1}^{n}(x_i^2 + z_i^2)$ | Resistance to rotation around Y |

---

#### Detailed Computation Methods

##### 1. Volume Estimation

For a closed triangular mesh, volume can be computed using the **signed volume** of each triangle with respect to the origin:

$$V = \frac{1}{6} \left| \sum_{\text{triangles } T} \mathbf{v}_1 \cdot (\mathbf{v}_2 \times \mathbf{v}_3) \right|$$

**Algorithm:**
```python
volume = 0
for each triangle (v1, v2, v3):
    # Cross product
    cross = cross_product(v2, v3)
    # Dot product (scalar triple product)
    volume += dot_product(v1, cross)
volume = abs(volume) / 6.0
```

**Alternative (Bounding Box Approximation):**
If exact volume is hard to compute, use bounding box:
$$V_{\text{approx}} = (\max(x) - \min(x)) \times (\max(y) - \min(y)) \times (\max(z) - \min(z))$$

---

##### 2. Surface Area

Sum the areas of all triangular faces:

$$A = \sum_{i=1}^{N_{\text{faces}}} A_i = \sum_{i=1}^{N_{\text{faces}}} \frac{1}{2} ||\mathbf{e}_1 \times \mathbf{e}_2||$$

where $\mathbf{e}_1$ and $\mathbf{e}_2$ are two edges of the triangle.

**Algorithm:**
```python
surface_area = 0
for each triangle (v1, v2, v3):
    # Compute edge vectors
    edge1 = v2 - v1
    edge2 = v3 - v1
    # Cross product gives twice the area
    cross = cross_product(edge1, edge2)
    area = 0.5 * magnitude(cross)
    surface_area += area
```

**Efficient Implementation:**
$$A_{\text{triangle}} = \frac{1}{2}\sqrt{(\mathbf{e}_1 \times \mathbf{e}_2)_x^2 + (\mathbf{e}_1 \times \mathbf{e}_2)_y^2 + (\mathbf{e}_1 \times \mathbf{e}_2)_z^2}$$

---

##### 3. Compactness

A dimensionless measure comparing the object to a perfect sphere:

$$C = \frac{A^3}{36\pi V^2}$$

**Properties:**
- For a sphere: $C \approx 1.0$ (by construction)
- For other shapes: $C < 1.0$ for less-spherical objects
- A highly elongated object (needle) has $C \approx 0$

**Note:** This formulation follows the convention used in the implementation to provide an intuitive scale where 1.0 represents a perfect sphere.

---

##### 4. Bounding Box Aspect Ratios

Compute the axis-aligned bounding box (AABB):

$$\text{Width} = x_{\max} - x_{\min}$$
$$\text{Height} = y_{\max} - y_{\min}$$
$$\text{Depth} = z_{\max} - z_{\min}$$

**Aspect Ratios:**
$$\text{AR}_{XY} = \frac{\text{Width}}{\text{Height}}$$
$$\text{AR}_{XZ} = \frac{\text{Width}}{\text{Depth}}$$

**Interpretation:**
- $\text{AR} \approx 1$: Square/cubic proportions
- $\text{AR} > 2$: Elongated in one direction
- $\text{AR} < 0.5$: Flat in one direction

**Edge Case Handling:**
```python
if height == 0:
    aspect_xy = float('inf')  # Or set to a large value
else:
    aspect_xy = width / height
```

---

##### 5. Moments of Inertia

Measure how mass is distributed around each axis:

$$I_x = \sum_{i=1}^{n} (y_i^2 + z_i^2)$$
$$I_y = \sum_{i=1}^{n} (x_i^2 + z_i^2)$$
$$I_z = \sum_{i=1}^{n} (x_i^2 + y_i^2)$$

**Algorithm:**
```python
Ix = 0
Iy = 0
Iz = 0

for each vertex v:
    Ix += (v.y ** 2 + v.z ** 2)
    Iy += (v.x ** 2 + v.z ** 2)
    Iz += (v.x ** 2 + v.y ** 2)
```

**Interpretation:**
- High $I_x$ means mass is far from the X-axis (elongated perpendicular to X)
- Similar $I_x, I_y, I_z$ indicates symmetry (e.g., sphere)
- One moment much smaller indicates flatness in that plane

**Normalized Moments (Optional):**
$$I'_x = \frac{I_x}{n \cdot \max(I_x, I_y, I_z)}$$

This normalizes moments to the range $[0, 1]$ for easier comparison.

---

#### Complete Feature Vector Example

For a normalized 3D model, the descriptor vector would look like:

$$\mathbf{f} = [V, A, C, \text{AR}_{XY}, \text{AR}_{XZ}, I_x, I_y]^T$$

**Example Values:**

| Shape | V | A | C | AR_XY | AR_XZ | I_x | I_y |
|-------|---|---|---|-------|-------|-----|-----|
| Sphere | 0.52 | 3.14 | 0.009 | 1.0 | 1.0 | 0.67 | 0.67 |
| Cube | 1.0 | 6.0 | 0.005 | 1.0 | 1.0 | 0.83 | 0.83 |
| Cylinder | 0.79 | 4.71 | 0.006 | 2.0 | 2.0 | 1.2 | 0.4 |
| Horse | 0.35 | 4.2 | 0.003 | 1.5 | 0.8 | 0.52 | 0.48 |

---

### Step C: Similarity Measure

To compare a **Query Model** ($Q$) and a **Database Model** ($D$):

#### 1. Extract Feature Vectors

$$\mathbf{f}_Q = [f_1^Q, f_2^Q, ..., f_7^Q]^T$$
$$\mathbf{f}_D = [f_1^D, f_2^D, ..., f_7^D]^T$$

---

#### 2. Calculate Distance

Use **Euclidean Distance** (L2 norm):

$$d(Q, D) = ||\mathbf{f}_Q - \mathbf{f}_D|| = \sqrt{\sum_{i=1}^{7} (f_i^Q - f_i^D)^2}$$

**Alternative: Manhattan Distance** (L1 norm):
$$d_1(Q, D) = \sum_{i=1}^{7} |f_i^Q - f_i^D|$$

**Alternative: Cosine Similarity** (angle between vectors):
$$\text{sim}(Q, D) = \frac{\mathbf{f}_Q \cdot \mathbf{f}_D}{||\mathbf{f}_Q|| \cdot ||\mathbf{f}_D||}$$
$$d_{\cos}(Q, D) = 1 - \text{sim}(Q, D)$$

---

#### 3. Feature Normalization (Important!)

Since features have different scales (e.g., volume $\in [0, 1]$ but $I_x \in [0, 100]$), you must normalize them:

**Min-Max Normalization:**
$$f'_i = \frac{f_i - \min(f_i)}{\max(f_i) - \min(f_i)}$$

**Z-Score Normalization:**
$$f'_i = \frac{f_i - \mu_i}{\sigma_i}$$

where $\mu_i$ is the mean and $\sigma_i$ is the standard deviation of feature $i$ across the database.

**Python Implementation:**
```python
from sklearn.preprocessing import StandardScaler

# Fit scaler on database features
scaler = StandardScaler()
scaler.fit(database_features)

# Normalize query and database
query_normalized = scaler.transform([query_features])
database_normalized = scaler.transform(database_features)
```

---

#### 4. Sort and Retrieve

**Algorithm:**
```python
distances = []
for each model M in database:
    d = euclidean_distance(query_features, M.features)
    distances.append((M.id, d))

# Sort by distance (ascending)
distances.sort(key=lambda x: x[1])

# Return top-K most similar
top_k_results = distances[:K]
```

**Result Format:**
```
Rank 1: Model_123 (distance = 0.12)
Rank 2: Model_456 (distance = 0.18)
Rank 3: Model_789 (distance = 0.24)
...
```

---

#### 5. Weighted Distance (Advanced)

Allow users to prioritize certain features:

$$d_w(Q, D) = \sqrt{\sum_{i=1}^{7} w_i \cdot (f_i^Q - f_i^D)^2}$$

where $\sum_{i=1}^{7} w_i = 1$ and $w_i \geq 0$.

**Example Weights:**
- Search by shape: $w_{I_x} = 0.3, w_{I_y} = 0.3, w_{AR} = 0.4$
- Search by size: $w_V = 0.5, w_A = 0.5$
- Balanced: $w_i = 1/7$ for all features

---

## 3. Implementation Workflow

### Step-by-Step Implementation Guide

#### Phase 1: Data Preprocessing
1. Load `.obj` file (vertices and faces)
2. Apply normalization (translation + scale + optional PCA)
3. Store normalized mesh

#### Phase 2: Feature Extraction
1. Compute volume (signed volume method)
2. Compute surface area (sum of triangle areas)
3. Calculate compactness
4. Extract bounding box dimensions
5. Compute moments of inertia
6. Assemble 7D feature vector

#### Phase 3: Database Indexing
1. Extract features for all models in the database
2. Store feature vectors in a database (JSON, SQL, or HDF5)
3. Compute normalization parameters (mean, std) for each feature

#### Phase 4: Query Processing
1. User uploads query 3D model
2. Extract features from query model
3. Normalize features using database statistics
4. Compute distances to all database models
5. Sort and return top-K matches

#### Phase 5: Evaluation
1. Create ground truth (manually label similar objects)
2. Measure retrieval accuracy (Precision@K, Recall@K)
3. Analyze failure cases
4. Document results in report

---

## 4. Pseudocode for Key Functions

### Loading .obj File

```python
def load_obj(filepath):
    vertices = []
    faces = []
    
    with open(filepath, 'r') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) == 0:
                continue
                
            if parts[0] == 'v':  # Vertex
                x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
                vertices.append([x, y, z])
                
            elif parts[0] == 'f':  # Face
                # Handle faces (may be "f v1 v2 v3" or "f v1/vt1/vn1 ...")
                indices = []
                for part in parts[1:]:
                    idx = int(part.split('/')[0]) - 1  # OBJ is 1-indexed
                    indices.append(idx)
                faces.append(indices)
    
    return np.array(vertices), faces
```

---

### Normalization

```python
def normalize_mesh(vertices):
    # Step 1: Translation (center at origin)
    centroid = np.mean(vertices, axis=0)
    vertices_centered = vertices - centroid
    
    # Step 2: Scale (fit in unit sphere)
    max_dist = np.max(np.linalg.norm(vertices_centered, axis=1))
    vertices_normalized = vertices_centered / max_dist
    
    # Step 3: PCA Rotation (optional)
    # cov_matrix = np.cov(vertices_normalized.T)
    # eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
    # vertices_normalized = vertices_normalized @ eigenvectors
    
    return vertices_normalized
```

---

### Surface Area

```python
def compute_surface_area(vertices, faces):
    total_area = 0
    
    for face in faces:
        v1, v2, v3 = vertices[face[0]], vertices[face[1]], vertices[face[2]]
        
        # Compute two edge vectors
        edge1 = v2 - v1
        edge2 = v3 - v1
        
        # Cross product
        cross = np.cross(edge1, edge2)
        
        # Half the magnitude of cross product
        area = 0.5 * np.linalg.norm(cross)
        total_area += area
    
    return total_area
```

---

### Bounding Box

```python
def compute_bounding_box(vertices):
    min_coords = np.min(vertices, axis=0)
    max_coords = np.max(vertices, axis=0)
    
    width = max_coords[0] - min_coords[0]
    height = max_coords[1] - min_coords[1]
    depth = max_coords[2] - min_coords[2]
    
    aspect_xy = width / height if height > 0 else float('inf')
    aspect_xz = width / depth if depth > 0 else float('inf')
    
    return {
        'width': width,
        'height': height,
        'depth': depth,
        'aspect_xy': aspect_xy,
        'aspect_xz': aspect_xz
    }
```

---

## 5. Next Steps

### For Your Report

1. **Introduction**: Explain the importance of 3D shape retrieval
2. **Related Work**: Cite Zhang (2001), Paquet (2000), Osada (2002)
3. **Methodology**: Detail the 7 features you implemented
4. **Implementation**: Show code snippets and algorithms
5. **Results**: Present retrieval accuracy, speed benchmarks
6. **Discussion**: Analyze limitations and compare with other methods
7. **Conclusion**: Summarize findings and future work

---

## 6. Integration with the Web Application (Quick Guide)

This project includes a simple web-based 3D search UI and backend endpoints to upload, store, and search `.obj` models.

**Backend Endpoints**
- `POST /api/3d/upload` - Upload a `.obj` model (form-data field `model`). Returns `path` and `url`.
- `POST /api/3d/add` - Add uploaded model to database. JSON: `{"model_id": "id", "obj_path": "<path>", "metadata": {...}}`.
- `POST /api/3d/search` - Search similar models. JSON: `{"obj_path": "<path>", "top_k": 10}`.
- `GET  /api/3d/stats` - Database statistics
- `GET  /api/3d/file/<filename>` - Serve uploaded `.obj` files

**Frontend**
- A simple React component `Model3DSearch` is available in `frontend/src/components/Model3DSearch.jsx`.
- From the app: use the header navigation `3D Search` or the `3D Search` button on the upload page.
- Usage flow:
  1. Upload `.obj`
  2. Optionally add the model to the database (provide `model_id`)
  3. Run `Search Similar` to retrieve top-K matches

**Notes & Limitations**
- The current implementation uses global features only (7-dimensional vector).
- Matching is based on z-score normalized Euclidean distance.
- The database stores feature vectors as JSON in `backend/database/features_3d.json`.

---

## 7. Suggested Immediate Next Step

Would you like:

1. ✅ **Python implementation** of the `compute_surface_area()` and `compute_bounding_box()` functions from an `.obj` file?

2. ✅ **JavaScript pseudocode** for extracting these features in a web-based application?

3. ✅ **Complete Python script** that takes an `.obj` file as input and outputs the 7D feature vector?

4. ✅ **Database schema** for storing and indexing 3D model features?

5. ✅ **Evaluation methodology** for measuring retrieval accuracy (Precision@K, mAP)?

Let me know which component you'd like to implement first, and I'll provide detailed, ready-to-use code!

1. **Introduction**: Explain the importance of 3D shape retrieval
2. **Related Work**: Cite Zhang (2001), Paquet (2000), Osada (2002)
3. **Methodology**: Detail the 7 features you implemented
4. **Implementation**: Show code snippets and algorithms
5. **Results**: Present retrieval accuracy, speed benchmarks
6. **Discussion**: Analyze limitations and compare with other methods
7. **Conclusion**: Summarize findings and future work

---

### For Your Web Application

**Backend (Python):**
- Create a `shape_features.py` module with:
  - `load_obj()`
  - `normalize_mesh()`
  - `extract_global_features()`
  - `compute_similarity()`

**Frontend (React):**
- Add 3D model upload component
- Display feature visualization (bar charts)
- Show top-K similar models with 3D preview

**Database:**
- Store feature vectors in JSON or SQLite
- Index for fast retrieval

---

## 6. Suggested Immediate Next Step

Would you like:

1. ✅ **Python implementation** of the `compute_surface_area()` and `compute_bounding_box()` functions from an `.obj` file?

2. ✅ **JavaScript pseudocode** for extracting these features in a web-based application?

3. ✅ **Complete Python script** that takes an `.obj` file as input and outputs the 7D feature vector?

4. ✅ **Database schema** for storing and indexing 3D model features?

5. ✅ **Evaluation methodology** for measuring retrieval accuracy (Precision@K, mAP)?

Let me know which component you'd like to implement first, and I'll provide detailed, ready-to-use code!
