# /home/muhammed/Documents/SmartGallery/backend/services/feature_extraction.py

import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops, hog
from skimage.filters import gabor_kernel
from scipy import ndimage
from scipy.signal import convolve2d
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
            'shape_hu': self.extract_hu_moments(roi),
            'shape_hog': self.extract_hog_features(roi)
        }
        
        return features
    
    def extract_color_features(self, roi):
        """Extract color histogram - OPTIMIZED VERSION"""
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
        
        return {
            'hist_rgb': np.concatenate([hist_r, hist_g, hist_b]).tolist(),
            'hist_hsv': np.concatenate([hist_h, hist_s, hist_v]).tolist(),
            'mean_rgb': mean_rgb.tolist(),
            'std_rgb': std_rgb.tolist()
        }
    
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
                'gabor_features_count': len(features['texture_gabor'].get('gabor_responses', []))
            },
            'shape': {
                'hu_moments': features['shape_hu'].get('hu_moments', []),
                'hog_features_count': len(features['shape_hog'].get('hog', []))
            }
        }
        
        return formatted