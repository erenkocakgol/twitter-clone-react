const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4'
}

export default function Spinner({ size = 'md', className = '', color = 'twitter-blue' }) {
  const sizeClass = sizes[size] || sizes.md
  
  return (
    <div
      className={`
        ${sizeClass}
        border-twitter-extraLightGray
        border-t-${color}
        rounded-full
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Yükleniyor"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  )
}

// Full page spinner
export function PageSpinner() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

// Inline spinner with text
export function LoadingText({ text = 'Yükleniyor...' }) {
  return (
    <div className="flex items-center gap-2 text-twitter-darkGray">
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  )
}
