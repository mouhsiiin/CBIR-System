import { useState } from 'react'
import api from '../services/api'

export default function Model3DSearch({ showToast }) {
  const [file, setFile] = useState(null)
  const [uploadPath, setUploadPath] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const [results, setResults] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [modelIdToAdd, setModelIdToAdd] = useState('')

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
      setUploadPath(res.path)
      setUploadUrl(res.url)
      showToast && showToast('3D model uploaded', 'success')
    } catch (err) {
      console.error(err)
      showToast && showToast('Upload failed: ' + err.message, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearch = async () => {
    if (!uploadPath) return
    setIsSearching(true)
    try {
      const res = await api.search3DModels(uploadPath, 10)
      setResults(res.results)
      showToast && showToast('Search completed', 'success')
    } catch (err) {
      console.error(err)
      showToast && showToast('Search failed: ' + err.message, 'error')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToDB = async () => {
    if (!uploadPath || !modelIdToAdd) return
    try {
      await api.add3DModel(modelIdToAdd, uploadPath, { added_by: 'web' })
      showToast && showToast('Model added to 3D database', 'success')
    } catch (err) {
      console.error(err)
      showToast && showToast('Add failed: ' + err.message, 'error')
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
          <button className="btn-secondary" onClick={handleSearch} disabled={!uploadPath || isSearching}>
            {isSearching ? 'Searching...' : 'Search Similar'}
          </button>
        </div>

        {uploadPath && (
          <div className="mt-3 text-sm text-slate-600">
            Uploaded path: <code>{uploadPath}</code>
            {uploadUrl && (
              <span className="ml-3"><a href={uploadUrl} target="_blank" rel="noreferrer" className="text-blue-600">Open</a></span>
            )}
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Add uploaded model to DB</label>
          <div className="flex space-x-2">
            <input value={modelIdToAdd} onChange={(e) => setModelIdToAdd(e.target.value)} placeholder="Model ID" className="input" />
            <button className="btn-primary" onClick={handleAddToDB} disabled={!uploadPath || !modelIdToAdd}>Add to DB</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Results</h3>
        {results.length === 0 ? (
          <div className="text-sm text-slate-500">No results yet. Upload a model and click "Search Similar".</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Rank</th>
                <th className="py-2">Model ID</th>
                <th className="py-2">Distance</th>
                <th className="py-2">Obj Path</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.model_id} className="border-b">
                  <td className="py-2 align-top">{idx + 1}</td>
                  <td className="py-2 align-top">{r.model_id}</td>
                  <td className="py-2 align-top">{r.distance.toFixed(4)}</td>
                  <td className="py-2 align-top"><code className="text-xs">{r.obj_path}</code></td>
                  <td className="py-2 align-top">
                    {r.obj_path ? (
                      (() => {
                        const parts = r.obj_path.split('/')
                        const name = parts[parts.length - 1]
                        const url = r.obj_path.includes('/api/3d/file/') ? r.obj_path : `/api/3d/file/${name}`
                        return (
                          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open</a>
                        )
                      })()
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
