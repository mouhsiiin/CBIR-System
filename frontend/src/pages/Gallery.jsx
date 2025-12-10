// frontend/src/pages/Gallery.jsx

import { useState, useEffect } from 'react'
import { Trash2, Image as ImageIcon, Loader2, Upload, Download, Edit3, RefreshCw } from 'lucide-react'
import api from '../services/api'
import ImageEditor from '../components/ImageEditor'

function Gallery({ onUseAsQuery }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState([])
  const [stats, setStats] = useState(null)
  const [editingImage, setEditingImage] = useState(null)
  const [processingBatch, setProcessingBatch] = useState(false)

  useEffect(() => {
    loadGallery()
    loadStats()
  }, [])

  const loadGallery = async () => {
    setLoading(true)
    try {
      const result = await api.getAllImages()
      setImages(result.images || [])
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await api.getStats()
      setStats(result)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSelectImage = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return
    
    if (!confirm(`Delete ${selectedImages.length} image(s)?`)) return
    
    try {
      await api.deleteImages(selectedImages)
      setSelectedImages([])
      loadGallery()
      loadStats()
    } catch (error) {
      console.error('Failed to delete images:', error)
      alert('Failed to delete images')
    }
  }

  const handleUseAsQuery = async () => {
    if (selectedImages.length !== 1) return
    
    const imageId = selectedImages[0]
    const image = images.find(img => img.image_id === imageId)
    
   

  const handleDownloadSelected = async () => {
    if (selectedImages.length === 0) return
    
    for (const imageId of selectedImages) {
      const image = images.find(img => img.image_id === imageId)
      if (image) {
        await api.downloadImage(imageId, image.filename)
      }
    }
  }

  const handleEditImage = () => {
    if (selectedImages.length !== 1) return
    Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          imageId={editingImage.imageId}
          imageUrl={editingImage.imageUrl}
          onClose={() => setEditingImage(null)}
          onImageCreated={handleImageCreated}
        />
      )}

      {/* Floating Action Buttons */}
      {selectedImages.length > 0 && (
        <>
          {/* Delete Button */}
          <button
            onClick={handleDeleteSelected}
            className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-2xl hover:scale-110 animate-bounce"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete {selectedImages.length}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadSelected}
            className="fixed bottom-8 right-52 z-50 flex items-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all shadow-2xl hover:scale-110"
          >
            <Download className="w-5 h-5" />
            <span>Download {selectedImages.length}</span>
          </button>

          {/* Edit Button - Only show when 1 image selected */}
          {selectedImages.length === 1 && (
            <button
              onClick={handleEditImage}
              className="fixed bottom-24 right-52 z-50 flex items-center space-x-2 px-6 py-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-2xl hover:scale-110"
            >
              <Edit3 className="w-5 h-5" />
              <span>Edit Image</span>
            </button>
          )}

          {/* Use as Query Button - Only show when 1 image selected */}
          {selectedImages.length === 1 && (
            <button
              onClick={handleUseAsQuery}
              className="fixed bottom-24 right-8 z-50 flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-2xl hover:scale-110"
            >
              <Upload className="w-5 h-5" />
              <span>Use as Query</span>
            </button>
          )}

          {/* Batch Processing Buttons */}
          <button
            onClick={handleBatchDetect}
            disabled={processingBatch}
            className="fixed bottom-40 right-8 z-50 flex items-center space-x-2 px-6 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-2xl hover:scale-110 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${processingBatch ? 'animate-spin' : ''}`} />
            <span>Detect Objects</span>
          </button>

          <button
            onClick={handleBatchExtractFeatures}
            disabled={processingBatch}
            className="fixed bottom-40 right-52 z-50 flex items-center space-x-2 px-6 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-2xl hover:scale-110 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${processingBatch ? 'animate-spin' : ''}`} />
            <span>Extract Features</span>
          </button>ssingBatch(true)
    try {
      await api.detectObjectsBatch(selectedImages)
      alert(`Detected objects in ${selectedImages.length} image(s)`)
      loadStats()
    } catch (error) {
      console.error('Batch detection failed:', error)
      alert('Batch detection failed')
    } finally {
      setProcessingBatch(false)
    }
  }

  const handleBatchExtractFeatures = async () => {
    if (selectedImages.length === 0) return
    
    setProcessingBatch(true)
    try {
      const result = await api.extractFeaturesBatch(selectedImages)
      alert(`Extracted features for ${result.processed?.length || 0} object(s)`)
      loadStats()
    } catch (error) {
      console.error('Batch feature extraction failed:', error)
      alert('Batch feature extraction failed')
    } finally {
      setProcessingBatch(false)
    }
  } if (image && onUseAsQuery) {
      onUseAsQuery(imageId, image.filename)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Floating Action Buttons */}
      {selectedImages.length > 0 && (
        <>
          {/* Delete Button */}
          <button
            onClick={handleDeleteSelected}
            className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-2xl hover:scale-110 animate-bounce"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete {selectedImages.length}</span>
          </button>

          {/* Use as Query Button - Only show when 1 image selected */}
          {selectedImages.length === 1 && (
            <button
              onClick={handleUseAsQuery}
              className="fixed bottom-24 right-8 z-50 flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-2xl hover:scale-110"
            >
              <Upload className="w-5 h-5" />
              <span>Use as Query</span>
            </button>
          )}
        </>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">📸 Image Gallery</h2>
          <p className="text-slate-600">
            {images.length} images • {stats?.total_objects || 0} objects detected • {stats?.total_features_extracted || 0} features extracted
          </p>
        </div>
      </div>

      {/* Class Distribution */}
      {stats?.class_distribution && Object.keys(stats.class_distribution).length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Object Classes</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.class_distribution).map(([className, count]) => (
              <div key={className} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {className}: {count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Images Yet</h3>
          <p className="text-slate-600">Upload images to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.image_id}
              onClick={() => handleSelectImage(image.image_id)}
              className={`relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${
                selectedImages.includes(image.image_id)
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-transparent hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <img
                src={api.getImageUrl(image.filename)}
                alt={`Image ${image.image_id}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-white text-sm">
                  <p className="font-semibold">{image.width} × {image.height}</p>
                </div>
              </div>

              {/* Selection Checkbox */}
              {selectedImages.includes(image.image_id) && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery