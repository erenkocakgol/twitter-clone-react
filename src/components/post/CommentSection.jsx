import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { postsAPI, commentsAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import CommentItem from './CommentItem'
import { PageSpinner } from '../common/Spinner'
import { MAX_COMMENT_LENGTH } from '../../utils/constants'

export default function CommentSection({ postId, postSlug, onComment, onCommentDelete }) {
  const { user } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (postSlug || postId) {
      fetchComments()
    }
  }, [postSlug, postId])

  const fetchComments = async (pageNum = 1) => {
    try {
      const slug = postSlug || postId
      const response = await postsAPI.comments(slug, pageNum)
      // API yanıtını normalize et (farklı backend yanıt tiplerini kapsar)
      const commentsData = response.data?.data || response.data?.comments || response.data || []
      
      // Verinin dizi olduğundan emin ol
      const safeComments = Array.isArray(commentsData) ? commentsData : []
      
      if (pageNum === 1) {
        setComments(safeComments)
      } else {
        setComments(prev => [...prev, ...safeComments])
      }
      setHasMore(safeComments.length === 20)
      setPage(pageNum)
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error)
      toast.error('Yorumlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const slug = postSlug || postId
      const response = await postsAPI.addComment(slug, content.trim())
      const newComment = response.data?.data || response.data?.comment || response.data
      
      if (newComment) {
        setComments(prev => [newComment, ...prev])
        setContent('')
        onComment?.(postId)
        toast.success('Yorumunuz eklendi')
      }
    } catch (error) {
      toast.error(error.message || 'Yorum eklenemedi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await commentsAPI.delete(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      onCommentDelete?.()
      toast.success('Yorum silindi')
    } catch (error) {
      toast.error(error.message || 'Yorum silinemedi')
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchComments(page + 1)
    }
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div>
      {/* Yorum Formu */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-4 border-b border-twitter-extraLightGray">
          <div className="flex gap-3">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Yanıtını yaz..."
                className="w-full resize-none placeholder-twitter-lightGray focus:outline-none bg-transparent min-h-[60px]"
                maxLength={MAX_COMMENT_LENGTH}
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-twitter-lightGray">
                  {content.length}/{MAX_COMMENT_LENGTH}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  loading={submitting}
                  disabled={!content.trim()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Yanıtla
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 text-center text-twitter-darkGray border-b border-twitter-extraLightGray">
          <p>Yorum yapmak için <a href="/login" className="link">giriş yapın</a></p>
        </div>
      )}

      {/* Yorum Listesi */}
      <div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-twitter-darkGray">
            <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          <>
            {comments.map(comment => {
              // Bozuk verileri (id'si olmayan) render etme
              if (!comment || !comment.id) return null
              
              return (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={handleDelete}
                />
              )
            })}

            {hasMore && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                >
                  Daha fazla yorum yükle
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}