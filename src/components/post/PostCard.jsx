import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Repeat2 } from 'lucide-react'
import Avatar from '../common/Avatar'
import PostActions from './PostActions'
import PostOptions from './PostOptions'
import { formatPostDate } from '../../utils/helpers'

export default function PostCard({ 
  post, 
  onStar, 
  onRepost, 
  onDelete,
  showRepostLabel = true,
  showUndoRepost = false,
  onUndoRepost
}) {
  const [imageError, setImageError] = useState({})
  const [undoingRepost, setUndoingRepost] = useState(false)

  if (!post) return null

  const rawPost = post.original_post || post

  const userData = rawPost.user || {
    username: rawPost.username,
    name: rawPost.userName || rawPost.user_name || rawPost.username,
    avatar: rawPost.avatar || rawPost.user_avatar
  }

  const displayPost = {
    ...rawPost,
    user: userData,
    images: rawPost.images || [],
    tags: rawPost.tags || [],
    // Slug'ın var olduğundan emin oluyoruz
    slug: rawPost.slug 
  }

  const isRepost = post.reposted_by && showRepostLabel
  
  // DÜZELTME: Kendi slug'ımızı üretmiyoruz, API'den geleni kullanıyoruz.
  const postUrl = `/post/${displayPost.slug}`

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }))
  }

  return (
    <article className="card px-4 py-3 hover:bg-gray-50/50 transition-colors">
      {/* Repost label */}
      {isRepost && post.reposted_by && (
        <div className="flex items-center justify-between ml-12 mb-1 text-sm text-twitter-darkGray">
          <div className="flex items-center gap-2">
            <Repeat2 className="w-4 h-4" />
            <Link 
              to={`/profile/${post.reposted_by.username}`}
              className="hover:underline"
            >
              {post.reposted_by.name}
            </Link>
            <span>repost etti</span>
          </div>
          {showUndoRepost && onUndoRepost && (
            <button
              onClick={async (e) => {
                e.preventDefault()
                setUndoingRepost(true)
                try {
                  await onUndoRepost(displayPost.id)
                } finally {
                  setUndoingRepost(false)
                }
              }}
              disabled={undoingRepost}
              className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
            >
              {undoingRepost ? 'İptal ediliyor...' : 'Geri Al'}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/profile/${displayPost.user.username}`}>
          <Avatar
            src={displayPost.user.avatar}
            name={displayPost.user.name}
            size="md"
            className="hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Link 
                to={`/profile/${displayPost.user.username}`}
                className="font-bold text-twitter-black hover:underline truncate"
              >
                {displayPost.user.name}
              </Link>
              <Link 
                to={`/profile/${displayPost.user.username}`}
                className="text-twitter-darkGray truncate"
              >
                @{displayPost.user.username}
              </Link>
              <span className="text-twitter-darkGray">·</span>
              <Link 
                to={postUrl}
                className="text-twitter-darkGray hover:underline whitespace-nowrap"
                title={displayPost.created_at ? new Date(displayPost.created_at).toLocaleString('tr-TR') : ''}
              >
                {displayPost.created_at && formatPostDate(displayPost.created_at)}
              </Link>
            </div>

            <PostOptions 
              post={displayPost} 
              onDelete={onDelete}
            />
          </div>

          {/* Title */}
          <Link to={postUrl}>
            <h2 className="text-lg font-bold text-twitter-black mt-1 hover:text-twitter-blue transition-colors">
              {displayPost.title}
            </h2>
          </Link>

          {/* Content */}
          {(displayPost.content || displayPost.description) && (
            <p className="text-twitter-black mt-1 whitespace-pre-wrap">
              {displayPost.content || displayPost.description}
            </p>
          )}

          {/* Images */}
          {displayPost.images?.length > 0 && (
            <div className={`mt-3 grid gap-2 rounded-2xl overflow-hidden ${
              displayPost.images.length === 1 ? 'grid-cols-1' :
              displayPost.images.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {displayPost.images.slice(0, 3).map((image, index) => (
                !imageError[index] && (
                  <Link 
                    key={index}
                    to={postUrl}
                    className={`
                      relative block overflow-hidden bg-twitter-extraLightGray
                      ${displayPost.images.length === 3 && index === 0 ? 'row-span-2' : ''}
                    `}
                  >
                    <img
                      src={image}
                      alt={`${displayPost.title} - Resim ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      style={{ 
                        aspectRatio: displayPost.images.length === 1 ? '16/9' : '1/1',
                        maxHeight: displayPost.images.length === 1 ? '400px' : '200px'
                      }}
                      onError={() => handleImageError(index)}
                      loading="lazy"
                    />
                  </Link>
                )
              ))}
            </div>
          )}

          {/* Tags */}
          {displayPost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {displayPost.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent('#' + tag)}`}
                  className="text-twitter-blue hover:underline text-sm"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <PostActions
            post={displayPost}
            onStar={onStar}
            onRepost={onRepost}
          />
        </div>
      </div>
    </article>
  )
}