import { useState } from 'react'
import api from '../services/api'
import ModelViewer3D from './ModelViewer3D'

export default function Model3DSearch({ showToast }) {
  const [file, setFile] = useState(null)
  const [uploadedModelId, setUploadedModelId] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const [results, setResults] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const res = await api.upload3DModel(file)
      setUploadedModelId(res.model_id)
      setUploadUrl(`/api/3d/models/file/${res.filename}`)
      showToast && showToast('3D model uploaded successfully', 'success')
      
      // Auto-extract features
      handleExtractFeatures(res.model_id)
    } catch (err) {
      console.error(err)
      showToast && showToast('Upload failed: ' + err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleExtractFeatures = async (modelId) => {
    setIsExtracting(true)
    try {
      await api.extract3DFeatures(modelId)
      showToast && showToast('Features extracted successfully', 'success')
    } catch (err) {
      console.error(err)
      showToast && showToast('Feature extraction failed: ' + err.message, 'error')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSearch = async () => {
    if (!uploadedModelId) return
    setIsSearching(true)
    try {
      const res = await api.search3DModels(uploadedModelId, 10)
      setResults(res.results || [])
      showToast && showToast('Search completed successfully', 'success')
    } catch (err) {
      console.error(err)
      showToast && showToast('Search failed: ' + err.message, 'error')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">3D Model Search 🔎</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select .obj model</label>
        <input type="file" accept=".obj" onChange={handleFileChange} />
        <div className="mt-3 flex items-center space-x-2">
          <button className="btn-primary" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Model'}
          </button>
          {uploadedModelId && (
            <>
              <button className="btn-secondary" onClick={() => handleExtractFeatures(uploadedModelId)} disabled={isExtracting}>
                {isExtracting ? 'Extracting...' : 'Extract Features'}
              </button>
              <button className="btn-secondary" onClick={handleSearch} disabled={!uploadedModelId || isSearching}>
                {isSearching ? 'Searching...' : 'Search Similar'}
              </button>
            </>
          )}
        </div>

        {uploadedModelId && (
          <div className="mt-3 text-sm text-slate-600">
            Uploaded model ID: <code>{uploadedModelId}</code>
            {uploadUrl && (
              <span className="ml-3"><a href={uploadUrl} target="_blank" rel="noreferrer" className="text-blue-600">Open</a></span>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Results ({results.length})</h3>
        {results.length === 0 ? (
          <div className="text-sm text-slate-500">No results yet. Upload a model, extract features, and click "Search Similar".</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Rank</th>
                <th className="py-2">Model ID</th>
                <th className="py-2">Distance</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.model_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 align-top">{idx + 1}</td>
                  <td className="py-2 align-top font-medium">{r.model_id}</td>
                  <td className="py-2 align-top">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {typeof r.distance === 'number' ? r.distance.toFixed(4) : r.distance}
                    </span>
                  </td>
                  <td className="py-2 align-top flex gap-2">
                    <button
                      onClick={() => setSelectedResult(r)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Details
                    </button>
                    <a 
                      href={`http://localhost:5000/api/3d/models/file/${r.model_id}.obj`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Popup Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedResult.model_id}</h2>
                  <p className="text-gray-600 text-sm mt-1">Similarity Search Result #{results.indexOf(selectedResult) + 1}</p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 3D Viewer */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">3D Preview</h3>
                <div className="bg-gray-100 rounded aspect-video flex items-center justify-center">
                  <ModelViewer3D
                    modelUrl={`http://localhost:5000/api/3d/models/file/${selectedResult.model_id}.obj`}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Similarity Metrics */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-3">Similarity Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Distance Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {typeof selectedResult.distance === 'number' ? selectedResult.distance.toFixed(6) : selectedResult.distance}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Lower is more similar</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Similarity %</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(Math.max(0, 100 - (selectedResult.distance * 100))).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Approximate match</p>
                  </div>
                </div>
              </div>

              {/* Features Comparison */}
              {selectedResult.features && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Global Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Volume</p>
                      <p className="text-lg font-mono">{selectedResult.features.volume?.toFixed(6) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Surface Area</p>
                      <p className="text-lg font-mono">{selectedResult.features.surface_area?.toFixed(6) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Compactness</p>
                      <p className="text-lg font-mono">{selectedResult.features.compactness?.toFixed(6) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Aspect Ratio X/Y</p>
                      <p className="text-lg font-mono">{selectedResult.features.aspect_ratio_xy?.toFixed(4) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Aspect Ratio X/Z</p>
                      <p className="text-lg font-mono">{selectedResult.features.aspect_ratio_xz?.toFixed(4) || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Moment of Inertia X</p>
                      <p className="text-lg font-mono">{selectedResult.features.moment_inertia_x?.toFixed(6) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <a
                  href={`http://localhost:5000/api/3d/models/file/${selectedResult.model_id}.obj`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
