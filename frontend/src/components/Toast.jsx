import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  }

  const styles = {
    success: 'bg-emerald-50 border-emerald-500 text-emerald-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-amber-50 border-amber-500 text-amber-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  }

  return (
    <div className={`fixed top-24 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border-l-4 shadow-2xl animate-slide-in-right ${styles[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="font-semibold flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export default Toast
