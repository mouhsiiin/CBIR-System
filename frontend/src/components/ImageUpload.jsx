// ============================================
// src/components/ImageUpload.jsx
// ============================================

import { useState, useRef } from 'react'
import { Upload, ImageIcon } from 'lucide-react'

function ImageUpload({ onImageUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    onImageUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`upload-zone group ${isDragging ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}
    >
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-300 upload-icon shadow-lg">
          <ImageIcon className="w-10 h-10 text-blue-600" />
        </div>
        <div>
          <p className="text-slate-800 font-bold text-lg mb-1">
            Drop image here or click to browse
          </p>
          <p className="text-sm text-slate-500 font-medium">
            Supports: JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-600 font-semibold">Click to upload</span>
        </div>
      </div>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageUpload
