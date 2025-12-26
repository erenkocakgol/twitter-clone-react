import { useState, useCallback } from 'react'
import { searchAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

export function useSearch() {
  const [results, setResults] = useState({ posts: [], users: [], tags: [] })
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all') // 'all', 'posts', 'users'
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const toast = useToast()

  const search = useCallback(async (searchQuery, type = 'all', pageNum = 1) => {
    if (!searchQuery.trim()) {
      setResults({ posts: [], users: [], tags: [] })
      return
    }

    setLoading(true)
    setQuery(searchQuery)
    setSearchType(type)

    try {
      let newResults = { posts: [], users: [], tags: [] }
      let hasNextPage = false

      if (type === 'posts') {
        // Sadece gönderi ara
        const response = await searchAPI.posts(searchQuery, pageNum)
        // Backend'in yapısına göre data.data veya direkt data olabilir
        const postsData = response.data.data || response.data
        const meta = response.data // meta veriler (current_page, last_page vb.) genellikle kök objede olur

        newResults.posts = postsData
        // Eğer pagination meta verisi varsa kontrol et, yoksa array boş değilse true varsay (veya API yapısına göre düzenle)
        hasNextPage = meta.last_page ? (meta.current_page < meta.last_page) : (postsData.length > 0)

      } else if (type === 'users') {
        // Sadece kullanıcı ara
        const response = await searchAPI.users(searchQuery, pageNum)
        const usersData = response.data.data || response.data
        const meta = response.data

        newResults.users = usersData
        hasNextPage = meta.last_page ? (meta.current_page < meta.last_page) : (usersData.length > 0)

      } else {
        // 'all' durumu: Hem gönderi hem kullanıcı ara (Genelde ilk sayfa için özet gösterilir)
        // Paralel istek atıyoruz
        const [postsRes, usersRes] = await Promise.all([
          searchAPI.posts(searchQuery, 1),
          searchAPI.users(searchQuery, 1)
        ])

        newResults.posts = postsRes.data.data || postsRes.data
        newResults.users = usersRes.data.data || usersRes.data
        
        // 'all' modunda sonsuz kaydırma karmaşık olabileceği için genelde false döner veya sadece post'a göre ayarlanır.
        // Burada basitlik adına 'all' modunda sonsuz kaydırmayı kapatıyoruz veya postların durumuna bakıyoruz.
        hasNextPage = false 
      }
      
      if (pageNum === 1) {
        setResults(newResults)
      } else {
        setResults(prev => ({
          posts: [...prev.posts, ...newResults.posts],
          users: [...prev.users, ...newResults.users],
          tags: [...prev.tags, ...newResults.tags] // Tag arama API'da olmadığı için boş veya mevcut hali korunur
        }))
      }
      
      setPage(pageNum)
      setHasMore(hasNextPage)

    } catch (error) {
      console.error('Search error:', error)
      toast.error(error.message || 'Arama sırasında bir hata oluştu')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || searchType === 'all') return
    await search(query, searchType, page + 1)
  }, [loading, hasMore, query, searchType, page, search])

  const clearResults = useCallback(() => {
    setResults({ posts: [], users: [], tags: [] })
    setQuery('')
    setPage(1)
    setHasMore(true)
  }, [])

  return {
    results,
    loading,
    query,
    searchType,
    hasMore,
    search,
    loadMore,
    clearResults,
    setSearchType
  }
}