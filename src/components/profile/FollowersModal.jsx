import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { PageSpinner } from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { followsAPI } from '../../services/api';
import Modal from '../common/Modal';

export default function FollowersModal({ userId, username, initialTab = 'followers', onClose, currentUserFollowing }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (username) {
      loadUsers();
    }
  }, [activeTab, username]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'followers'
        ? await followsAPI.followers(username, 1)
        : await followsAPI.following(username, 1);
      
      // API yanıtını güvenli bir şekilde işle
      let userList = [];
      
      // 1. Durum: response.data direkt bir array ise (Liste dönüyorsa)
      if (Array.isArray(response.data)) {
        userList = response.data;
      } 
      // 2. Durum: response.data.data bir array ise (Standart JSON yapısı: { success: true, data: [...] })
      else if (response.data?.data && Array.isArray(response.data.data)) {
        userList = response.data.data;
      }
      // 3. Durum: response.data.users bir array ise (Alternatif yapı)
      else if (response.data?.users && Array.isArray(response.data.users)) {
        userList = response.data.users;
      }

      setUsers(userList);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUser) => {
    if (!currentUser) return;

    setFollowLoading(prev => ({ ...prev, [targetUser.id]: true }));
    try {
      const isFollowing = targetUser.isFollowing || targetUser.is_following;
      
      if (isFollowing) {
        await followsAPI.unfollow(targetUser.username);
      } else {
        await followsAPI.follow(targetUser.username);
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === targetUser.id
            ? { ...u, isFollowing: !isFollowing, is_following: !isFollowing }
            : u
        )
      );
    } catch (error) {
      console.error('Takip işlemi başarısız:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUser.id]: false }));
    }
  };

  return (
    <Modal onClose={onClose} title={`@${username}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'followers'
              ? 'text-gray-900 font-bold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Takipçiler
          {activeTab === 'followers' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'following'
              ? 'text-gray-900 font-bold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Takip Edilenler
          {activeTab === 'following' && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* User List */}
      <div className="min-h-[300px] max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <PageSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'followers'
              ? 'Henüz takipçi yok'
              : 'Henüz kimse takip edilmiyor'
            }
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <Link
                  to={`/profile/${user.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate group-hover:underline">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>
                
                {currentUser && currentUser.id !== user.id && (
                  <div className="ml-2">
                    <Button
                      variant={(user.isFollowing || user.is_following) ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleFollow(user)}
                      loading={followLoading[user.id]}
                      className={(user.isFollowing || user.is_following) ? "border border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50" : ""}
                    >
                      {(user.isFollowing || user.is_following) ? 'Takiptesin' : 'Takip Et'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}