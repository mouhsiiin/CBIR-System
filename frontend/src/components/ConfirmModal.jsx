import { AlertTriangle, X } from 'lucide-react'

function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    primary: 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-red-600' : type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-lg font-semibold transition-colors ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
