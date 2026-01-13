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

  // 3D model endpoints
  async upload3DModel(file) {
    const formData = new FormData();
    formData.append('model', file);

    const response = await fetch(`${API_BASE_URL}/3d/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('3D model upload failed');
    return response.json();
  }

  async add3DModel(modelId, objPath, metadata = {}) {
    const response = await fetch(`${API_BASE_URL}/3d/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId, obj_path: objPath, metadata }),
    })

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Add 3D model failed');
    }
    return response.json();
  }

  async search3DModels(queryModelId, topK = 10) {
    const response = await fetch(`${API_BASE_URL}/3d/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_model_id: queryModelId, top_k: topK }),
    })

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '3D search failed');
    }
    return response.json();
  }

  async extract3DFeatures(modelId) {
    const response = await fetch(`${API_BASE_URL}/3d/features/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId }),
    })

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Feature extraction failed');
    }
    return response.json();
  }

  async get3DStats() {
    const response = await fetch(`${API_BASE_URL}/3d/stats`);
    if (!response.ok) throw new Error('Failed to get 3D stats');
    return response.json();
  }

  // List uploaded 3D files
  async get3DList() {
    const response = await fetch(`${API_BASE_URL}/3d/list`);
    if (!response.ok) throw new Error('Failed to get 3D list');
    return response.json();
  }

  async delete3DFile(filename) {
    const response = await fetch(`${API_BASE_URL}/3d/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    })
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Delete failed');
    }
    return response.json();
  }

  // Database list & deletion
  async get3DDatabase() {
    const response = await fetch(`${API_BASE_URL}/3d/db`);
    if (!response.ok) throw new Error('Failed to get 3D database');
    return response.json();
  }

  async delete3DModel(modelId) {
    const response = await fetch(`${API_BASE_URL}/3d/db/delete/${modelId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete 3D model');
    }
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