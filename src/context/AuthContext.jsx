import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react'
import { authAPI, usersAPI } from '../services/api' // api.js dosyasından import ediyoruz

/* =======================
   Context & Hook
   ======================= */

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/* =======================
   Token Helpers
   ======================= */

// Token okuma işlemi Axios Interceptor tarafından yapıldığı için
// burada sadece yazma ve silme işlemleri yeterlidir.

const setStoredToken = (token, remember = true) => {
  // Temizle
  localStorage.removeItem('access_token')
  sessionStorage.removeItem('access_token')

  if (remember) {
    localStorage.setItem('access_token', token)
  } else {
    sessionStorage.setItem('access_token', token)
  }
}

const clearStoredToken = () => {
  localStorage.removeItem('access_token')
  sessionStorage.removeItem('access_token')
}

// Helper: Token var mı kontrolü (Request atmadan önce UI göstermek için)
const hasStoredToken = () => {
  return !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
}

/* =======================
   Provider
   ======================= */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* =======================
     Initial auth check
     ======================= */

  useEffect(() => {
    const checkAuth = async () => {
      // Eğer token yoksa direkt guest moduna geç, istek atma
      if (!hasStoredToken()) {
        setLoading(false)
        return
      }

      try {
        // authAPI.me() kullanıyoruz
        const response = await authAPI.me()
        
        // Yanıt yapısı: { success: true, data: { ...user } }
        const userData = response.data?.data || response.data

        setUser(userData)
      } catch (error) {
        // 401 veya başka hata durumunda temizle
        console.error('Auth check failed:', error)
        clearStoredToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /* =======================
     Auth Actions
     ======================= */

  const login = useCallback(async (email, password, remember = true) => {
    try {
      const response = await authAPI.login(email, password)
      
      // Beklenen yapı: { success: true, data: { token: "...", user: {...} } }
      const responseData = response.data?.data
      
      if (!responseData?.token) {
        throw new Error("Token alınamadı, yanıt formatını kontrol edin.")
      }

      const { token, user: userData } = responseData

      // Token'ı kaydet (Axios interceptor bir sonraki istekte bunu okuyacak)
      setStoredToken(token, remember)
      
      // State'i güncelle
      setUser(userData)

      return userData
    } catch (error) {
      console.error("Login Error:", error)
      throw error
    }
  }, [])

  const register = useCallback(async (data) => {
    // authAPI.register kullanımı
    const response = await authAPI.register(data)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error) // Hata olsa bile client tarafında çıkış yap
    } finally {
      clearStoredToken()
      setUser(null)
      // Opsiyonel: Login sayfasına yönlendirme component içinde veya burada yapılabilir
      // window.location.href = '/login' // SPA mantığına aykırı olabilir, useNavigate tercih edilir
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    const response = await authAPI.forgotPassword(email)
    return response.data
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    const response = await authAPI.resetPassword(token, password)
    return response.data
  }, [])

  const verifyEmail = useCallback(async (token) => {
    const response = await authAPI.verifyEmail(token)
    return response.data
  }, [])

  const resendVerification = useCallback(async (email) => {
    const response = await authAPI.resendVerification(email)
    return response.data
  }, [])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const response = await authAPI.changePassword(currentPassword, newPassword)
    return response.data
  }, [])

  const deleteAccount = useCallback(async (password) => {
    const response = await usersAPI.deleteAccount(password)
    clearStoredToken()
    setUser(null)
    return response.data
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.me()
      const userData = response.data?.data || response.data
      setUser(userData)
      return userData
    } catch (error) {
      console.error('User refresh failed:', error)
      throw error
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    // usersAPI kullanımı
    const response = await usersAPI.update(data)
    
    // API, güncellenmiş kullanıcıyı döndürüyorsa state'i güncelle
    const updatedUser = response.data?.data?.user || response.data?.data || response.data?.user
    
    if (updatedUser) {
      // Mevcut user state'i ile birleştir (API tam obje dönmezse diye önlem)
      setUser(prev => ({ ...prev, ...updatedUser }))
    }
    
    return response.data
  }, [])

  /* =======================
     Helpers
     ======================= */

  const isGuest = !user
  const isAuthenticated = !!user
  
  // Admin kontrolünü string/number karmaşasına karşı güvenli hale getirdik
  const isAdmin = 
    user?.role === 'admin' || 
    user?.is_admin === true || 
    user?.is_admin === 1 || 
    user?.is_admin === '1'

  /* =======================
     Context value
     ======================= */

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    deleteAccount,
    refreshUser,
    updateProfile,
    setUser // Nadir durumlar için manuel state güncelleme
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}