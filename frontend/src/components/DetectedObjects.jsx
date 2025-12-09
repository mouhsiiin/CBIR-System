import { Check, Eye } from 'lucide-react'

function DetectedObjects({ objects, selectedObjects, onToggleSelection }) {
  if (objects.length === 0) return null

  // Match the colors from ImageWithBoundingBoxes
  const objectColors = [
    '#EF4444', // red
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#10B981', // green
    '#F59E0B', // amber
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]

  // Group objects by class to show counts
  const classCounts = objects.reduce((acc, obj) => {
    acc[obj.class] = (acc[obj.class] || 0) + 1
    return acc
  }, {})

  // Track instance numbers for each class
  const classInstanceCounters = {}

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span>Detected Objects</span>
        </h3>
        <span className="badge badge-success">
          {objects.length} found
        </span>
      </div>
      
      <div className="space-y-3">
        {objects.map((obj, idx) => {
          const isSelected = selectedObjects.includes(obj.id)
          const color = objectColors[idx % objectColors.length]
          const confidencePercent = Math.round(obj.confidence * 100)
          
          // Calculate instance number for this class
          if (!classInstanceCounters[obj.class]) {
            classInstanceCounters[obj.class] = 0
          }
          classInstanceCounters[obj.class]++
          const instanceNum = classInstanceCounters[obj.class]
          const totalInstances = classCounts[obj.class]
          
          // Show instance number only if there are multiple of same class
          const displayLabel = totalInstances > 1 
            ? `${obj.label} #${instanceNum}` 
            : obj.label
          
          return (
            <div 
              key={obj.id}
              onClick={() => onToggleSelection(obj.id)}
              className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 
                ${isSelected
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md transform scale-[1.02]'
                  : 'bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              style={{ 
                borderColor: isSelected ? color : '#e2e8f0',
                borderWidth: isSelected ? '3px' : '2px'
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Icon with matching bounding box color */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 relative"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-white font-bold text-lg">{obj.label[0].toUpperCase()}</span>
                  {totalInstances > 1 && (
                    <span className="absolute -top-1 -right-1 bg-white text-slate-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {instanceNum}
                    </span>
                  )}
                </div>
                
                {/* Object info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-800 text-base capitalize">{displayLabel}</p>
                    {/* Color indicator matching bbox */}
                    <div 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: color }}
                      title="Matches bounding box color"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="confidence-bar w-24">
                      <div 
                        className="confidence-fill" 
                        style={{ 
                          width: `${confidencePercent}%`,
                          backgroundColor: color
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{confidencePercent}%</span>
                  </div>
                </div>
              </div>
              
              {/* Checkbox */}
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                ${isSelected
                  ? 'scale-110'
                  : 'border-slate-300 group-hover:border-slate-400'
                }`}
                style={{ 
                  backgroundColor: isSelected ? color : 'transparent',
                  borderColor: isSelected ? color : undefined
                }}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DetectedObjects