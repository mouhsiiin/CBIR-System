// ============================================
// src/components/ImagePreview.jsx
// ============================================

import { X, ZoomIn } from 'lucide-react'

function ImagePreview({ imageUrl, onClear }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Query Image Uploaded</span>
        </h3>
        <button 
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors flex items-center space-x-1 hover:bg-red-50 px-3 py-1 rounded-lg"
        >
          <X className="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
      
      <div className="relative group rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all">
        <img 
          src={imageUrl} 
          alt="Uploaded query" 
          className="w-full h-auto max-h-96 object-contain bg-gradient-to-br from-slate-50 to-slate-100"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-lg hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0">
            <ZoomIn className="w-4 h-4" />
            <span>View Full Size</span>
          </button>
        </div>

        {/* Processing indicator - optional */}
        <div className="scanning-line"></div>
      </div>
    </div>  
  )
}

export default ImagePreview