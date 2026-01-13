// frontend/src/components/Header.jsx

import { Upload, Grid3x3, Sparkles, Box, Boxes } from 'lucide-react'

function Header({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'upload', label: 'Search', icon: Upload, description: '2D Image Search' },
    { id: 'gallery', label: 'Gallery', icon: Grid3x3, description: '2D Image Gallery' },
    { id: '3d', label: '3D Search', icon: Boxes, description: '3D Model Search' },
    { id: '3d-gallery', label: '3D Gallery', icon: Box, description: '3D Model Gallery' },
  ]

  return (
    <header className="glass-effect border-b border-slate-200/60 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between max-w-[1920px] mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('upload')}>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">CBIR System</h1>
            <p className="text-xs text-slate-500 font-medium">Content-Based Retrieval</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {!isActive && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>
        
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