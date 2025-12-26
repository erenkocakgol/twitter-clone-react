import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Avatar from '../common/Avatar'
import PostActions from './PostActions'
import PostOptions from './PostOptions'
import CommentSection from './CommentSection'
import { formatDetailedDate } from '../../utils/helpers'

export default function PostDetail({ 
  post, 
  onStar, 
  onRepost, 
  onDelete,
  onComment,
  onCommentDelete
}) {
  const [imageError, setImageError] = useState({})

  if (!post) return null

  // Kullanıcı ve veri yapısını normalize et
  const user = post.user || {
    username: post.username,
    name: post.user_name || post.userName || post.username,
    avatar: post.user_avatar || post.avatar
  }

  // Sayaçları ve içeriği normalize et
  const displayPost = {
    ...post,
    user: user,
    content: post.content || post.description, // İçerik alanını eşle
    // Sayaçları eşle (API plural dönüyor)
    comments_count: post.comments_count ?? post.comment_count ?? 0,
    reposts_count: post.reposts_count ?? post.repost_count ?? 0,
    stars_count: post.stars_count ?? post.star_count ?? 0
  }

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }))
  }

  return (
    <article className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-twitter-extraLightGray flex items-center gap-4">
        <Link
          to="/"
          className="btn-icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-twitter-black">Gönderi</h1>
      </div>

      {/* Post Content */}
      <div className="px-4 py-3 border-b border-twitter-extraLightGray">
        {/* User Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${user.username}`}>
              <Avatar
                src={user.avatar}
                name={user.name}
                size="lg"
              />
            </Link>
            <div>
              <Link 
                to={`/profile/${user.username}`}
                className="block font-bold text-twitter-black hover:underline"
              >
                {user.name}
              </Link>
              <Link 
                to={`/profile/${user.username}`}
                className="text-twitter-darkGray"
              >
                @{user.username}
              </Link>
            </div>
          </div>
          
          <PostOptions post={displayPost} onDelete={onDelete} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-twitter-black mt-4">
          {displayPost.title}
        </h2>

        {/* Description/Content */}
        {displayPost.content && (
          <p className="text-lg text-twitter-black mt-3 whitespace-pre-wrap leading-relaxed">
            {displayPost.content}
          </p>
        )}

        {/* Images */}
        {displayPost.images && displayPost.images.length > 0 && (
          <div className={`mt-4 grid gap-2 rounded-2xl overflow-hidden ${
            displayPost.images.length === 1 ? 'grid-cols-1' :
            displayPost.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {displayPost.images.map((image, index) => (
              !imageError[index] && (
                <div 
                  key={index}
                  className={`
                    relative overflow-hidden bg-twitter-extraLightGray
                    ${displayPost.images.length === 3 && index === 0 ? 'row-span-2' : ''}
                  `}
                >
                  <img
                    src={image}
                    alt={`${displayPost.title} - Resim ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ 
                      aspectRatio: displayPost.images.length === 1 ? '16/9' : '1/1',
                      maxHeight: displayPost.images.length === 1 ? '500px' : '250px'
                    }}
                    onError={() => handleImageError(index)}
                    onClick={() => window.open(image, '_blank')}
                  />
                </div>
              )
            ))}
          </div>
        )}

        {/* Tags */}
        {displayPost.tags && displayPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {displayPost.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent('#' + tag)}`}
                className="text-twitter-blue hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="mt-4 text-twitter-darkGray">
          {formatDetailedDate(displayPost.created_at)}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 py-3 border-t border-twitter-extraLightGray text-sm">
          <span>
            <strong className="text-twitter-black">{displayPost.reposts_count}</strong>{' '}
            <span className="text-twitter-darkGray">Repost</span>
          </span>
          <span>
            <strong className="text-twitter-black">{displayPost.stars_count}</strong>{' '}
            <span className="text-twitter-darkGray">Beğeni</span>
          </span>
          <span>
            <strong className="text-twitter-black">{displayPost.comments_count}</strong>{' '}
            <span className="text-twitter-darkGray">Yorum</span>
          </span>
        </div>

        {/* Actions */}
        <div className="border-t border-twitter-extraLightGray">
          <PostActions
            post={displayPost}
            onStar={onStar}
            onRepost={onRepost}
          />
        </div>
      </div>

      {/* Comments Section */}
      <div id="comments">
        <CommentSection
          postId={displayPost.id}
          postSlug={displayPost.slug}
          onComment={onComment}
          onCommentDelete={onCommentDelete}
        />
      </div>
    </article>
  )
}