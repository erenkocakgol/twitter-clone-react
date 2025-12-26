// API Constants
export const API_URL = 'https://sanatsepet.tr/api'

// Pagination
export const POSTS_PER_PAGE = 20
export const COMMENTS_PER_PAGE = 20
export const USERS_PER_PAGE = 20

// Upload limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
export const MAX_IMAGES_PER_POST = 3
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Post limits
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_COMMENT_LENGTH = 500
export const MAX_BIO_LENGTH = 160
export const MAX_TAGS = 10

// Username constraints
export const MIN_USERNAME_LENGTH = 3
export const MAX_USERNAME_LENGTH = 20
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

// Password constraints
export const MIN_PASSWORD_LENGTH = 8

// Report reasons
export const REPORT_REASONS = {
  POST: [
    { value: 'spam', label: 'Spam veya yanıltıcı içerik' },
    { value: 'harassment', label: 'Taciz veya zorbalık' },
    { value: 'hate_speech', label: 'Nefret söylemi' },
    { value: 'violence', label: 'Şiddet içeren içerik' },
    { value: 'adult', label: 'Yetişkin içerik' },
    { value: 'copyright', label: 'Telif hakkı ihlali' },
    { value: 'other', label: 'Diğer' }
  ],
  COMMENT: [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Taciz' },
    { value: 'hate_speech', label: 'Nefret söylemi' },
    { value: 'other', label: 'Diğer' }
  ],
  USER: [
    { value: 'spam', label: 'Spam hesap' },
    { value: 'impersonation', label: 'Kimlik taklidi' },
    { value: 'harassment', label: 'Taciz' },
    { value: 'other', label: 'Diğer' }
  ]
}

// User roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
}

// Report statuses
export const REPORT_STATUSES = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
}

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Ana Sayfa', icon: 'Home' },
  { path: '/search', label: 'Keşfet', icon: 'Search' },
  { path: '/profile', label: 'Profil', icon: 'User' }
]

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/users', label: 'Kullanıcılar', icon: 'Users' },
  { path: '/admin/posts', label: 'Gönderiler', icon: 'FileText' },
  { path: '/admin/reports', label: 'Raporlar', icon: 'Flag' },
  { path: '/admin/settings', label: 'Site Ayarları', icon: 'Settings' },
  { path: '/admin/seo', label: 'SEO', icon: 'Search' },
  { path: '/admin/adsense', label: 'AdSense', icon: 'DollarSign' }
]

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
  UNAUTHORIZED: 'Oturumunuz sonlandı. Lütfen tekrar giriş yapın.',
  FORBIDDEN: 'Bu işlemi gerçekleştirmek için yetkiniz yok.',
  NOT_FOUND: 'Aradığınız içerik bulunamadı.',
  VALIDATION_ERROR: 'Lütfen tüm alanları doğru şekilde doldurun.',
  SERVER_ERROR: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
  UPLOAD_ERROR: 'Dosya yüklenirken bir hata oluştu.',
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük. Maksimum 5MB yükleyebilirsiniz.',
  INVALID_FILE_TYPE: 'Geçersiz dosya türü. Sadece JPG, PNG, GIF ve WEBP desteklenir.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Giriş başarılı!',
  REGISTER: 'Kayıt başarılı! Lütfen e-postanızı doğrulayın.',
  LOGOUT: 'Çıkış yapıldı.',
  PASSWORD_RESET: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi.',
  PASSWORD_CHANGED: 'Şifreniz başarıyla değiştirildi.',
  EMAIL_VERIFIED: 'E-postanız doğrulandı! Artık giriş yapabilirsiniz.',
  PROFILE_UPDATED: 'Profiliniz güncellendi.',
  POST_CREATED: 'Gönderiniz paylaşıldı!',
  POST_DELETED: 'Gönderi silindi.',
  COMMENT_ADDED: 'Yorumunuz eklendi.',
  REPORT_SUBMITTED: 'Raporunuz alındı. İncelenecektir.'
}

// Placeholder images
export const PLACEHOLDERS = {
  AVATAR: '/placeholder-avatar.png',
  BANNER: '/placeholder-banner.jpg',
  POST_IMAGE: '/placeholder-post.jpg'
}

// Social links for footer (optional)
export const SOCIAL_LINKS = [
  { name: 'Twitter', url: '#', icon: 'Twitter' },
  { name: 'Instagram', url: '#', icon: 'Instagram' },
  { name: 'GitHub', url: '#', icon: 'Github' }
]
