import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePosts } from '../hooks/usePosts'
import { useAuth } from '../hooks/useAuth'
import { usersAPI, followsAPI } from '../services/api'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileTabs from '../components/profile/ProfileTabs'
import EditProfileModal from '../components/profile/EditProfileModal'
import FollowersModal from '../components/profile/FollowersModal'
import PostCard from '../components/post/PostCard'
import { PageSpinner } from '../components/common/Spinner'
import Button from '../components/common/Button'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser, isGuest } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const targetUsername = username || currentUser?.username

  const {
    posts: rawPosts,
    loading: postsLoading,
    hasMore,
    fetchUserPosts,
    fetchUserReposts,
    fetchUserStarred,
    deletePost,
    toggleStar,
    toggleRepost,
    loadMore
  } = usePosts()

  const posts = Array.isArray(rawPosts) ? rawPosts : []

  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  const [activeTab, setActiveTab] = useState('posts')
  
  // Modal State'leri
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [followersModalType, setFollowersModalType] = useState('followers')

  useEffect(() => {
    if (!username && isGuest) {
      navigate('/login')
    }
  }, [username, isGuest, navigate])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!targetUsername) return

      setProfileLoading(true)
      setProfileError(null)

      try {
        const response = await usersAPI.profile(targetUsername)
        if (response.data?.success && response.data?.data) {
          setProfile(response.data.data)
        } else if (response.data) {
           setProfile(response.data)
        } else {
          setProfileError('Kullanıcı verisi alınamadı')
        }
      } catch (err) {
        console.error('Profil yükleme hatası:', err)
        setProfileError(err.message || 'Kullanıcı bulunamadı')
      } finally {
        setProfileLoading(false)
      }
    }

    if (targetUsername) {
      fetchUserProfile()
      fetchUserPosts(targetUsername, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsername])

  // Tab değiştiğinde doğru verileri çek
  useEffect(() => {
    if (targetUsername) {
      if (activeTab === 'posts') {
        fetchUserPosts(targetUsername, 1)
      } else if (activeTab === 'reposts') {
        fetchUserReposts(targetUsername, 1)
      } else if (activeTab === 'stars') {
        fetchUserStarred(targetUsername, 1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, targetUsername])

  const handleFollow = async (usernameToFollow) => {
    try {
      const target = usernameToFollow || profile.username
      await followsAPI.follow(target)
      
      setProfile(prev => ({ 
        ...prev, 
        is_following: true, 
        followers_count: (parseInt(prev.followers_count) || 0) + 1 
      }))
      toast.success('Takip edildi')
    } catch (error) {
      console.error('Takip işlemi başarısız:', error)
      toast.error('Takip işlemi başarısız')
    }
  }

  const handleUnfollow = async (usernameToUnfollow) => {
    try {
      const target = usernameToUnfollow || profile.username
      await followsAPI.unfollow(target)
      
      setProfile(prev => ({ 
        ...prev, 
        is_following: false, 
        followers_count: Math.max((parseInt(prev.followers_count) || 0) - 1, 0)
      }))
      toast.success('Takip bırakıldı')
    } catch (error) {
      console.error('Takip bırakma başarısız:', error)
      toast.error('Takip bırakma başarısız')
    }
  }

  const handleProfileUpdate = async (data) => {
    try {
      const response = await usersAPI.update(data)
      const updatedUser = response.data?.data || response.data || data
      setProfile(prev => ({ ...prev, ...updatedUser }))
      setShowEditModal(false)
      toast.success('Profil güncellendi')
    } catch (error) {
      console.error('Profil güncellenemedi:', error)
      throw error
    }
  }

  const handleShowFollowers = (type) => {
    const isOwnProfile = currentUser?.username === profile?.username
    if (type === 'following' && !isOwnProfile && !profile?.is_following_me) {
      toast.warning('Bu kullanıcının takip ettiklerini görüntüleyemezsiniz')
      return
    }
    setFollowersModalType(type)
    setShowFollowersModal(true)
  }

  const handleUndoRepost = async (postId) => {
    await toggleRepost(postId)
  }

  if (profileLoading || (!targetUsername && !profileError && !isGuest)) {
    return <PageSpinner />
  }

  if (profileError) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <p className="text-red-500 mb-4">{profileError}</p>
        <Link to="/">
          <Button variant="ghost">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-twitter-darkGray animate-fade-in">
        <p className="text-lg mb-4">Kullanıcı profili görüntülenemedi.</p>
        <div className="flex justify-center gap-2">
           <Button variant="secondary" onClick={() => navigate('/')}>
            Ana Sayfaya Dön
          </Button>
          {!currentUser && (
            <Button onClick={() => navigate('/login')}>
              Giriş Yap
            </Button>
          )}
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === profile.username

  return (
    <div className="animate-fade-in relative pb-20">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile} // DÜZELTME: Bu prop eklendi
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onEditProfile={() => setShowEditModal(true)}
        onShowFollowers={() => handleShowFollowers('followers')}
        onShowFollowing={() => handleShowFollowers('following')}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          posts: profile.statuses_count || 0,
        }}
        isOwnProfile={isOwnProfile}
      />

      <div>
        {postsLoading && posts.length === 0 ? (
          <div className="p-8">
            <PageSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-twitter-darkGray">
            <p>
              {activeTab === 'posts' 
                ? 'Henüz gönderi paylaşılmamış'
                : activeTab === 'reposts'
                  ? 'Henüz repost yapılmamış'
                  : 'Henüz beğenilen gönderi yok'}
            </p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onStar={toggleStar}
                onRepost={toggleRepost}
                onDelete={isOwnProfile ? deletePost : undefined}
                showRepostLabel={activeTab === 'reposts'}
                showUndoRepost={activeTab === 'reposts' && isOwnProfile}
                onUndoRepost={handleUndoRepost}
              />
            ))}
            
            {hasMore && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  loading={postsLoading}
                >
                  Daha Fazla Göster
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}

      {showFollowersModal && (
        <FollowersModal
          userId={profile.id}
          username={profile.username} 
          initialTab={followersModalType}
          onClose={() => setShowFollowersModal(false)}
          currentUserFollowing={profile.is_following}
        />
      )}
    </div>
  )
}