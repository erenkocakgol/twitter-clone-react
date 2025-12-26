import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Repeat2, Star, Share } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { formatNumber, shareUrl } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'

export default function PostActions({ post, onStar, onRepost, compact = false }) {
  const { user } = useAuth()
  const toast = useToast()
  const [isStarring, setIsStarring] = useState(false)
  const [isReposting, setIsReposting] = useState(false)

  const commentCount = post.comments_count ?? post.comment_count ?? 0
  const repostCount = post.reposts_count ?? post.repost_count ?? 0
  const starCount = post.stars_count ?? post.star_count ?? 0

  const handleStar = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.warning('Beğenmek için giriş yapmalısınız')
      return
    }
    if (isStarring) return
    
    setIsStarring(true)
    try {
      await onStar?.(post.id, post.is_starred)
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsStarring(false)
    }
  }

  const handleRepost = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.warning('Repost için giriş yapmalısınız')
      return
    }
    if (isReposting) return

    setIsReposting(true)
    try {
      await onRepost?.(post.id, post.is_reposted)
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsReposting(false)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    // DÜZELTME: API'den gelen gerçek slug kullanılıyor
    const url = `${window.location.origin}/post/${post.slug}`
    
    const shared = await shareUrl(post.title, url)
    if (shared) {
      toast.success('Bağlantı kopyalandı!')
    }
  }

  const actions = [
    {
      icon: MessageCircle,
      label: 'Yorum',
      count: commentCount,
      active: false,
      onClick: null,
      // DÜZELTME: Gerçek slug kullanılıyor
      link: `/post/${post.slug}#comments`,
      color: 'hover:text-twitter-blue hover:bg-blue-50'
    },
    {
      icon: Repeat2,
      label: 'Repost',
      count: repostCount,
      active: post.is_reposted,
      onClick: handleRepost,
      color: post.is_reposted 
        ? 'text-accent-repost' 
        : 'hover:text-accent-repost hover:bg-green-50',
      disabled: isReposting
    },
    {
      icon: Star,
      label: 'Beğen',
      count: starCount,
      active: post.is_starred,
      onClick: handleStar,
      color: post.is_starred 
        ? 'text-accent-star' 
        : 'hover:text-accent-star hover:bg-yellow-50',
      filled: post.is_starred,
      disabled: isStarring
    },
    {
      icon: Share,
      label: 'Paylaş',
      count: null,
      active: false,
      onClick: handleShare,
      color: 'hover:text-twitter-blue hover:bg-blue-50'
    }
  ]

  return (
    <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3'} -ml-2`}>
      {actions.map((action, index) => {
        const Icon = action.icon
        const content = (
          <>
            <div className={`p-2 rounded-full transition-colors ${action.color}`}>
              <Icon 
                className={`w-5 h-5 ${action.filled ? 'fill-current' : ''}`}
              />
            </div>
            {action.count !== null && action.count > 0 && (
              <span className={`text-sm ${action.active ? '' : 'text-twitter-darkGray'}`}>
                {formatNumber(action.count)}
              </span>
            )}
          </>
        )

        if (action.link) {
          return (
            <Link
              key={index}
              to={action.link}
              className="flex items-center gap-1 group text-twitter-darkGray"
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex items-center gap-1 group ${
              action.active ? action.color.split(' ')[0] : 'text-twitter-darkGray'
            } disabled:opacity-50`}
            title={action.label}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}