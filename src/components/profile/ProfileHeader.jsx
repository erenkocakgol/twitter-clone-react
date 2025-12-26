import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Link as LinkIcon, Edit2, 
  UserPlus, UserMinus, MessageCircle, MoreHorizontal, 
  Ban, Flag 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI, messagesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { formatPostDate } from '../../utils/helpers';

export default function ProfileHeader({ 
  profile, 
  isOwnProfile, // DÜZELTME: Bu prop Parent'tan alınacak
  onFollow = () => {}, 
  onUnfollow = () => {}, 
  onEditProfile = () => {},    
  onShowFollowers = () => {},  
  onShowFollowing = () => {}   
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [followLoading, setFollowLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(profile?.is_blocked || false);
  const [messageLoading, setMessageLoading] = useState(false);

  if (!profile) return null;

  // DÜZELTME: isOwnProfile hesaplaması buradan kaldırıldı, prop kullanılıyor.
  const isFollowing = profile.is_following || profile.isFollowing;
  const joinDate = profile.created_at || profile.createdAt;
  const isBlockedBy = profile.is_blocked_by || false;

  const handleFollowClick = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow(profile.username); 
      } else {
        await onFollow(profile.username);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    setBlockLoading(true);
    try {
      if (isBlocked) {
        await usersAPI.unblock(profile.username);
        setIsBlocked(false);
        toast.success('Kullanıcı engeli kaldırıldı');
      } else {
        await usersAPI.block(profile.username);
        setIsBlocked(true);
        toast.success('Kullanıcı engellendi');
      }
    } catch (error) {
      toast.error(error.message || 'İşlem başarısız');
    } finally {
      setBlockLoading(false);
      setShowMenu(false);
    }
  };

  const handleSendMessage = async () => {
    setMessageLoading(true);
    try {
      const response = await messagesAPI.startConversation(profile.username);
      const conv = response.data.data;
      navigate(`/messages/${conv.id}`);
    } catch (error) {
      toast.error(error.message || 'Sohbet başlatılamadı');
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border-b border-twitter-lightGray relative">
        {/* Banner */}
        <div className="h-32 sm:h-48 bg-twitter-blue relative overflow-hidden">
          {profile.banner || profile.cover ? (
            <img
              src={profile.banner || profile.cover}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-12 sm:-mt-16 mb-3">
            <div className="relative p-1 bg-white rounded-full z-10">
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size="xl"
                className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white"
              />
            </div>
            
            <div className="mt-14 sm:mt-20 flex items-center gap-2 relative z-20">
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Edit button clicked");
                    onEditProfile();
                  }} 
                  className="border border-gray-300 font-bold"
                >
                  <Edit2 size={16} className="mr-1" />
                  Profili Düzenle
                </Button>
              ) : user ? (
                <>
                  {isBlockedBy && (
                    <span className="text-sm text-red-500 mr-2">
                      Bu kullanıcı sizi engelledi
                    </span>
                  )}
                  
                  {!isBlocked && !isBlockedBy && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendMessage}
                      loading={messageLoading}
                      className="border border-gray-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {!isBlocked && !isBlockedBy && (
                    <Button
                      variant={isFollowing ? 'secondary' : 'primary'}
                      size="sm"
                      className={isFollowing ? "border border-red-200 text-red-600 hover:bg-red-50" : ""}
                      onClick={handleFollowClick}
                      loading={followLoading}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Takibi Bırak
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Takip Et
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                      className="border border-gray-300 !px-2"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    
                    {showMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-twitter-extraLightGray z-40 min-w-[180px] py-1">
                          <button
                            onClick={handleBlockToggle}
                            disabled={blockLoading}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                              isBlocked 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Ban className="w-4 h-4" />
                            {blockLoading 
                              ? 'İşleniyor...' 
                              : isBlocked 
                                ? 'Engeli Kaldır' 
                                : 'Engelle'
                            }
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              toast.info('Şikayet özelliği yakında eklenecek');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-twitter-darkGray hover:bg-twitter-extraLightGray transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                            Şikayet Et
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="mb-3">
            <h1 className="text-xl font-bold text-twitter-black">
              {profile.name}
            </h1>
            <p className="text-twitter-gray">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-twitter-darkGray mb-3 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-twitter-gray mb-3">
            {profile.location && (
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-twitter-blue hover:underline"
              >
                <LinkIcon size={14} className="mr-1" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            
            {joinDate && (
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {formatPostDate(joinDate)} tarihinde katıldı
              </span>
            )}
          </div>

          <div className="flex gap-4 text-sm z-10 relative">
            <button
              onClick={onShowFollowing}
              className="hover:underline group cursor-pointer focus:outline-none text-left"
              type="button"
            >
              <span className="font-bold text-twitter-darkGray">
                {profile.following_count || profile.followingCount || 0}
              </span>{' '}
              <span className="text-twitter-gray group-hover:text-twitter-darkGray">Takip Edilen</span>
            </button>
            
            <button
              onClick={onShowFollowers}
              className="hover:underline group cursor-pointer focus:outline-none text-left"
              type="button"
            >
              <span className="font-bold text-twitter-darkGray">
                {profile.followers_count || profile.followersCount || 0}
              </span>{' '}
              <span className="text-twitter-gray group-hover:text-twitter-darkGray">Takipçi</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}