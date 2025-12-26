import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import { usePosts } from '../hooks/usePosts'
import { postsAPI } from '../services/api'
import SearchBar from '../components/search/SearchBar'
import SearchFilters from '../components/search/SearchFilters'
import SearchResults from '../components/search/SearchResults'
import PostCard from '../components/post/PostCard'
import { PageSpinner } from '../components/common/Spinner'
import Spinner from '../components/common/Spinner'
import Button from '../components/common/Button'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const {
    results,
    loading,
    error,
    hasMore,
    search,
    loadMore
  } = useSearch()
  
  const { toggleStar, toggleRepost, deletePost } = usePosts()

  const [query, setQuery] = useState(initialQuery)
  const [filter, setFilter] = useState('all')
  const [hasSearched, setHasSearched] = useState(false)
  
  // Trending Topics state
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loadingTrending, setLoadingTrending] = useState(true)

  useEffect(() => {
    fetchTrendingTopics()
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [])

  const fetchTrendingTopics = async () => {
    try {
      const response = await postsAPI.trendingTags(10)
      const tags = response.data?.data || response.data || []
      setTrendingTopics(tags)
    } catch (error) {
      console.error('Trending topics yüklenemedi:', error)
      setTrendingTopics([])
    } finally {
      setLoadingTrending(false)
    }
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return
    
    setQuery(searchQuery)
    setSearchParams({ q: searchQuery })
    setHasSearched(true)
    await search(searchQuery, filter)
  }

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter)
    if (query.trim()) {
      await search(query, newFilter)
    }
  }

  const handleLoadMore = async () => {
    await loadMore(query, filter)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-twitter-extraLightGray">
        <h1 className="text-xl font-bold text-twitter-black mb-3">Keşfet</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* Filters */}
      {hasSearched && (
        <SearchFilters
          activeFilter={filter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Content */}
      {loading && results.posts?.length === 0 && results.users?.length === 0 ? (
        <PageSpinner />
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="ghost" onClick={() => handleSearch(query)}>
            Tekrar Dene
          </Button>
        </div>
      ) : hasSearched ? (
        /* Search Results */
        <div>
          {(results.posts?.length === 0 && results.users?.length === 0) ? (
            <div className="p-8 text-center text-twitter-darkGray">
              <p className="text-lg mb-2">Sonuç bulunamadı</p>
              <p className="text-sm">Farklı anahtar kelimeler deneyin</p>
            </div>
          ) : (
            <>
              <SearchResults
                results={results}
                filter={filter}
                onStar={toggleStar}
                onRepost={toggleRepost}
                onDelete={deletePost}
              />
              
              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={handleLoadMore}
                    loading={loading}
                  >
                    Daha Fazla Göster
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* Trending Topics */
        <div className="p-4">
          <h2 className="text-lg font-bold text-twitter-black mb-4">
            Popüler Konular
          </h2>
          {loadingTrending ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : trendingTopics.length === 0 ? (
            <div className="text-center py-8 text-twitter-darkGray">
              <p>Henüz popüler konu bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-1">
              {trendingTopics.map((topic, index) => (
                <button
                  key={topic.tag || topic.name || index}
                  onClick={() => handleSearch(`#${topic.tag || topic.name}`)}
                  className="w-full p-3 text-left hover:bg-twitter-extraLightGray rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-twitter-darkGray">
                        {index + 1} · Trend
                      </p>
                      <p className="font-bold text-twitter-black">
                        #{topic.tag || topic.name}
                      </p>
                      <p className="text-sm text-twitter-darkGray">
                        {(topic.count || topic.posts_count || 0).toLocaleString('tr-TR')} gönderi
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
