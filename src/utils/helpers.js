import { formatDistanceToNow, format, isThisYear, isValid } from 'date-fns'
import { tr } from 'date-fns/locale'

// Güvenli tarih oluşturma yardımcısı
const createSafeDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return isValid(date) ? date : null
}

// Format date for posts
export function formatPostDate(dateString) {
  const date = createSafeDate(dateString)
  if (!date) return ''

  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'şimdi'
  if (diffInMinutes < 60) return `${diffInMinutes}dk`
  if (diffInHours < 24) return `${diffInHours}sa`
  if (diffInDays < 7) return `${diffInDays}g`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}h`
  
  if (isThisYear(date)) {
    return format(date, 'd MMM', { locale: tr })
  }
  
  return format(date, 'd MMM yyyy', { locale: tr })
}

// Format relative time
export function formatRelativeTime(dateString) {
  const date = createSafeDate(dateString)
  if (!date) return ''
  return formatDistanceToNow(date, { addSuffix: true, locale: tr })
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Format date for detailed view
export function formatDetailedDate(dateString) {
  const date = createSafeDate(dateString)
  if (!date) return ''
  return format(date, "d MMMM yyyy 'saat' HH:mm", { locale: tr })
}

// Convert title to URL slug
export function slugify(text) {
  if (!text) return ''
  const turkishMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  }

  return text
    .toLowerCase()
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, char => turkishMap[char] || char)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Validate email format
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username format
export function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Validate password strength
export function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('En az 8 karakter olmalı')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermeli')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermeli')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('En az bir rakam içermeli')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Format number with K, M suffixes
export function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

// Truncate text with ellipsis
export function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Extract hashtags from text
export function extractHashtags(text) {
  if (!text) return []
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

// Parse tags from comma-separated string
export function parseTags(tagString) {
  if (!tagString) return []
  
  // Türkçe karakter dönüşümü
  const turkishMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  }
  
  return tagString
    .split(',')
    .map(tag => {
      // Küçük harfe çevir
      let normalized = tag.trim().toLowerCase()
      // Türkçe karakterleri İngilizceye çevir
      normalized = normalized.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => turkishMap[char] || char)
      // Sadece a-z, 0-9 ve tire/alt çizgi karakterlerini tut
      normalized = normalized.replace(/[^a-z0-9-_]/g, '')
      return normalized
    })
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Max 10 tags
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Check if URL is valid image
export function isValidImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

// Share URL (Web Share API)
export async function shareUrl(title, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return true
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
      }
      return false
    }
  }
  return copyToClipboard(url)
}

// Local storage helpers
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}