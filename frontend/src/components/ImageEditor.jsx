// frontend/src/components/ImageEditor.jsx
/**
 * Image Editor Component for CBIR System
 * Allows users to apply transformations: crop, resize, scale, rotate, flip
 */

import { useState, useRef, useEffect } from 'react'
import { 
  X, Crop, Maximize2, RotateCw, FlipHorizontal, 
  FlipVertical, Download, Save, ZoomIn, ZoomOut 
} from 'lucide-react'
import api from '../services/api'

function ImageEditor({ imageId, imageUrl, onClose, onImageCreated }) {
  const [activeTab, setActiveTab] = useState('crop')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // Crop state
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Resize/scale state
  const [resizeWidth, setResizeWidth] = useState(800)
  const [resizeHeight, setResizeHeight] = useState(600)
  const [scaleFactor, setScaleFactor] = useState(1.0)
  const [keepAspectRatio, setKeepAspectRatio] = useState(true)
  
  // Rotate state
  const [rotateAngle, setRotateAngle] = useState(0)
  
  // Image dimensions
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      setResizeWidth(img.width)
      setResizeHeight(img.height)
      setCropArea({ x: 0, y: 0, width: img.width, height: img.height })
    }
    img.src = imageUrl
  }, [imageUrl])

  const handleCrop = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await api.cropImage(
        imageId, 
        Math.round(cropArea.x), 
        Math.round(cropArea.y), 
        Math.round(cropArea.width), 
        Math.round(cropArea.height)
      )
      onImageCreated?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResize = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await api.resizeImage(imageId, resizeWidth, resizeHeight)
      onImageCreated?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScale = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await api.scaleImage(imageId, scaleFactor)
      onImageCreated?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRotate = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await api.rotateImage(imageId, rotateAngle)
      onImageCreated?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFlip = async (direction) => {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await api.flipImage(imageId, direction)
      onImageCreated?.(result)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    try {
      await api.downloadImage(imageId, `image_${imageId}.jpg`)
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle resize with aspect ratio
  const handleWidthChange = (newWidth) => {
    setResizeWidth(newWidth)
    if (keepAspectRatio && imageDimensions.width > 0) {
      const ratio = imageDimensions.height / imageDimensions.width
      setResizeHeight(Math.round(newWidth * ratio))
    }
  }

  const handleHeightChange = (newHeight) => {
    setResizeHeight(newHeight)
    if (keepAspectRatio && imageDimensions.height > 0) {
      const ratio = imageDimensions.width / imageDimensions.height
      setResizeWidth(Math.round(newHeight * ratio))
    }
  }

  const tabs = [
    { id: 'crop', label: 'Crop', icon: Crop },
    { id: 'resize', label: 'Resize', icon: Maximize2 },
    { id: 'scale', label: 'Scale', icon: ZoomIn },
    { id: 'rotate', label: 'Rotate', icon: RotateCw },
    { id: 'flip', label: 'Flip', icon: FlipHorizontal },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-xl font-bold text-slate-800">✏️ Image Editor</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Image Preview */}
          <div className="mb-6 flex justify-center">
            <div ref={containerRef} className="relative inline-block border border-slate-200 rounded-lg overflow-hidden">
              <img 
                ref={imageRef}
                src={imageUrl} 
                alt="Edit preview" 
                className="max-w-full max-h-[300px] object-contain"
                style={{ 
                  transform: activeTab === 'rotate' ? `rotate(${rotateAngle}deg)` : 'none',
                  transition: 'transform 0.3s ease'
                }}
              />
              
              {/* Crop overlay */}
              {activeTab === 'crop' && imageDimensions.width > 0 && (
                <div className="absolute inset-0 bg-black/30 pointer-events-none">
                  <div 
                    className="absolute border-2 border-white border-dashed bg-transparent"
                    style={{
                      left: `${(cropArea.x / imageDimensions.width) * 100}%`,
                      top: `${(cropArea.y / imageDimensions.height) * 100}%`,
                      width: `${(cropArea.width / imageDimensions.width) * 100}%`,
                      height: `${(cropArea.height / imageDimensions.height) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tab-specific controls */}
          {activeTab === 'crop' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Crop Settings</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">X</label>
                  <input 
                    type="number" 
                    value={cropArea.x}
                    onChange={(e) => setCropArea(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={0}
                    max={imageDimensions.width - cropArea.width}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Y</label>
                  <input 
                    type="number" 
                    value={cropArea.y}
                    onChange={(e) => setCropArea(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={0}
                    max={imageDimensions.height - cropArea.height}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Width</label>
                  <input 
                    type="number" 
                    value={cropArea.width}
                    onChange={(e) => setCropArea(prev => ({ ...prev, width: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={10}
                    max={imageDimensions.width - cropArea.x}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Height</label>
                  <input 
                    type="number" 
                    value={cropArea.height}
                    onChange={(e) => setCropArea(prev => ({ ...prev, height: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={10}
                    max={imageDimensions.height - cropArea.y}
                  />
                </div>
              </div>
              <button 
                onClick={handleCrop}
                disabled={isProcessing}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Apply Crop'}
              </button>
            </div>
          )}

          {activeTab === 'resize' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Resize Settings</h3>
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="keepAspect"
                  checked={keepAspectRatio}
                  onChange={(e) => setKeepAspectRatio(e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                <label htmlFor="keepAspect" className="text-sm text-slate-600">Keep aspect ratio</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Width (px)</label>
                  <input 
                    type="number" 
                    value={resizeWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={10}
                    max={4000}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Height (px)</label>
                  <input 
                    type="number" 
                    value={resizeHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    min={10}
                    max={4000}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Original: {imageDimensions.width} × {imageDimensions.height} px
              </p>
              <button 
                onClick={handleResize}
                disabled={isProcessing}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Apply Resize'}
              </button>
            </div>
          )}

          {activeTab === 'scale' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Scale Settings</h3>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Scale Factor: {scaleFactor.toFixed(2)}x
                </label>
                <input 
                  type="range" 
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                  className="w-full"
                  min={0.1}
                  max={3}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0.1x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                New size: {Math.round(imageDimensions.width * scaleFactor)} × {Math.round(imageDimensions.height * scaleFactor)} px
              </p>
              <div className="flex space-x-2">
                <button onClick={() => setScaleFactor(0.5)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">50%</button>
                <button onClick={() => setScaleFactor(0.75)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">75%</button>
                <button onClick={() => setScaleFactor(1)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">100%</button>
                <button onClick={() => setScaleFactor(1.5)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">150%</button>
                <button onClick={() => setScaleFactor(2)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">200%</button>
              </div>
              <button 
                onClick={handleScale}
                disabled={isProcessing}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Apply Scale'}
              </button>
            </div>
          )}

          {activeTab === 'rotate' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Rotate Settings</h3>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Angle: {rotateAngle}°
                </label>
                <input 
                  type="range" 
                  value={rotateAngle}
                  onChange={(e) => setRotateAngle(parseInt(e.target.value))}
                  className="w-full"
                  min={-180}
                  max={180}
                  step={1}
                />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setRotateAngle(-90)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">-90°</button>
                <button onClick={() => setRotateAngle(-45)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">-45°</button>
                <button onClick={() => setRotateAngle(0)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">0°</button>
                <button onClick={() => setRotateAngle(45)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">45°</button>
                <button onClick={() => setRotateAngle(90)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">90°</button>
                <button onClick={() => setRotateAngle(180)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200">180°</button>
              </div>
              <button 
                onClick={handleRotate}
                disabled={isProcessing}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Apply Rotation'}
              </button>
            </div>
          )}

          {activeTab === 'flip' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Flip Image</h3>
              <p className="text-sm text-slate-600">Choose flip direction:</p>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => handleFlip(1)}
                  disabled={isProcessing}
                  className="flex flex-col items-center space-y-2 p-6 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border-2 border-slate-200 transition-colors"
                >
                  <FlipHorizontal className="w-8 h-8 text-purple-600" />
                  <span className="font-medium text-slate-700">Horizontal</span>
                </button>
                <button 
                  onClick={() => handleFlip(0)}
                  disabled={isProcessing}
                  className="flex flex-col items-center space-y-2 p-6 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border-2 border-slate-200 transition-colors"
                >
                  <FlipVertical className="w-8 h-8 text-purple-600" />
                  <span className="font-medium text-slate-700">Vertical</span>
                </button>
                <button 
                  onClick={() => handleFlip(-1)}
                  disabled={isProcessing}
                  className="flex flex-col items-center space-y-2 p-6 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border-2 border-slate-200 transition-colors"
                >
                  <div className="relative">
                    <FlipHorizontal className="w-8 h-8 text-purple-600" />
                    <FlipVertical className="w-6 h-6 text-purple-400 absolute -bottom-1 -right-1" />
                  </div>
                  <span className="font-medium text-slate-700">Both</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageEditor
