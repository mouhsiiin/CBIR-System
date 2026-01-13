# backend/services/shape3d_features.py
"""
3D Shape Feature Extraction Service
Implements Global Features Based Similarity (Groups G1 & G5)
"""

import numpy as np
from pathlib import Path
import json


class Shape3DFeatureExtractor:
    """Extract global geometric features from 3D models (.obj files)"""
    
    def __init__(self):
        self.feature_names = [
            'volume', 'surface_area', 'compactness', 
            'aspect_ratio_xy', 'aspect_ratio_xz',
            'moment_inertia_x', 'moment_inertia_y'
        ]
    
    def load_obj(self, filepath):
        """
        Load vertices and faces from .obj file
        
        Args:
            filepath: Path to .obj file
            
        Returns:
            vertices: numpy array of shape (N, 3)
            faces: list of face indices (triangles)
        """
        vertices = []
        faces = []
        
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) == 0:
                        continue
                    
                    if parts[0] == 'v':  # Vertex
                        x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
                        vertices.append([x, y, z])
                    
                    elif parts[0] == 'f':  # Face
                        # Handle different face formats: "v", "v/vt", "v/vt/vn", "v//vn"
                        indices = []
                        for part in parts[1:]:
                            # Get first index (vertex index)
                            idx = int(part.split('/')[0]) - 1  # OBJ is 1-indexed
                            indices.append(idx)
                        
                        # Triangulate if needed (for quad faces)
                        if len(indices) == 3:
                            faces.append(indices)
                        elif len(indices) == 4:
                            # Split quad into two triangles
                            faces.append([indices[0], indices[1], indices[2]])
                            faces.append([indices[0], indices[2], indices[3]])
            
            if len(vertices) == 0:
                raise ValueError("No vertices found in .obj file")
            
            return np.array(vertices, dtype=np.float64), faces
        
        except Exception as e:
            raise ValueError(f"Error loading .obj file: {str(e)}")
    
    def normalize_mesh(self, vertices, apply_pca=True):
        """
        Normalize mesh: translation to origin + optional PCA rotation + scale to unit sphere
        
        Args:
            vertices: numpy array of shape (N, 3)
            apply_pca: whether to align principal axes via PCA
            
        Returns:
            normalized vertices
        """
        # Step 1: Translation - center at origin
        centroid = np.mean(vertices, axis=0)
        vertices_centered = vertices - centroid

        # Step 2: PCA rotation (optional) - align principal axes with coordinate axes
        if apply_pca and len(vertices_centered) > 3:
            cov = np.cov(vertices_centered.T)
            # Use eigh for symmetric covariance matrix
            eigvals, eigvecs = np.linalg.eigh(cov)
            # Sort eigenvectors by descending eigenvalue
            idx = np.argsort(eigvals)[::-1]
            eigvecs = eigvecs[:, idx]

            # Ensure right-handed coordinate system (positive determinant)
            if np.linalg.det(eigvecs) < 0:
                eigvecs[:, -1] *= -1

            # Rotate vertices
            vertices_centered = vertices_centered @ eigvecs

        # Step 3: Scale - fit in unit sphere
        distances = np.linalg.norm(vertices_centered, axis=1)
        max_dist = np.max(distances)

        if max_dist > 0:
            vertices_normalized = vertices_centered / max_dist
        else:
            vertices_normalized = vertices_centered

        return vertices_normalized
    
    def compute_volume(self, vertices, faces):
        """
        Compute volume using signed volume method
        
        For a closed triangular mesh:
        V = (1/6) * |Σ v1 · (v2 × v3)|
        
        Args:
            vertices: numpy array of shape (N, 3)
            faces: list of face indices
            
        Returns:
            volume (float)
        """
        volume = 0.0
        
        for face in faces:
            if len(face) < 3:
                continue
            
            v1 = vertices[face[0]]
            v2 = vertices[face[1]]
            v3 = vertices[face[2]]
            
            # Scalar triple product: v1 · (v2 × v3)
            cross = np.cross(v2, v3)
            volume += np.dot(v1, cross)
        
        return abs(volume) / 6.0
    
    def compute_surface_area(self, vertices, faces):
        """
        Compute total surface area by summing triangle areas
        
        Area of triangle = 0.5 * ||edge1 × edge2||
        
        Args:
            vertices: numpy array of shape (N, 3)
            faces: list of face indices
            
        Returns:
            surface area (float)
        """
        total_area = 0.0
        
        for face in faces:
            if len(face) < 3:
                continue
            
            v1 = vertices[face[0]]
            v2 = vertices[face[1]]
            v3 = vertices[face[2]]
            
            # Compute edge vectors
            edge1 = v2 - v1
            edge2 = v3 - v1
            
            # Cross product magnitude gives twice the area
            cross = np.cross(edge1, edge2)
            area = 0.5 * np.linalg.norm(cross)
            total_area += area
        
        return total_area
    
    def compute_compactness(self, volume, surface_area):
        """
        Compute compactness as requested:
        C = A^3 / (36 * pi * V^2)
        This normalizes compactness so that a perfect sphere has C ≈ 1.0

        Args:
            volume: volume of the mesh
            surface_area: surface area of the mesh

        Returns:
            compactness (float)
        """
        import math
        if volume > 0:
            return (surface_area ** 3) / (36.0 * math.pi * (volume ** 2))
        return 0.0
    
    def compute_bounding_box(self, vertices):
        """
        Compute axis-aligned bounding box dimensions and aspect ratios
        
        Args:
            vertices: numpy array of shape (N, 3)
            
        Returns:
            dict with width, height, depth, and aspect ratios
        """
        min_coords = np.min(vertices, axis=0)
        max_coords = np.max(vertices, axis=0)
        
        width = max_coords[0] - min_coords[0]
        height = max_coords[1] - min_coords[1]
        depth = max_coords[2] - min_coords[2]
        
        # Compute aspect ratios (with safety check)
        aspect_xy = width / height if height > 1e-6 else 1.0
        aspect_xz = width / depth if depth > 1e-6 else 1.0
        
        return {
            'width': float(width),
            'height': float(height),
            'depth': float(depth),
            'aspect_xy': float(aspect_xy),
            'aspect_xz': float(aspect_xz)
        }
    
    def compute_moments_of_inertia(self, vertices):
        """
        Compute moments of inertia around each axis
        
        Ix = Σ (y^2 + z^2)
        Iy = Σ (x^2 + z^2)
        Iz = Σ (x^2 + y^2)
        
        Args:
            vertices: numpy array of shape (N, 3)
            
        Returns:
            dict with Ix, Iy, Iz
        """
        x = vertices[:, 0]
        y = vertices[:, 1]
        z = vertices[:, 2]
        
        Ix = np.sum(y**2 + z**2)
        Iy = np.sum(x**2 + z**2)
        Iz = np.sum(x**2 + y**2)
        
        # Normalize by number of vertices
        n = len(vertices)
        
        return {
            'Ix': float(Ix / n),
            'Iy': float(Iy / n),
            'Iz': float(Iz / n)
        }
    
    def extract_features(self, obj_path):
        """
        Extract all 7 global features from a 3D model
        
        Args:
            obj_path: Path to .obj file
            
        Returns:
            dict with all features
        """
        # Load mesh
        vertices, faces = self.load_obj(obj_path)
        
        # Normalize mesh (apply PCA alignment by default)
        vertices_normalized = self.normalize_mesh(vertices, apply_pca=True)
        
        # Compute geometric features
        volume = self.compute_volume(vertices_normalized, faces)
        surface_area = self.compute_surface_area(vertices_normalized, faces)
        compactness = self.compute_compactness(volume, surface_area)
        
        # Bounding box features
        bbox = self.compute_bounding_box(vertices_normalized)
        
        # Moments of inertia
        moments = self.compute_moments_of_inertia(vertices_normalized)
        
        # Assemble feature vector
        features = {
            'volume': volume,
            'surface_area': surface_area,
            'compactness': compactness,
            'aspect_ratio_xy': bbox['aspect_xy'],
            'aspect_ratio_xz': bbox['aspect_xz'],
            'moment_inertia_x': moments['Ix'],
            'moment_inertia_y': moments['Iy']
        }
        
        # Also store detailed info
        features['mesh_info'] = {
            'num_vertices': len(vertices),
            'num_faces': len(faces),
            'bounding_box': {
                'width': bbox['width'],
                'height': bbox['height'],
                'depth': bbox['depth']
            }
        }
        
        return features
    
    def get_feature_vector(self, features):
        """
        Convert features dict to numpy array (7D vector)
        
        Args:
            features: dict with feature names and values
            
        Returns:
            numpy array of shape (7,)
        """
        return np.array([
            features['volume'],
            features['surface_area'],
            features['compactness'],
            features['aspect_ratio_xy'],
            features['aspect_ratio_xz'],
            features['moment_inertia_x'],
            features['moment_inertia_y']
        ])


class Shape3DSimilaritySearch:
    """Similarity search for 3D models using global features"""
    
    def __init__(self, database_path):
        """
        Initialize similarity search
        
        Args:
            database_path: Path to JSON database storing 3D features
        """
        self.database_path = Path(database_path)
        self.extractor = Shape3DFeatureExtractor()
        self.database = self._load_database()
        
    def _load_database(self):
        """Load database from JSON file"""
        if self.database_path.exists():
            with open(self.database_path, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_database(self):
        """Save database to JSON file"""
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.database_path, 'w') as f:
            json.dump(self.database, f, indent=2)
    
    def add_model(self, model_id, obj_path, metadata=None):
        """
        Add a 3D model to the database
        
        Args:
            model_id: Unique identifier for the model
            obj_path: Path to .obj file
            metadata: Optional metadata (name, description, etc.)
            
        Returns:
            Extracted features
        """
        features = self.extractor.extract_features(obj_path)
        
        self.database[model_id] = {
            'features': features,
            'obj_path': str(obj_path),
            'metadata': metadata or {}
        }
        
        self._save_database()
        return features
    
    def search_similar(self, query_obj_path, top_k=10, weights=None):
        """
        Search for similar 3D models
        
        Args:
            query_obj_path: Path to query .obj file
            top_k: Number of results to return
            weights: Optional feature weights (7D array)
            
        Returns:
            List of (model_id, distance, features) tuples
        """
        # Extract features from query
        query_features = self.extractor.extract_features(query_obj_path)
        query_vector = self.extractor.get_feature_vector(query_features)
        
        # Normalize features using database statistics
        query_normalized = self._normalize_features(query_vector)
        
        # Compute distances to all models in database
        results = []
        for model_id, model_data in self.database.items():
            db_features = model_data['features']
            db_vector = self.extractor.get_feature_vector(db_features)
            db_normalized = self._normalize_features(db_vector)
            
            # Compute weighted Euclidean distance
            if weights is not None:
                distance = np.sqrt(np.sum(weights * (query_normalized - db_normalized) ** 2))
            else:
                distance = np.linalg.norm(query_normalized - db_normalized)
            
            results.append({
                'model_id': model_id,
                'distance': float(distance),
                'features': db_features,
                'obj_path': model_data['obj_path'],
                'metadata': model_data.get('metadata', {})
            })
        
        # Sort by distance (ascending)
        results.sort(key=lambda x: x['distance'])
        
        return results[:top_k]
    
    def _normalize_features(self, feature_vector):
        """
        Normalize feature vector using database statistics (z-score)
        
        Args:
            feature_vector: numpy array of shape (7,)
            
        Returns:
            normalized vector
        """
        if len(self.database) < 2:
            return feature_vector
        
        # Collect all feature vectors from database
        all_vectors = []
        for model_data in self.database.values():
            vec = self.extractor.get_feature_vector(model_data['features'])
            all_vectors.append(vec)
        
        all_vectors = np.array(all_vectors)
        
        # Compute mean and std
        mean = np.mean(all_vectors, axis=0)
        std = np.std(all_vectors, axis=0)
        
        # Avoid division by zero
        std[std < 1e-6] = 1.0
        
        # Z-score normalization
        normalized = (feature_vector - mean) / std
        
        return normalized
    
    def get_database_stats(self):
        """Get statistics about the database"""
        if len(self.database) == 0:
            return {'count': 0}
        
        all_vectors = []
        for model_data in self.database.values():
            vec = self.extractor.get_feature_vector(model_data['features'])
            all_vectors.append(vec)
        
        all_vectors = np.array(all_vectors)
        
        return {
            'count': len(self.database),
            'feature_means': all_vectors.mean(axis=0).tolist(),
            'feature_stds': all_vectors.std(axis=0).tolist(),
            'feature_names': self.extractor.feature_names
        }
