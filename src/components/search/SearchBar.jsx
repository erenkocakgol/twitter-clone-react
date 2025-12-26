import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ 
  initialValue = '', 
  onSearch, 
  placeholder = 'Ara...', 
  autoFocus = false,
  showClear = true,
  className = ''
}) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div
        className={`
          flex items-center bg-twitter-extraLightGray rounded-full
          transition-all duration-200
          ${isFocused 
            ? 'ring-2 ring-twitter-blue bg-white' 
            : 'hover:bg-twitter-lightGray'
          }
        `}
      >
        <Search
          size={18}
          className={`
            ml-4 transition-colors
            ${isFocused ? 'text-twitter-blue' : 'text-twitter-gray'}
          `}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            w-full py-2.5 px-3 bg-transparent
            text-twitter-darkGray placeholder-twitter-gray
            focus:outline-none
          "
        />
        {showClear && query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 mr-1 rounded-full hover:bg-twitter-lightGray transition-colors"
          >
            <X size={16} className="text-twitter-gray" />
          </button>
        )}
      </div>
    </form>
  );
}
