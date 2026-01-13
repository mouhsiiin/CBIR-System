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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDetails, setShowSearchDetails] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [selectedModelFeatures, setSelectedModelFeatures] = useState(null);

  useEffect(() => {
    loadModels();
    loadStats();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/3d/models`);
      const loadedModels = response.data.models || [];
      console.log('📦 Loaded models:', loadedModels);
      loadedModels.forEach(m => {
        const fileUrl = `${API_BASE_URL}/3d/models/file/${m.filename}`;
        console.log(`  - ${m.filename} -> ${fileUrl}`);
      });
      setModels(loadedModels);
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

  const handleSimilaritySearch = async (modelId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/3d/search`, {
        query_model_id: modelId,
        top_k: 5
      });
      setSearchResults({
        queryModelId: modelId,
        results: response.data.results || []
      });
      setShowSearchDetails(true);
      showToast(`Found ${response.data.results.length} similar models`, 'success');
    } catch (error) {
      showToast('Search failed', 'error');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowFeatures = (model) => {
    setSelectedModelFeatures(model);
    setShowFeaturesModal(true);
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

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Models</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by model name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setSearchQuery('')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {models.filter(m => m.filename.toLowerCase().includes(searchQuery.toLowerCase())).length} models matching "{searchQuery}"
            </p>
          )}
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
          <>
            {models.filter(m => m.filename.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">No models match your search query "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {models
                  .filter(m => m.filename.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((model) => (
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
                  <div className="flex flex-col gap-2">
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
                        <>
                          <button
                            onClick={() => handleSimilaritySearch(model.model_id)}
                            disabled={loading}
                            className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:bg-gray-400"
                            title="Find similar 3D models"
                          >
                            🔍 Similar
                          </button>
                          <button
                            onClick={() => handleShowFeatures(model)}
                            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                            title="View extracted features"
                          >
                            📊 Features
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
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
              </div>
                    ))}
              </div>
            )}
          </>
        )}

        {/* Model Detail Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedModel.filename}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Model ID: <span className="font-mono">{selectedModel.model_id}</span>
                      {selectedModel.features && (
                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Features Extracted</span>
                      )}
                    </p>
                  </div>
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
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">3D Preview</h3>
                  <div className="aspect-video bg-gray-100 rounded">
                    <ModelViewer3D
                      modelUrl={`${API_BASE_URL}/3d/models/file/${selectedModel.filename}`}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Model Information */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Model Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filename:</span>
                      <span className="font-semibold">{selectedModel.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model ID:</span>
                      <span className="font-mono text-sm">{selectedModel.model_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Path:</span>
                      <span className="font-mono text-xs text-gray-500 truncate max-w-md">{selectedModel.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Features Status:</span>
                      <span className={`font-semibold ${selectedModel.features ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedModel.features ? '✓ Extracted' : '✗ Not Extracted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Extracted Features */}
                {selectedModel.features ? (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Extracted Features (Global Descriptors)</h3>
                    
                    {/* Primary Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-blue-600 mb-2">Primary Features</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Volume</p>
                          <p className="text-lg font-bold text-blue-600">{selectedModel.features.volume?.toFixed(6)}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Surface Area</p>
                          <p className="text-lg font-bold text-blue-600">{selectedModel.features.surface_area?.toFixed(6)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Compactness</p>
                          <p className="text-lg font-bold text-green-600">{selectedModel.features.compactness?.toFixed(6)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">V/SA Ratio</p>
                          <p className="text-lg font-bold text-green-600">
                            {(selectedModel.features.volume / selectedModel.features.surface_area)?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shape Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-purple-600 mb-2">Shape Properties</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Aspect Ratio X/Y</p>
                          <p className="text-lg font-bold text-purple-600">{selectedModel.features.aspect_ratio_xy?.toFixed(4)}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Aspect Ratio X/Z</p>
                          <p className="text-lg font-bold text-purple-600">{selectedModel.features.aspect_ratio_xz?.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Moments of Inertia */}
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 mb-2">Moments of Inertia</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Inertia X-axis</p>
                          <p className="text-base font-mono text-orange-600">{selectedModel.features.moment_inertia_x?.toFixed(6)}</p>
                          <p className="text-xs text-gray-500 mt-1">Rotation resistance around X</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Inertia Y-axis</p>
                          <p className="text-base font-mono text-orange-600">{selectedModel.features.moment_inertia_y?.toFixed(6)}</p>
                          <p className="text-xs text-gray-500 mt-1">Rotation resistance around Y</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature Vector Info */}
                    <div className="mt-4 bg-gray-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        📊 Feature Vector Dimension: 7
                      </p>
                      <p className="text-xs text-gray-600">
                        Based on Global Features (Section 3.1.1): Geometric ratios, moments, and bounding box properties
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      ⚠️ Features have not been extracted for this model yet. Extract features to enable similarity search.
                    </p>
                    <button
                      onClick={() => {
                        handleExtractFeatures(selectedModel.model_id);
                        setSelectedModel(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Extract Features Now
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  {selectedModel.features && (
                    <button
                      onClick={() => {
                        handleSimilaritySearch(selectedModel.model_id);
                        setSelectedModel(null);
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-semibold"
                    >
                      <span>🔍</span>
                      <span>Run as Query for 3D Search</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <a
                    href={`${API_BASE_URL}/3d/models/file/${selectedModel.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Download .obj
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* Features Modal */}
      {showFeaturesModal && selectedModelFeatures && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModelFeatures.filename}</h2>
                  <p className="text-gray-600 text-sm mt-1">Global Shape Features</p>
                </div>
                <button
                  onClick={() => setShowFeaturesModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {selectedModelFeatures.features ? (
                <div className="space-y-6">
                  {/* Primary Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-blue-600">Primary Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Volume</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedModelFeatures.features.volume?.toFixed(6)}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Surface Area</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedModelFeatures.features.surface_area?.toFixed(6)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Compactness</p>
                        <p className="text-2xl font-bold text-green-600">{selectedModelFeatures.features.compactness?.toFixed(6)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Volume-to-Surface Ratio</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(selectedModelFeatures.features.volume / selectedModelFeatures.features.surface_area)?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shape Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-purple-600">Shape Properties</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Aspect Ratio X/Y</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedModelFeatures.features.aspect_ratio_xy?.toFixed(4)}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Aspect Ratio X/Z</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedModelFeatures.features.aspect_ratio_xz?.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Moments of Inertia */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-orange-600">Moments of Inertia</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Inertia X-axis</p>
                        <p className="text-lg font-mono text-orange-600">{selectedModelFeatures.features.moment_inertia_x?.toFixed(6)}</p>
                        <p className="text-xs text-gray-500 mt-2">Resistance to rotation around X</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Inertia Y-axis</p>
                        <p className="text-lg font-mono text-orange-600">{selectedModelFeatures.features.moment_inertia_y?.toFixed(6)}</p>
                        <p className="text-xs text-gray-500 mt-2">Resistance to rotation around Y</p>
                      </div>
                    </div>
                  </div>

                  {/* Feature Vector Info */}
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Feature Vector (Dimension: 7)</p>
                    <p className="text-xs text-gray-600">Global features descriptor based on Section 3.1.1: Geometric moments and bounding box features</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No features extracted yet</p>
                  <button
                    onClick={() => {
                      handleExtractFeatures(selectedModelFeatures.model_id);
                      setShowFeaturesModal(false);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Extract Features
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowFeaturesModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similarity Search Results Modal */}
      {showSearchDetails && searchResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Similarity Search Results</h2>
                  <p className="text-gray-600 text-sm mt-1">Query: <span className="font-semibold">{searchResults.queryModelId}</span></p>
                </div>
                <button
                  onClick={() => setShowSearchDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {searchResults.results.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.results.map((result, idx) => (
                    <div key={result.model_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-blue-600">#{idx + 1}</span>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{result.model_id}</h3>
                              <p className="text-sm text-gray-600">{result.model_id}.obj</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="text-2xl font-bold text-green-600">{result.distance?.toFixed(4)}</p>
                        </div>
                      </div>

                      {/* Similarity Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-gray-600">Similarity Score</p>
                          <p className="text-sm font-semibold text-green-600">
                            {(Math.max(0, 100 - (result.distance * 100))).toFixed(1)}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.max(0, 100 - (result.distance * 100))}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Features Comparison */}
                      {result.features && (
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 pt-3 border-t">
                          <div>Volume: <span className="font-semibold">{result.features.volume?.toFixed(4)}</span></div>
                          <div>Surface: <span className="font-semibold">{result.features.surface_area?.toFixed(4)}</span></div>
                          <div>Compactness: <span className="font-semibold">{result.features.compactness?.toFixed(4)}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No similar models found
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSearchDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
