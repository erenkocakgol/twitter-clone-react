import { useState, useCallback } from 'react'
import { usersAPI, followsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchProfile = useCallback(async (username) => {
    setLoading(true)
    setError(null)
    try {
      const response = await usersAPI.profile(username)
      // API yapısı: { success: true, data: { ...user } }
      // Axios response.data -> { success: true, data: { ... } }
      // Kullanıcı verisi -> response.data.data
      const userData = response.data?.data || response.data?.user || response.data
      
      if (!userData) {
        throw new Error('Kullanıcı verisi boş')
      }

      setProfile(userData)
      return userData
    } catch (err) {
      console.error('Profil yükleme hatası:', err)
      setError(err.response?.data?.message || err.message || 'Profil yüklenemedi')
      setProfile(null) // Hata durumunda profili sıfırla
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await usersAPI.update(data)
      const userData = response.data?.data || response.data
      setProfile(userData)
      toast.success('Profil güncellendi!')
      return userData
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profil güncellenemedi')
      throw err
    }
  }, [toast])

  const toggleFollow = useCallback(async (userId, isFollowing) => {
    // API username bekliyor olabilir, ancak profile.id gönderiyoruz.
    // Eğer followsAPI username bekliyorsa profile.username kullanın.
    // Şimdilik gelen userId parametresini kullanıyoruz.
    try {
      if (isFollowing) {
        await followsAPI.unfollow(userId)
      } else {
        await followsAPI.follow(userId)
      }
      
      setProfile(prev => {
        if (!prev) return prev
        return {
          ...prev,
          is_following: !isFollowing,
          followers_count: (parseInt(prev.followers_count) || 0) + (isFollowing ? -1 : 1)
        }
      })
      
      if (!isFollowing) toast.success('Takip edildi')
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }, [toast])

  const fetchFollowers = useCallback((username, page) => followsAPI.followers(username, page), [])
  const fetchFollowing = useCallback((username, page) => followsAPI.following(username, page), [])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    toggleFollow,
    fetchFollowers,
    fetchFollowing
  }
}