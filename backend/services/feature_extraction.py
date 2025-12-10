# /home/muhammed/Documents/SmartGallery/backend/services/feature_extraction.py
"""
Feature Extraction Service for CBIR System
Extracts visual features from detected objects including:
- Color features (histograms, dominant colors, color moments)
- Texture features (Tamura, Gabor, LBP)
- Shape features (Hu moments, HOG, contour orientation histogram)
"""

import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops, hog, local_binary_pattern
from skimage.filters import gabor_kernel
from scipy import ndimage
from scipy.signal import convolve2d
from sklearn.cluster import KMeans
import colorsys

class FeatureExtractionService:
    """Service for extracting visual features from image regions"""
    
    def __init__(self):
        self.gabor_kernels = self._prepare_gabor_kernels()
    
    def _prepare_gabor_kernels(self):
        """Prepare Gabor filter bank - OPTIMIZED"""
        kernels = []
        # 4 orientations, 2 frequencies (instead of 5)
        for theta in range(4):
            theta = theta / 4. * np.pi
            for frequency in (0.1, 0.2):  # Only 2 frequencies
                kernel = np.real(gabor_kernel(frequency, theta=theta))
                kernels.append(kernel)
        return kernels
    
    def extract_all_features(self, image_path, bbox):
        """
        Extract all features from an object region
        
        Args:
            image_path: Path to image
            bbox: Bounding box [x1, y1, x2, y2]
            
        Returns:
            Dictionary with all features
        """
        # Load image and extract region
        img = cv2.imread(str(image_path))
        x1, y1, x2, y2 = [int(v) for v in bbox]
        roi = img[y1:y2, x1:x2]
        
        if roi.size == 0:
            return None
        
        features = {
            'color': self.extract_color_features(roi),
            'texture_tamura': self.extract_tamura_features(roi),
            'texture_gabor': self.extract_gabor_features(roi),
            'texture_lbp': self.extract_lbp_features(roi),
            'shape_hu': self.extract_hu_moments(roi),
            'shape_hog': self.extract_hog_features(roi),
            'shape_contour': self.extract_contour_orientation_histogram(roi)
        }
        
        return features
    
    def extract_color_features(self, roi):
        """Extract color histogram and dominant colors using K-Means"""
        # Convert to RGB and HSV
        rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        
        # Simpler histograms with fewer bins
        hist_r = cv2.calcHist([rgb], [0], None, [16], [0, 256]).flatten()  # 32→16 bins
        hist_g = cv2.calcHist([rgb], [1], None, [16], [0, 256]).flatten()
        hist_b = cv2.calcHist([rgb], [2], None, [16], [0, 256]).flatten()
        hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180]).flatten()
        hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256]).flatten()
        hist_v = cv2.calcHist([hsv], [2], None, [16], [0, 256]).flatten()
        
        # Normalize
        hist_r = hist_r / (hist_r.sum() + 1e-7)
        hist_g = hist_g / (hist_g.sum() + 1e-7)
        hist_b = hist_b / (hist_b.sum() + 1e-7)
        hist_h = hist_h / (hist_h.sum() + 1e-7)
        hist_s = hist_s / (hist_s.sum() + 1e-7)
        hist_v = hist_v / (hist_v.sum() + 1e-7)
        
        # Simple color moments (no KMeans!)
        mean_rgb = np.mean(rgb, axis=(0, 1))
        std_rgb = np.std(rgb, axis=(0, 1))
        
        # Extract dominant colors using K-Means clustering
        dominant_colors = self._extract_dominant_colors(rgb, n_colors=5)
        
        return {
            'hist_rgb': np.concatenate([hist_r, hist_g, hist_b]).tolist(),
            'hist_hsv': np.concatenate([hist_h, hist_s, hist_v]).tolist(),
            'mean_rgb': mean_rgb.tolist(),
            'std_rgb': std_rgb.tolist(),
            'dominant_colors': dominant_colors
        }
    
    def _extract_dominant_colors(self, rgb_image, n_colors=5):
        """
        Extract dominant colors using K-Means clustering
        
        Args:
            rgb_image: RGB image array
            n_colors: Number of dominant colors to extract
            
        Returns:
            List of dominant colors with their percentages
        """
        # Reshape image to be a list of pixels
        pixels = rgb_image.reshape(-1, 3)
        
        # Use a subset of pixels for speed (max 5000 pixels)
        if len(pixels) > 5000:
            indices = np.random.choice(len(pixels), 5000, replace=False)
            pixels = pixels[indices]
        
        # Apply K-Means clustering
        try:
            kmeans = KMeans(n_clusters=n_colors, n_init=3, max_iter=100, random_state=42)
            kmeans.fit(pixels)
            
            # Get cluster centers (dominant colors)
            colors = kmeans.cluster_centers_.astype(int)
            
            # Calculate percentage of each color
            labels, counts = np.unique(kmeans.labels_, return_counts=True)
            percentages = counts / counts.sum() * 100
            
            # Sort by percentage (most dominant first)
            sorted_indices = np.argsort(percentages)[::-1]
            
            dominant_colors = []
            for idx in sorted_indices:
                color = colors[idx].tolist()
                percentage = float(percentages[idx])
                # Convert to hex for display
                hex_color = '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
                dominant_colors.append({
                    'rgb': color,
                    'hex': hex_color,
                    'percentage': round(percentage, 2)
                })
            
            return dominant_colors
        except Exception as e:
            # Fallback: return mean color only
            mean_color = np.mean(pixels, axis=0).astype(int).tolist()
            return [{'rgb': mean_color, 'hex': '#{:02x}{:02x}{:02x}'.format(*mean_color), 'percentage': 100.0}]
    
    def extract_tamura_features(self, roi):
        """Extract Tamura texture features (coarseness, contrast, directionality)"""
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # Coarseness
        coarseness = self._compute_coarseness(gray)
        
        # Contrast
        contrast = self._compute_contrast(gray)
        
        # Directionality
        directionality = self._compute_directionality(gray)
        
        return {
            'coarseness': float(coarseness),
            'contrast': float(contrast),
            'directionality': float(directionality)
        }
    
    def _compute_coarseness(self, gray):
        """Compute Tamura coarseness"""
        h, w = gray.shape
        gray = gray.astype(np.float64)
        
        # Use averaging windows
        k_max = 5
        avg_windows = []
        
        for k in range(k_max):
            size = 2 ** k
            if size >= min(h, w) // 2:
                break
            kernel = np.ones((size, size)) / (size * size)
            avg = convolve2d(gray, kernel, mode='same', boundary='symm')
            avg_windows.append(avg)
        
        if not avg_windows:
            return 0.0
        
        # Compute differences
        s_best = np.zeros_like(gray)
        for k in range(len(avg_windows) - 1):
            diff_h = np.abs(avg_windows[k] - np.roll(avg_windows[k], 2**k, axis=1))
            diff_v = np.abs(avg_windows[k] - np.roll(avg_windows[k], 2**k, axis=0))
            diff = np.maximum(diff_h, diff_v)
            mask = diff > s_best
            s_best[mask] = diff[mask]
        
        coarseness = np.mean(s_best)
        return coarseness
    
    def _compute_contrast(self, gray):
        """Compute Tamura contrast"""
        std = np.std(gray)
        kurtosis = np.mean((gray - np.mean(gray)) ** 4) / (std ** 4 + 1e-7)
        contrast = std / (kurtosis ** 0.25 + 1e-7)
        return contrast
    
    def _compute_directionality(self, gray):
        """Compute Tamura directionality"""
        # Compute gradients
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        # Compute gradient magnitude and direction
        magnitude = np.sqrt(gx**2 + gy**2)
        direction = np.arctan2(gy, gx)
        
        # Threshold by magnitude
        threshold = np.percentile(magnitude, 75)
        significant = magnitude > threshold
        
        if not significant.any():
            return 0.0
        
        # Histogram of directions
        hist, _ = np.histogram(direction[significant], bins=16, range=(-np.pi, np.pi))
        hist = hist / (hist.sum() + 1e-7)
        
        # Compute variance of histogram
        directionality = -np.sum(hist * np.log(hist + 1e-7))
        return directionality
    
    def extract_gabor_features(self, roi):
        """Extract Gabor filter responses"""
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        gray = gray.astype(np.float64)
        
        features = []
        for kernel in self.gabor_kernels:
            filtered = ndimage.convolve(gray, kernel, mode='wrap')
            features.append(np.mean(filtered))
            features.append(np.std(filtered))
        
        return {'gabor_responses': features}
    
    def extract_hu_moments(self, roi):
        """Extract Hu moments from object contour"""
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Use largest contour
            contour = max(contours, key=cv2.contourArea)
            
            # Compute Hu moments
            moments = cv2.moments(contour)
            hu_moments = cv2.HuMoments(moments).flatten()
            
            # Log transform for better scale invariance
            hu_moments = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-10)
            
            return {'hu_moments': hu_moments.tolist()}
        else:
            return {'hu_moments': [0.0] * 7}
    
    def extract_hog_features(self, roi):
        """Extract HOG features - OPTIMIZED"""
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # Smaller size = faster
        gray = cv2.resize(gray, (32, 64))  # Was (64, 128)
        
        # Fewer cells = faster
        features = hog(gray, orientations=9, pixels_per_cell=(16, 16),  # Was (8,8)
                    cells_per_block=(2, 2), visualize=False)
        
        return {'hog': features.tolist()}
    
    def extract_lbp_features(self, roi):
        """
        Extract Local Binary Pattern texture features
        LBP is a powerful texture descriptor that's rotation invariant
        """
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # LBP parameters
        radius = 1
        n_points = 8 * radius
        
        # Compute LBP
        lbp = local_binary_pattern(gray, n_points, radius, method='uniform')
        
        # Compute histogram of LBP
        n_bins = n_points + 2  # uniform LBP has n_points + 2 patterns
        hist, _ = np.histogram(lbp.ravel(), bins=n_bins, range=(0, n_bins))
        
        # Normalize histogram
        hist = hist.astype(float)
        hist = hist / (hist.sum() + 1e-7)
        
        return {
            'lbp_hist': hist.tolist(),
            'lbp_mean': float(np.mean(lbp)),
            'lbp_std': float(np.std(lbp))
        }
    
    def extract_contour_orientation_histogram(self, roi):
        """
        Extract contour orientation histogram from the most significant contour
        This captures the shape's edge directions
        """
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return {
                'orientation_hist': [0.0] * 18,
                'main_orientation': 0.0,
                'orientation_variance': 0.0
            }
        
        # Get the most significant (largest) contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        if len(largest_contour) < 3:
            return {
                'orientation_hist': [0.0] * 18,
                'main_orientation': 0.0,
                'orientation_variance': 0.0
            }
        
        # Compute edge orientations along the contour
        orientations = []
        for i in range(len(largest_contour)):
            # Get consecutive points
            p1 = largest_contour[i][0]
            p2 = largest_contour[(i + 1) % len(largest_contour)][0]
            
            # Compute orientation
            dx = p2[0] - p1[0]
            dy = p2[1] - p1[1]
            
            if dx != 0 or dy != 0:
                angle = np.arctan2(dy, dx)  # Range: [-pi, pi]
                orientations.append(angle)
        
        if not orientations:
            return {
                'orientation_hist': [0.0] * 18,
                'main_orientation': 0.0,
                'orientation_variance': 0.0
            }
        
        orientations = np.array(orientations)
        
        # Create histogram with 18 bins (covering 0-180 degrees, since opposite directions are equivalent)
        # Normalize angles to [0, pi]
        normalized_angles = (orientations + np.pi) % np.pi
        
        hist, _ = np.histogram(normalized_angles, bins=18, range=(0, np.pi))
        hist = hist.astype(float)
        hist = hist / (hist.sum() + 1e-7)
        
        # Compute main orientation (most frequent)
        main_bin = np.argmax(hist)
        main_orientation = float(main_bin * 10)  # Convert to degrees (0-180)
        
        # Compute orientation variance (spread of orientations)
        orientation_variance = float(np.var(normalized_angles))
        
        return {
            'orientation_hist': hist.tolist(),
            'main_orientation': main_orientation,
            'orientation_variance': orientation_variance
        }
    
    def format_features_for_display(self, features):
        """Format features for visualization in frontend"""
        if not features:
            return None
        
        formatted = {
            'color': {
                'dominant_colors': features['color'].get('dominant_colors', []),
                'mean_rgb': features['color'].get('mean_rgb', []),
                'std_rgb': features['color'].get('std_rgb', []),
                'histogram_rgb': features['color'].get('hist_rgb', []),
                'histogram_hsv': features['color'].get('hist_hsv', [])
            },
            'texture': {
                'tamura_coarseness': features['texture_tamura'].get('coarseness', 0),
                'tamura_contrast': features['texture_tamura'].get('contrast', 0),
                'tamura_directionality': features['texture_tamura'].get('directionality', 0),
                'gabor_features_count': len(features['texture_gabor'].get('gabor_responses', [])),
                'lbp_histogram': features.get('texture_lbp', {}).get('lbp_hist', []),
                'lbp_mean': features.get('texture_lbp', {}).get('lbp_mean', 0),
                'lbp_std': features.get('texture_lbp', {}).get('lbp_std', 0)
            },
            'shape': {
                'hu_moments': features['shape_hu'].get('hu_moments', []),
                'hog_features_count': len(features['shape_hog'].get('hog', [])),
                'contour_orientation_hist': features.get('shape_contour', {}).get('orientation_hist', []),
                'main_orientation': features.get('shape_contour', {}).get('main_orientation', 0),
                'orientation_variance': features.get('shape_contour', {}).get('orientation_variance', 0)
            }
        }
        
        return formatted