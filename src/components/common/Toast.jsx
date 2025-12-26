import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
}

export default function Toast({ message, type = 'info', onClose }) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = icons[type] || icons.info
  const style = styles[type] || styles.info
  const iconStyle = iconStyles[type] || iconStyles.info

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        ${style}
        ${isExiting ? 'animate-slide-down opacity-0' : 'animate-slide-up'}
        transition-all duration-200
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyle}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
