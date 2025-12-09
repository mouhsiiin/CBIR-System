// API service for SmartGallery backend

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