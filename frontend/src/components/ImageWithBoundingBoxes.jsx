import { useEffect, useRef, useState } from 'react'
import { X, ZoomIn, Eye, EyeOff } from 'lucide-react'

function ImageWithBoundingBoxes({ imageUrl, detections, onClear }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const [showBoxes, setShowBoxes] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Colors for different objects
  const colors = [
    '#EF4444', // red
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return
    
    const canvas = canvasRef.current
    const img = imageRef.current
    const ctx = canvas.getContext('2d')

    // Get displayed dimensions
    const displayWidth = img.clientWidth
    const displayHeight = img.clientHeight
    
    // Set canvas size to match displayed image
    canvas.width = displayWidth
    canvas.height = displayHeight
    
    // Calculate scaling factors
    const scaleX = displayWidth / img.naturalWidth
    const scaleY = displayHeight / img.naturalHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (showBoxes && detections && detections.length > 0) {
      // Draw bounding boxes
      detections.forEach((detection, idx) => {
        const [x1, y1, x2, y2] = detection.bbox
        const color = colors[idx % colors.length]
        
        // Scale coordinates to match displayed size
        const scaledX1 = x1 * scaleX
        const scaledY1 = y1 * scaleY
        const scaledX2 = x2 * scaleX
        const scaledY2 = y2 * scaleY
        const width = scaledX2 - scaledX1
        const height = scaledY2 - scaledY1
        
        // Draw rectangle
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.strokeRect(scaledX1, scaledY1, width, height)

        // Draw label background
        const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`
        ctx.font = 'bold 14px Inter, system-ui, sans-serif'
        const textMetrics = ctx.measureText(label)
        const textHeight = 16
        const padding = 4

        // Position label above box, but inside if too close to top
        const labelY = scaledY1 > textHeight + padding * 2 ? scaledY1 : scaledY1 + textHeight + padding * 2

        ctx.fillStyle = color
        ctx.fillRect(
          scaledX1, 
          labelY - textHeight - padding * 2, 
          textMetrics.width + padding * 2, 
          textHeight + padding * 2
        )

        // Draw label text
        ctx.fillStyle = 'white'
        ctx.textBaseline = 'top'
        ctx.fillText(label, scaledX1 + padding, labelY - textHeight - padding)
      })
    }
  }, [imageLoaded, showBoxes, detections])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Query Image</span>
          {detections && detections.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
              {detections.length} detected
            </span>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Toggle boxes button */}
          {detections && detections.length > 0 && (
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`text-sm font-semibold transition-all flex items-center space-x-1 px-3 py-1 rounded-lg border-2 ${
                showBoxes 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {showBoxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{showBoxes ? 'Hide' : 'Show'} Boxes</span>
            </button>
          )}
          
          {/* Clear button */}
          <button 
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors flex items-center space-x-1 hover:bg-red-50 px-3 py-1 rounded-lg border-2 border-transparent hover:border-red-200"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>
      
      {/* Image with Canvas Overlay */}
      <div 
        ref={containerRef}
        className="relative group rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg hover:shadow-2xl transition-all bg-gradient-to-br from-slate-50 to-slate-100"
      >
        {/* Original Image */}
        <img 
          ref={imageRef}
          src={imageUrl} 
          alt="Query" 
          className="w-full h-auto max-h-96 object-contain block"
          onLoad={handleImageLoad}
        />
        
        {/* Canvas Overlay for Bounding Boxes */}
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: imageRef.current?.clientWidth,
              height: imageRef.current?.clientHeight
            }}
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-lg">
            <ZoomIn className="w-4 h-4" />
            <span>
              {detections && detections.length > 0 
                ? `${detections.length} object${detections.length > 1 ? 's' : ''} detected` 
                : 'No objects detected'}
            </span>
          </div>
        </div>

        {/* Processing indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Legend for detected objects */}
      {detections && detections.length > 0 && showBoxes && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          {detections.map((det, idx) => (
            <div 
              key={idx}
              className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full border-2 shadow-sm"
              style={{ borderColor: colors[idx % colors.length] }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-xs font-semibold text-slate-700">
                {det.class}
              </span>
              <span className="text-xs text-slate-500">
                {Math.round(det.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageWithBoundingBoxes