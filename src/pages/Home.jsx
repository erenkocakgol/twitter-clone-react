import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../hooks/useAuth'
import PostCard from '../components/post/PostCard'
import PostForm from '../components/post/PostForm'
import { AdCardPlaceholder } from '../components/ads/AdCard'
import { PageSpinner } from '../components/common/Spinner'
import Button from '../components/common/Button'

export default function Home() {
  const { user, isGuest } = useAuth()
  const { 
    posts: rawPosts,
    loading, 
    error, 
    hasMore,
    fetchFeed, 
    createPost,
    deletePost,
    starPost,
    repostPost,
    loadMore 
  } = usePosts()
  
  const posts = rawPosts || []
  
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFeed()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFeed()
    setRefreshing(false)
  }

  const handlePostCreated = async (postData) => {
    await createPost(postData)
  }

  const handleDelete = async (postId) => {
    await deletePost(postId)
  }

  const handleStar = async (postId) => {
    await starPost(postId)
  }

  const handleRepost = async (postId) => {
    await repostPost(postId)
  }

  const renderPostsWithAds = useCallback(() => {
    if (!posts?.length) return null
    const elements = []
    posts.forEach((post, index) => {
      elements.push(
        <PostCard
          key={`${post.id}-${index}`}
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            content: post.content,
            images: post.images || [],
            tags: post.tags || [],
            // Kullanıcı bilgileri
            user_id: post.user_id,
            username: post.username,
            userName: post.user_name,
            avatar: post.user_avatar,
            user: post.user || {
              id: post.user_id,
              username: post.username,
              name: post.user_name || post.userName,
              avatar: post.user_avatar || post.avatar
            },
            // Durumlar
            is_starred: post.is_starred,
            is_reposted: post.is_reposted,
            // SAYAÇLAR
            stars_count: post.stars_count,
            reposts_count: post.reposts_count,
            comments_count: post.comments_count,
            // Tarih
            created_at: post.created_at
          }}
          onStar={handleStar}
          onRepost={handleRepost}
          onDelete={handleDelete}
        />
      )

      if ((index + 1) % 5 === 0 && index < posts.length - 1) {
        elements.push(<AdCardPlaceholder key={`ad-${index}`} />)
      }
    })
    return elements
  }, [posts])

  if (loading && (posts?.length ?? 0) === 0) {
    return <PageSpinner />
  }

  return (
    <div className="animate-fade-in">
      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-twitter-blue to-blue-600 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              Üye olarak beğenme, yorum yapma ve paylaşım özelliklerini kullanabilirsiniz.
            </p>
            <Link to="/register">
              <Button size="sm" variant="secondary" className="!bg-white !text-twitter-blue hover:!bg-gray-100">
                <LogIn className="w-4 h-4 mr-1" />
                Üye Ol
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-twitter-extraLightGray">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-twitter-black">Ana Sayfa</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-icon text-twitter-blue"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Post Form */}
      {user && (
        <div className="border-b border-twitter-extraLightGray">
          <PostForm onSubmit={handlePostCreated} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 text-center text-red-500">
          <p>{error}</p>
          <Button variant="ghost" onClick={handleRefresh} className="mt-2">
            Tekrar Dene
          </Button>
        </div>
      )}
      
      {/* Posts Feed */}
      {(posts?.length ?? 0) === 0 && !loading ? (
        <div className="p-8 text-center text-twitter-darkGray">
          <p className="text-lg mb-2">Henüz gönderi yok</p>
          <p className="text-sm">
            {user 
              ? 'İlk gönderiyi paylaşın veya birilerini takip edin!'
              : 'Giriş yaparak içerikleri keşfetmeye başlayın.'}
          </p>
        </div>
      ) : (
        <>
          {renderPostsWithAds()}
          
          {/* Load More */}
          {hasMore && (
            <div className="p-4 text-center">
              <Button
                variant="ghost"
                onClick={loadMore}
                loading={loading}
              >
                Daha Fazla Göster
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}