import { useState } from 'react'
import { User } from 'lucide-react'
import { getInitials } from '../../utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-32 h-32 text-3xl'
}

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  onClick
}) {
  const [hasError, setHasError] = useState(false)
  const sizeClass = sizes[size] || sizes.md

  const handleError = () => {
    setHasError(true)
  }

  const Wrapper = onClick ? 'button' : 'div'

  if (src && !hasError) {
    return (
      <Wrapper
        onClick={onClick}
        className={`${sizeClass} ${className} rounded-full overflow-hidden flex-shrink-0 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      >
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </Wrapper>
    )
  }

  // Fallback with initials or icon
  const initials = name ? getInitials(name) : null

  return (
    <Wrapper
      onClick={onClick}
      className={`
        ${sizeClass} ${className}
        rounded-full flex-shrink-0
        bg-twitter-extraLightGray text-twitter-darkGray
        flex items-center justify-center font-medium
        ${onClick ? 'cursor-pointer hover:bg-twitter-lightGray transition-colors' : ''}
      `}
    >
      {initials || <User className="w-1/2 h-1/2" />}
    </Wrapper>
  )
}
