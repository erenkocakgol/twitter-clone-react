import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';
import PostCard from '../post/PostCard';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';

export default function SearchResults({
  results,
  loading,
  filter,
  onLoadMore,
  hasMore,
  onFollow,
  onStar,
  onRepost,
  onDelete,
  onReport
}) {
  const { user } = useAuth();

  // Helper function to safely get an array
  const getSafeArray = (data) => (Array.isArray(data) ? data : []);

  // Loading State
  if (loading && (!results || (Array.isArray(results) && results.length === 0))) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Empty State Check (Generic)
  const isEmpty =
    !results ||
    (Array.isArray(results) && results.length === 0) ||
    (typeof results === 'object' &&
      !results.posts?.length &&
      !results.users?.length &&
      !results.tags?.length);

  if (!loading && isEmpty) {
    return (
      <div className="text-center py-12">
        <p className="text-twitter-gray text-lg">Sonuç bulunamadı</p>
        <p className="text-twitter-gray text-sm mt-2">
          Farklı anahtar kelimelerle tekrar deneyin
        </p>
      </div>
    );
  }

  // --- RENDER LOGIC BASED ON FILTER ---

  // 1. Posts Only View
  if (filter === 'posts') {
    // API might return array directly OR object with posts key
    const posts = getSafeArray(results?.posts || results);

    return (
      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onStar={() => onStar?.(post.id)}
            onRepost={() => onRepost?.(post.id)}
            onDelete={() => onDelete?.(post.id)}
            onReport={(reason) => onReport?.(post.id, 'post', reason)}
          />
        ))}
        {hasMore && (
          <div className="p-4 text-center">
            <Button variant="secondary" onClick={onLoadMore} loading={loading}>
              Daha Fazla Yükle
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 2. Users Only View
  if (filter === 'users') {
    const users = getSafeArray(results?.users || results);

    return (
      <div>
        {users.map((u) => (
          <UserResult
            key={u.id}
            user={u}
            currentUser={user}
            onFollow={() => onFollow?.(u.id)}
          />
        ))}
        {hasMore && (
          <div className="p-4 text-center">
            <Button variant="secondary" onClick={onLoadMore} loading={loading}>
              Daha Fazla Yükle
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 3. Tags Only View
  if (filter === 'tags') {
    const tags = getSafeArray(results?.tags || results);

    return (
      <div>
        {tags.map((tag) => (
          <TagResult key={tag.name} tag={tag} />
        ))}
        {hasMore && (
          <div className="p-4 text-center">
            <Button variant="secondary" onClick={onLoadMore} loading={loading}>
              Daha Fazla Yükle
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 4. "All" View (Combined)
  if (filter === 'all') {
    // Safely extract arrays from the results object using Optional Chaining (?.)
    // and default to empty array if undefined
    const users = getSafeArray(results?.users);
    const tags = getSafeArray(results?.tags);
    const posts = getSafeArray(results?.posts);

    return (
      <div>
        {/* Users section */}
        {users.length > 0 && (
          <div className="border-b border-twitter-lightGray">
            <h3 className="px-4 py-3 font-bold text-twitter-darkGray bg-twitter-extraLightGray">
              Kullanıcılar
            </h3>
            {users.slice(0, 3).map((u) => (
              <UserResult
                key={u.id}
                user={u}
                currentUser={user}
                onFollow={() => onFollow?.(u.id)}
              />
            ))}
            {users.length > 3 && (
              <Link
                to={`/search?filter=users`}
                className="block px-4 py-3 text-twitter-blue hover:bg-twitter-extraLightGray transition-colors text-center font-medium"
              >
                Tüm kullanıcıları gör
              </Link>
            )}
          </div>
        )}

        {/* Tags section */}
        {tags.length > 0 && (
          <div className="border-b border-twitter-lightGray">
            <h3 className="px-4 py-3 font-bold text-twitter-darkGray bg-twitter-extraLightGray">
              Etiketler
            </h3>
            {tags.slice(0, 5).map((tag) => (
              <TagResult key={tag.name} tag={tag} />
            ))}
            {tags.length > 5 && (
              <Link
                to={`/search?filter=tags`}
                className="block px-4 py-3 text-twitter-blue hover:bg-twitter-extraLightGray transition-colors text-center font-medium"
              >
                Tüm etiketleri gör
              </Link>
            )}
          </div>
        )}

        {/* Posts section */}
        {posts.length > 0 && (
          <div>
            <h3 className="px-4 py-3 font-bold text-twitter-darkGray bg-twitter-extraLightGray">
              Gönderiler
            </h3>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onStar={() => onStar?.(post.id)}
                onRepost={() => onRepost?.(post.id)}
                onDelete={() => onDelete?.(post.id)}
                onReport={(reason) => onReport?.(post.id, 'post', reason)}
              />
            ))}
            {hasMore && (
              <div className="p-4 text-center">
                <Button
                  variant="secondary"
                  onClick={onLoadMore}
                  loading={loading}
                >
                  Daha Fazla Yükle
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// --- SUB COMPONENTS ---

function UserResult({ user, currentUser, onFollow }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault(); // Prevent Link navigation if inside Link
    setLoading(true);
    try {
      await onFollow();
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-twitter-extraLightGray transition-colors border-b border-twitter-lightGray last:border-0">
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar src={user.avatar} alt={user.name} size="md" />
        <div className="min-w-0">
          <p className="font-medium text-twitter-darkGray truncate">
            {user.name}
          </p>
          <p className="text-sm text-twitter-gray truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-twitter-darkGray mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
      </Link>
      {currentUser && currentUser.id !== user.id && (
        <div className="ml-2">
            <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleFollow}
            loading={loading}
            >
            {isFollowing ? 'Takipten Çık' : 'Takip Et'}
            </Button>
        </div>
      )}
    </div>
  );
}

function TagResult({ tag }) {
  // Safe default for post count
  const count = tag.postCount || 0;
  
  return (
    <Link
      to={`/search?q=${encodeURIComponent('#' + tag.name)}&filter=posts`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-extraLightGray transition-colors border-b border-twitter-lightGray last:border-0"
    >
      <div className="w-10 h-10 rounded-full bg-twitter-blue/10 flex items-center justify-center shrink-0">
        <Hash size={20} className="text-twitter-blue" />
      </div>
      <div>
        <p className="font-medium text-twitter-darkGray">#{tag.name}</p>
        <p className="text-sm text-twitter-gray">{count} gönderi</p>
      </div>
    </Link>
  );
}