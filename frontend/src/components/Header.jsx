// frontend/src/components/Header.jsx

import { Upload, Grid3x3, Sparkles } from 'lucide-react'

function Header({ currentPage, onNavigate }) {
  return (
    <header className="glass-effect border-b border-slate-200/60 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="px-8 py-4 flex items-center justify-between max-w-[1920px] mx-auto">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CBIR System</h1>
              <p className="text-xs text-slate-500 font-medium">Content-Based Image Retrieval</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-2">
            <button 
              onClick={() => onNavigate('upload')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-sm ${
                currentPage === 'upload'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button 
              onClick={() => onNavigate('gallery')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                currentPage === 'gallery'
                  ? 'text-blue-600 bg-blue-50 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span>Gallery</span>
            </button>
          </nav>
        </div>
        
        {/* User Avatar */}
        <div className="relative group">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer transform hover:scale-110 transition-transform">
            U
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
      </div>
    </header>
  )
}

export default Header