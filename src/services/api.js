import axios from 'axios'

const API_BASE_URL = 'https://sanatsepet.tr'

const getToken = () => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
}

const clearToken = () => {
  localStorage.removeItem('access_token')
  sessionStorage.removeItem('access_token')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // İstek zaman aşımı eklemek iyidir
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      // PHP tarafındaki getAuthorizationHeader ile tam uyumlu
      config.headers['X-Auth-Token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // 401 Hatası Kontrolü
      if (error.response.status === 401) {
        clearToken()
        
        const currentPath = window.location.pathname
        const publicPaths = ['/login', '/register', '/forgot-password']
        
        // Eğer zaten login sayfasındaysak yönlendirme yapma (Döngü engelleme)
        if (!publicPaths.includes(currentPath)) {
          // Kullanıcıyı login'e gönderirken geldiği sayfayı "redirect" olarak saklayabilirsin
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
        }
      }

      // Backend'den gelen spesifik hata mesajını önceliklendir
      error.message = error.response.data?.message || error.response.data?.error || 'Bir hata oluştu'
    } else if (error.request) {
      error.message = 'Sunucuya bağlanılamadı, lütfen internet bağlantınızı kontrol edin.'
    }
    
    return Promise.reject(error)
  }
)

// --- API ENDPOINTS ---

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/api/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  me: () => api.get('/api/auth/me'),
}

export const adminAPI = {
  dashboard: () => api.get('/api/admin/dashboard'),
  users: (page = 1, perPage = 20, search = '', filter = 'all') => 
    api.get(`/api/admin/users?page=${page}&per_page=${perPage}&q=${encodeURIComponent(search)}&filter=${filter}`),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  posts: (page = 1, perPage = 20, search = '') => 
    api.get(`/api/admin/posts?page=${page}&per_page=${perPage}&q=${encodeURIComponent(search)}`),
  getPost: (id) => api.get(`/api/admin/posts/${id}`),
  deletePost: (id) => api.delete(`/api/admin/posts/${id}`),
  reports: (page = 1, perPage = 20, status = 'all') => 
    api.get(`/api/admin/reports?page=${page}&per_page=${perPage}&status=${status}`),
  getReport: (id) => api.get(`/api/admin/reports/${id}`),
  updateReport: (id, data) => api.put(`/api/admin/reports/${id}`, data),
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (settings) => api.put('/api/admin/settings', settings),
  getSEO: () => api.get('/api/admin/seo'),
  updateSEO: (seo) => api.put('/api/admin/seo', seo),
  getAdsense: () => api.get('/api/admin/adsense'),
  updateAdsense: (adsense) => api.put('/api/admin/adsense', adsense),
}

export const postsAPI = {
  create: (data) => api.post('/api/posts', data),
  delete: (slug) => api.delete(`/api/posts/${slug}`),
  get: (id) => api.get(`/api/posts/${id}`),
  getBySlug: (slug) => api.get(`/api/posts/${slug}`),
  list: (page = 1, perPage = 20) => api.get(`/api/posts?page=${page}&per_page=${perPage}`),
  feed: (page = 1, perPage = 20) => api.get(`/api/posts?page=${page}&per_page=${perPage}`),
  star: (slug) => api.post(`/api/posts/${slug}/star`),
  unstar: (slug) => api.delete(`/api/posts/${slug}/star`),
  repost: (slug) => api.post(`/api/posts/${slug}/repost`),
  unrepost: (slug) => api.delete(`/api/posts/${slug}/repost`),
  userPosts: (username, page = 1) => api.get(`/api/posts/user/${username}?page=${page}`),
  userReposts: (username, page = 1) => api.get(`/api/posts/user/${username}/reposts?page=${page}`),
  userStarred: (username, page = 1) => api.get(`/api/posts/user/${username}/starred?page=${page}`),
  search: (query, page = 1, tag = null) => {
    let url = `/api/posts/search?q=${encodeURIComponent(query)}&page=${page}`
    if (tag) url += `&tag=${encodeURIComponent(tag)}`
    return api.get(url)
  },
  trendingTags: (limit = 10) => api.get(`/api/posts/trending-tags?limit=${limit}`),
  comments: (slug, page = 1) => api.get(`/api/posts/${slug}/comments?page=${page}`),
  addComment: (slug, content) => api.post(`/api/posts/${slug}/comments`, { content }),
}

export const commentsAPI = {
  delete: (id) => api.delete(`/api/comments/${id}`),
  list: (slug, page = 1) => api.get(`/api/posts/${slug}/comments?page=${page}`),
  create: (slug, content) => api.post(`/api/posts/${slug}/comments`, { content }),
}

export const usersAPI = {
  profile: (username) => api.get(`/api/users/${username}`),
  update: (data) => api.put('/api/users/profile', data),
  search: (query, page = 1) => api.get(`/api/users/search?q=${encodeURIComponent(query)}&page=${page}`),
  deleteAccount: (password) => api.delete('/api/users/account', { data: { password } }),
  // Yeni endpoint'ler
  suggested: (limit = 5) => api.get(`/api/users/suggested?limit=${limit}`),
  blocked: (page = 1) => api.get(`/api/users/blocked?page=${page}`),
  block: (username) => api.post(`/api/users/${username}/block`),
  unblock: (username) => api.delete(`/api/users/${username}/block`),
  updateUsername: (username) => api.put('/api/users/username', { username }),
  updateEmail: (email) => api.put('/api/users/email', { email }),
  updateNotifications: (settings) => api.put('/api/users/notifications', settings),
  getNotifications: () => api.get('/api/users/notifications'),
  updatePrivacy: (settings) => api.put('/api/users/privacy', settings),
  getPrivacy: () => api.get('/api/users/privacy'),
}

export const followsAPI = {
  follow: (username) => api.post(`/api/follows/${username}`),
  unfollow: (username) => api.delete(`/api/follows/${username}`),
  followers: (username, page = 1) => api.get(`/api/follows/${username}/followers?page=${page}`),
  following: (username, page = 1) => api.get(`/api/follows/${username}/following?page=${page}`),
}

export const searchAPI = {
  posts: (query, page = 1, tag = null) => postsAPI.search(query, page, tag),
  users: (query, page = 1) => usersAPI.search(query, page),
}

export const reportsAPI = {
  create: (data) => api.post('/api/reports', data),
}

export const uploadAPI = {
  avatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  cover: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  post: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/upload/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // Generic image upload function that accepts type parameter
  image: (file, type = 'post') => {
    const formData = new FormData()
    formData.append('file', file)
    const endpoint = type === 'avatar' ? 'avatar' : type === 'cover' ? 'cover' : 'post'
    return api.post(`/api/upload/${endpoint}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const messagesAPI = {
  conversations: (page = 1) => api.get(`/api/messages/conversations?page=${page}`),
  messages: (conversationId, page = 1) => api.get(`/api/messages/${conversationId}?page=${page}`),
  send: (recipientId, content) => api.post('/api/messages', { recipient_id: recipientId, content }),
  startConversation: (username) => api.post('/api/messages/start', { username }),
  markRead: (conversationId) => api.post(`/api/messages/${conversationId}/read`),
  unreadCount: () => api.get('/api/messages/unread-count'),
  hideConversation: (conversationId) => api.delete(`/api/messages/${conversationId}`),
}

export const settingsAPI = {
  public: () => api.get('/api/settings/public'),
  seo: () => api.get('/api/settings/seo'),
  adsense: () => api.get('/api/settings/adsense'),
}

export default api
