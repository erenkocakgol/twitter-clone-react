import { useState, useCallback } from 'react'
import { postsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { slugify } from '../utils/helpers'

export function usePosts() {
  const [posts, setPosts] = useState([]) 
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const toast = useToast()

  // --- YARDIMCI FONKSİYONLAR ---

  const filterDuplicates = (arr) => {
    const seen = new Set()
    return arr.filter(item => {
      const id = item.id || item._id
      if (!id) return false
      
      const idStr = String(id)
      if (seen.has(idStr)) return false
      
      seen.add(idStr)
      return true
    })
  }

  const extractPosts = (data) => {
    if (!data) return []
    const possiblePaths = [
      data.posts,
      data.data?.posts,
      data.data,
      data
    ]
    for (const path of possiblePaths) {
      if (Array.isArray(path)) return path
    }
    return []
  }

  const mergePosts = (existing, incoming) => {
    const seen = new Set(existing.map(p => String(p.id || p._id)))
    const uniqueIncoming = incoming.filter(p => {
      const id = p.id || p._id
      return id && !seen.has(String(id))
    })
    return [...existing, ...uniqueIncoming]
  }

  // Listeden doğru postu bul (Repost wrapper'larını da kontrol et)
  const findTargetPost = (list, postId) => {
    // Önce direkt ID eşleşmesine bak
    let found = list.find(p => p.id === postId)
    
    // Bulamazsak, orijinal post ID'sine bak (repost edilmişse)
    if (!found) {
      found = list.find(p => p.original_post?.id === postId)
      // Eğer wrapper bulduysak, içindeki original_post'u hedef al
      if (found && found.original_post) {
        return found.original_post
      }
    }
    
    // Repost wrapper'ı değilse kendisini döndür
    return found?.original_post || found
  }

  // Doğru identifier'ı belirle (Slug > Başlıktan Slug > ID)
  const getIdentifier = (post, fallbackId) => {
    if (!post) return fallbackId
    // 1. Varsa API'den gelen slug'ı kullan
    if (post.slug) return post.slug
    // 2. Yoksa başlıktan slug üret (ID eklemeden!)
    if (post.title) return slugify(post.title)
    // 3. O da yoksa ID kullan
    return fallbackId
  }

  // --- ACTIONS (API ÇAĞRILARI) ---

  const fetchFeed = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await postsAPI.feed(pageNum)
      const postsData = extractPosts(response.data)
      const uniqueNewPosts = filterDuplicates(postsData)
      
      if (pageNum === 1) {
        setPosts(uniqueNewPosts)
      } else {
        setPosts(prev => mergePosts(prev, uniqueNewPosts))
      }
      
      setHasMore(uniqueNewPosts.length >= 20 || postsData.length >= 20)
      setPage(pageNum)
    } catch (err) {
      console.error('Feed yükleme hatası:', err)
      setError(err.message || 'Akış yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserPosts = useCallback(async (username, pageNum = 1) => {
    setLoading(true)
    try {
      const response = await postsAPI.userPosts(username, pageNum)
      const postsData = extractPosts(response.data)
      const uniqueNewPosts = filterDuplicates(postsData)
      
      if (pageNum === 1) {
        setPosts(uniqueNewPosts)
      } else {
        setPosts(prev => mergePosts(prev, uniqueNewPosts))
      }
      
      setHasMore(uniqueNewPosts.length >= 20 || postsData.length >= 20)
      setPage(pageNum)
    } catch (err) {
      console.error('Kullanıcı postları hatası:', err)
      setError(err.message || 'Gönderiler yüklenemedi')
      if (pageNum === 1) setPosts([]) 
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserReposts = useCallback(async (username, pageNum = 1) => {
    setLoading(true)
    try {
      const response = await postsAPI.userReposts(username, pageNum)
      const postsData = extractPosts(response.data)
      const uniqueNewPosts = filterDuplicates(postsData)
      
      if (pageNum === 1) {
        setPosts(uniqueNewPosts)
      } else {
        setPosts(prev => mergePosts(prev, uniqueNewPosts))
      }
      
      setHasMore(uniqueNewPosts.length >= 20 || postsData.length >= 20)
      setPage(pageNum)
    } catch (err) {
      console.error('Kullanıcı repostları hatası:', err)
      setError(err.message || 'Repostlar yüklenemedi')
      if (pageNum === 1) setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserStarred = useCallback(async (username, pageNum = 1) => {
    setLoading(true)
    try {
      const response = await postsAPI.userStarred(username, pageNum)
      const postsData = extractPosts(response.data)
      const uniqueNewPosts = filterDuplicates(postsData)
      
      if (pageNum === 1) {
        setPosts(uniqueNewPosts)
      } else {
        setPosts(prev => mergePosts(prev, uniqueNewPosts))
      }
      
      setHasMore(uniqueNewPosts.length >= 20 || postsData.length >= 20)
      setPage(pageNum)
    } catch (err) {
      console.error('Kullanıcı starred hatası:', err)
      setError(err.message || 'Beğenilenler yüklenemedi')
      if (pageNum === 1) setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createPost = useCallback(async (postData) => {
    try {
      const response = await postsAPI.create(postData)
      const newPost = response.data.post || response.data.data || response.data
      
      setPosts(prev => {
        const newId = String(newPost.id || newPost._id)
        if (prev.some(p => String(p.id || p._id) === newId)) return prev
        return [newPost, ...prev]
      })
      
      toast.success('Gönderi paylaşıldı')
      return newPost
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gönderi paylaşılamadı')
      throw err
    }
  }, [toast])

  const toggleStar = useCallback(async (postId) => {
    try {
      const targetPost = findTargetPost(posts, postId)
      if (!targetPost) return

      const identifier = getIdentifier(targetPost, postId)

      // Toggle mantığı: Zaten beğenilmişse unstar, değilse star çağır
      if (targetPost.is_starred) {
        await postsAPI.unstar(identifier)
      } else {
        await postsAPI.star(identifier)
      }
      
      setPosts(prev => prev.map(p => {
        // Hem ana postu hem de wrapper içindeki original_post'u güncelle
        if (p.id === postId) {
            const isStarred = !p.is_starred
            return {
                ...p,
                is_starred: isStarred,
                stars_count: Math.max((parseInt(p.stars_count) || 0) + (isStarred ? 1 : -1), 0)
            }
        }
        if (p.original_post && p.original_post.id === postId) {
             const isStarred = !p.original_post.is_starred
             return {
                 ...p,
                 original_post: {
                     ...p.original_post,
                     is_starred: isStarred,
                     stars_count: Math.max((parseInt(p.original_post.stars_count) || 0) + (isStarred ? 1 : -1), 0)
                 }
             }
        }
        return p
      }))
    } catch (err) {
      console.error('Star hatası:', err)
      toast.error('İşlem başarısız')
    }
  }, [posts, toast])

  const toggleRepost = useCallback(async (postId) => {
    try {
      const targetPost = findTargetPost(posts, postId)
      if (!targetPost) return

      const identifier = getIdentifier(targetPost, postId)

      // Toggle mantığı: Zaten repost edilmişse unrepost, değilse repost çağır
      if (targetPost.is_reposted) {
        await postsAPI.unrepost(identifier)
        toast.success('Repost geri alındı')
      } else {
        await postsAPI.repost(identifier)
        toast.success('Repost edildi')
      }

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const isReposted = !p.is_reposted
            return {
                ...p,
                is_reposted: isReposted,
                reposts_count: Math.max((parseInt(p.reposts_count) || 0) + (isReposted ? 1 : -1), 0)
            }
        }
        if (p.original_post && p.original_post.id === postId) {
             const isReposted = !p.original_post.is_reposted
             return {
                 ...p,
                 original_post: {
                     ...p.original_post,
                     is_reposted: isReposted,
                     reposts_count: Math.max((parseInt(p.original_post.reposts_count) || 0) + (isReposted ? 1 : -1), 0)
                 }
             }
        }
        return p
      }))
    } catch (err) {
      console.error('Repost hatası:', err)
      toast.error('İşlem başarısız')
    }
  }, [posts, toast])

  const deletePost = useCallback(async (postId) => {
    try {
      const targetPost = findTargetPost(posts, postId)
      const identifier = getIdentifier(targetPost, postId)

      await postsAPI.delete(identifier)
      
      setPosts(prev => prev.filter(p => p.id !== postId && p.original_post?.id !== postId))
      toast.success('Gönderi silindi')
    } catch (err) {
      console.error('Delete hatası:', err)
      toast.error('Gönderi silinemedi')
    }
  }, [posts, toast])

  const loadMore = useCallback(async (fetchFunc, ...args) => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    const funcToCall = fetchFunc || fetchFeed
    await funcToCall(...args, nextPage)
  }, [loading, hasMore, page, fetchFeed])

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchFeed,
    fetchUserPosts,
    fetchUserReposts,
    fetchUserStarred,
    createPost,
    deletePost,
    toggleStar,
    toggleRepost,
    starPost: toggleStar,     
    repostPost: toggleRepost, 
    loadMore
  }
}