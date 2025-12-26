import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import PostDetail from '../components/post/PostDetail'
import { PageSpinner } from '../components/common/Spinner'
import Button from '../components/common/Button'

export default function PostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await postsAPI.getBySlug(slug)
      // DÜZELTME: Backend veriyi 'data' objesi içinde döndürüyor.
      // Önceki hatalı kod: response.data.post
      setPost(response.data.data || response.data.post) 
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gönderi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleStar = async (postId) => {
    try {
      // Toggle mantığı: Zaten beğenilmişse unstar, değilse star
      if (post.is_starred) {
        const response = await postsAPI.unstar(slug)
        setPost(prev => ({
          ...prev,
          is_starred: false,
          stars_count: Math.max((prev.stars_count || 0) - 1, 0)
        }))
      } else {
        const response = await postsAPI.star(slug)
        setPost(prev => ({
          ...prev,
          is_starred: true,
          stars_count: (prev.stars_count || 0) + 1
        }))
      }
    } catch (err) {
      toast.error(err.message || 'İşlem başarısız')
    }
  }

  const handleRepost = async (postId) => {
    try {
      // Toggle mantığı: Zaten repost edilmişse unrepost, değilse repost
      if (post.is_reposted) {
        await postsAPI.unrepost(slug)
        setPost(prev => ({
          ...prev,
          is_reposted: false,
          reposts_count: Math.max((prev.reposts_count || 0) - 1, 0)
        }))
        toast.success('Repost geri alındı')
      } else {
        await postsAPI.repost(slug)
        setPost(prev => ({
          ...prev,
          is_reposted: true,
          reposts_count: (prev.reposts_count || 0) + 1
        }))
        toast.success('Repost yapıldı')
      }
    } catch (err) {
      toast.error(err.message || 'İşlem başarısız')
    }
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
      return
    }
    
    try {
      // Silme işlemi slug üzerinden yapılmalı
      await postsAPI.delete(slug)
      toast.success('Gönderi silindi')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Gönderi silinemedi')
    }
  }

  const handleComment = (postId) => {
    // Yorum yapıldığında sayacı artır
    setPost(prev => ({
      ...prev,
      comments_count: (prev.comments_count || 0) + 1
    }))
  }

  const handleCommentDelete = () => {
    // Yorum silindiğinde sayacı azalt
    setPost(prev => ({
      ...prev,
      comments_count: Math.max((prev.comments_count || 0) - 1, 0)
    }))
  }

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex justify-center gap-2">
          <Button variant="ghost" onClick={fetchPost}>
            Tekrar Dene
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-twitter-darkGray">
        <p className="text-lg mb-4">Gönderi bulunamadı</p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Ana Sayfaya Dön
        </Button>
      </div>
    )
  }

  return (
    <PostDetail
      post={post}
      onStar={handleStar}
      onRepost={handleRepost}
      onDelete={handleDelete}
      onComment={handleComment}
      onCommentDelete={handleCommentDelete}
    />
  )
}