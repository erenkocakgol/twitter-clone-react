import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  helper,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  
  const inputType = type === 'password' && showPassword ? 'text' : type
  const hasError = !!error
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-twitter-black">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-twitter-lightGray">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-twitter-blue/20
            ${Icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${hasError ? 'border-red-500 focus:border-red-500' : 'border-twitter-lightGray focus:border-twitter-blue'}
            ${className}
          `}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-twitter-lightGray hover:text-twitter-darkGray transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {(error || helper) && (
        <p className={`text-sm flex items-center gap-1 ${hasError ? 'text-red-500' : 'text-twitter-darkGray'}`}>
          {hasError && <AlertCircle className="w-4 h-4" />}
          {error || helper}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input