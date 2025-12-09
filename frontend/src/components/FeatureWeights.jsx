// ============================================
// src/components/FeatureWeights.jsx
// ============================================

import { useState } from 'react'
import { Search, Sliders, BarChart3 } from 'lucide-react'

function FeatureWeights({ onWeightsChange, onSearch }) {
  const [weights, setWeights] = useState({
    color: 40,
    texture: 60,
    shape: 30
  })

  const handleWeightChange = (feature, value) => {
    const newWeights = { ...weights, [feature]: parseInt(value) }
    setWeights(newWeights)
    onWeightsChange(newWeights)
  }

  const features = [
    { label: 'Color', key: 'color', icon: '🎨', gradient: 'from-rose-500 to-pink-500' },
    { label: 'Texture', key: 'texture', icon: '🧵', gradient: 'from-violet-500 to-purple-500' },
    { label: 'Shape', key: 'shape', icon: '⬛', gradient: 'from-cyan-500 to-blue-500' }
  ]

  return (
    <div className="mt-6 space-y-4">
      {/* Feature Weights Panel */}
      <div className="panel-gradient overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5" />
            <span>Feature Weights</span>
          </h3>
        </div>
        
        <div className="p-5 space-y-5">
          {features.map(({ label, key, icon, gradient }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </label>
                <div className={`badge px-3 py-1 bg-gradient-to-r ${gradient} text-white font-bold shadow-md`}>
                  {weights[key]}%
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights[key]}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                className="w-full cursor-pointer"
              />
            </div>
          ))}
          
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Adjust weights to prioritize different features in similarity search
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <button 
        onClick={() => onSearch(weights)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
      >
        <Search className="w-5 h-5" />
        <span className="text-lg">Search Similar Images</span>
      </button>
      
      <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2">
        <BarChart3 className="w-5 h-5" />
        <span>View Extracted Features</span>
      </button>
    </div>
  )
}

export default FeatureWeights
