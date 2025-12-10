// API service for SmartGallery backend
// CBIR System - Content-Based Image Retrieval with Object Detection

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }

  // Upload image(s)
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('images', file);
    
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }

  // Upload multiple images
  async uploadMultipleImages(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }

  // Get all images
  async getAllImages() {
    const response = await fetch(`${API_BASE_URL}/images`);
    return response.json();
  }

  // Detect objects in image
  async detectObjects(imageId) {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_id: imageId }),
    });
    
    if (!response.ok) throw new Error('Detection failed');
    return response.json();
  }

  // Batch detect objects in multiple images
  async detectObjectsBatch(imageIds) {
    const response = await fetch(`${API_BASE_URL}/detect/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_ids: imageIds }),
    });
    
    if (!response.ok) throw new Error('Batch detection failed');
    return response.json();
  }

  // Extract features from detected object
  async extractFeatures(imageId, objectId) {
    const response = await fetch(`${API_BASE_URL}/features/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_id: imageId, 
        object_id: objectId 
      }),
    });
    
    if (!response.ok) throw new Error('Feature extraction failed');
    return response.json();
  }

  // Batch extract features for all objects in images
  async extractFeaturesBatch(imageIds) {
    const response = await fetch(`${API_BASE_URL}/features/extract/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_ids: imageIds }),
    });
    
    if (!response.ok) throw new Error('Batch feature extraction failed');
    return response.json();
  }

  // Search for similar objects
  async searchSimilar(queryImageId, queryObjectId, topK = 10, weights = null) {
    const response = await fetch(`${API_BASE_URL}/search/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_image_id: queryImageId,
        query_object_id: queryObjectId,
        top_k: topK,
        weights: weights,
      }),
    });
    
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  // Get formatted features for visualization
  async getFeatures(imageId, objectId) {
    const response = await fetch(`${API_BASE_URL}/features/${imageId}/${objectId}`);
    if (!response.ok) throw new Error('Failed to get features');
    return response.json();
  }

  // Get image URL
  getImageUrl(filename) {
    return `${API_BASE_URL}/images/file/${filename}`;
  }

  // Get database statistics
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  }

  // Download image
  getDownloadUrl(imageId) {
    return `${API_BASE_URL}/images/download/${imageId}`;
  }

  // Download image programmatically
  async downloadImage(imageId, filename) {
    const response = await fetch(`${API_BASE_URL}/images/download/${imageId}`);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `image_${imageId}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Transform image (crop, resize, rotate, flip, scale)
  async transformImage(imageId, transformType, params) {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}/transform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transform_type: transformType,
        params: params
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transform failed');
    }
    return response.json();
  }

  // Crop image
  async cropImage(imageId, x, y, width, height) {
    return this.transformImage(imageId, 'crop', { x, y, width, height });
  }

  // Resize image
  async resizeImage(imageId, width, height) {
    return this.transformImage(imageId, 'resize', { width, height });
  }

  // Scale image with aspect ratio preserved
  async scaleImage(imageId, scaleFactor) {
    return this.transformImage(imageId, 'scale', { scale: scaleFactor });
  }

  // Resize keeping aspect ratio
  async resizeKeepAspect(imageId, maxWidth, maxHeight) {
    return this.transformImage(imageId, 'resize_keep_aspect', { 
      max_width: maxWidth, 
      max_height: maxHeight 
    });
  }

  // Rotate image
  async rotateImage(imageId, angle) {
    return this.transformImage(imageId, 'rotate', { angle });
  }

  // Flip image (direction: 1=horizontal, 0=vertical, -1=both)
  async flipImage(imageId, direction) {
    return this.transformImage(imageId, 'flip', { direction });
  }

  async deleteImages(imageIds) {
  const response = await fetch(`${API_BASE_URL}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_ids: imageIds }),
  })
  
  if (!response.ok) throw new Error('Delete failed')
  return response.json()}
}



export default new ApiService();