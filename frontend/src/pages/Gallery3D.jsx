import { useState, useEffect } from 'react';
import axios from 'axios';
import Model3DSearch from '../components/Model3DSearch';
import ModelViewer3D from '../components/ModelViewer3D';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Gallery3D() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadModels();
    loadStats();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/3d/models`);
      setModels(response.data.models || []);
    } catch (error) {
      showToast('Failed to load 3D models', 'error');
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/3d/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('models', file);
    });

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/3d/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToast(`Successfully uploaded ${response.data.results.length} model(s)`, 'success');
      loadModels();
      loadStats();
    } catch (error) {
      showToast('Failed to upload models', 'error');
      console.error('Error uploading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFeatures = async (modelId) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/3d/features/extract`, { model_id: modelId });
      showToast('Features extracted successfully', 'success');
      loadModels();
      loadStats();
    } catch (error) {
      showToast('Failed to extract features', 'error');
      console.error('Error extracting features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractBatch = async () => {
    try {
      setLoading(true);
      const modelIds = models.map(m => m.model_id);
      const response = await axios.post(`${API_BASE_URL}/3d/features/extract/batch`, {
        model_ids: modelIds
      });
      showToast(`Extracted features for ${response.data.results.length} models`, 'success');
      loadModels();
      loadStats();
    } catch (error) {
      showToast('Failed to extract batch features', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/3d/models/${modelId}`);
      showToast('Model deleted successfully', 'success');
      loadModels();
      loadStats();
      if (selectedModel?.model_id === modelId) {
        setSelectedModel(null);
      }
    } catch (error) {
      showToast('Failed to delete model', 'error');
      console.error('Error deleting:', error);
    }
  };

  const handleSearch = async (queryModelId, topK = 5) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/3d/search`, {
        query_model_id: queryModelId,
        top_k: topK
      });
      
      // Highlight search results
      const resultIds = response.data.results.map(r => r.model_id);
      setModels(prev => prev.map(m => ({
        ...m,
        isSearchResult: resultIds.includes(m.model_id)
      })));
      
      showToast(`Found ${response.data.results.length} similar models`, 'success');
    } catch (error) {
      showToast('Search failed', 'error');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3D Model Gallery</h1>
          <p className="text-gray-600 mb-6">
            Upload, analyze, and search 3D models using global feature descriptors
          </p>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{stats.total_models}</div>
                <div className="text-gray-600">Total Models</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{stats.models_with_features}</div>
                <div className="text-gray-600">Analyzed Models</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.total_models > 0 
                    ? ((stats.models_with_features / stats.total_models) * 100).toFixed(0)
                    : 0}%
                </div>
                <div className="text-gray-600">Analysis Coverage</div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload 3D Models</h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".obj"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="flex-1 border border-gray-300 rounded px-4 py-2"
                disabled={loading}
              />
              <button
                onClick={handleExtractBatch}
                disabled={loading || models.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Extract All Features
              </button>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        {loading && models.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No 3D models</h3>
            <p className="mt-1 text-sm text-gray-500">Upload .obj files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {models.map((model) => (
              <div
                key={model.model_id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  model.isSearchResult ? 'ring-2 ring-blue-500' : ''
                } ${selectedModel?.model_id === model.model_id ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="p-4">
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center overflow-hidden">
                    <ModelViewer3D
                      modelUrl={`${API_BASE_URL}/3d/models/file/${model.filename}`}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Model Info */}
                  <h3 className="font-semibold text-gray-900 truncate mb-2">
                    {model.filename}
                  </h3>
                  
                  {model.features && (
                    <div className="text-xs text-gray-600 mb-3 space-y-1">
                      <div>Volume: {model.features.volume?.toFixed(4)}</div>
                      <div>Surface: {model.features.surface_area?.toFixed(4)}</div>
                      <div>Compactness: {model.features.compactness?.toFixed(4)}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!model.features && (
                      <button
                        onClick={() => handleExtractFeatures(model.model_id)}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Extract
                      </button>
                    )}
                    {model.features && (
                      <button
                        onClick={() => handleSearch(model.model_id)}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                      >
                        Find Similar
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedModel(model)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(model.model_id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Model Detail Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedModel.filename}</h2>
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 3D Viewer */}
                <div className="aspect-video bg-gray-100 rounded mb-4">
                  <ModelViewer3D
                    modelUrl={`${API_BASE_URL}/3d/models/file/${selectedModel.filename}`}
                    className="w-full h-full"
                  />
                </div>

                {/* Features */}
                {selectedModel.features && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Global Features</h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Volume:</dt>
                          <dd className="font-mono">{selectedModel.features.volume?.toFixed(6)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Surface Area:</dt>
                          <dd className="font-mono">{selectedModel.features.surface_area?.toFixed(6)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Compactness:</dt>
                          <dd className="font-mono">{selectedModel.features.compactness?.toFixed(6)}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Shape Properties</h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Aspect Ratio (X/Y):</dt>
                          <dd className="font-mono">{selectedModel.features.aspect_ratio_xy?.toFixed(4)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Aspect Ratio (X/Z):</dt>
                          <dd className="font-mono">{selectedModel.features.aspect_ratio_xz?.toFixed(4)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Inertia X:</dt>
                          <dd className="font-mono">{selectedModel.features.moment_inertia_x?.toFixed(6)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Inertia Y:</dt>
                          <dd className="font-mono">{selectedModel.features.moment_inertia_y?.toFixed(6)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
