import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, User, Settings, PenSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { postsAPI, usersAPI } from '../../services/api'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import Spinner from '../common/Spinner'
import Footer from './Footer'

export default function Sidebar() {
  const { user } = useAuth()
  const [trendingTags, setTrendingTags] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    fetchTrendingTags()
    if (user) {
      fetchSuggestedUsers()
    } else {
      setLoadingUsers(false)
    }
  }, [user])

  const fetchTrendingTags = async () => {
    try {
      const response = await postsAPI.trendingTags(5)
      const tags = response.data?.data || response.data || []
      setTrendingTags(tags)
    } catch (error) {
      console.error('Trending tags yüklenemedi:', error)
      setTrendingTags([])
    } finally {
      setLoadingTags(false)
    }
  }

  const fetchSuggestedUsers = async () => {
    try {
      const response = await usersAPI.suggested(5)
      const users = response.data?.data || response.data || []
      setSuggestedUsers(users)
    } catch (error) {
      console.error('Önerilen kullanıcılar yüklenemedi:', error)
      setSuggestedUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa', exact: true },
    { path: '/search', icon: Search, label: 'Keşfet' },
    ...(user ? [
      { path: `/profile/${user.username}`, icon: User, label: 'Profil' },
      { path: '/settings', icon: Settings, label: 'Ayarlar' }
    ] : [])
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 sticky top-14 h-[calc(100vh-56px)] p-4 overflow-y-auto">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-full
              transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 text-twitter-blue font-bold' 
                : 'text-twitter-black hover:bg-twitter-background'}
            `}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-lg">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="mt-4">
          <NavLink to="/?compose=true">
            <Button fullWidth size="lg" className="shadow-lg">
              <PenSquare className="w-5 h-5 mr-2" />
              Paylaş
            </Button>
          </NavLink>
        </div>
      )}

      {/* Trending Topics */}
      <div className="mt-8 bg-twitter-background rounded-2xl p-4">
        <h3 className="font-bold text-lg text-twitter-black mb-3">
          Gündemdekiler
        </h3>
        {loadingTags ? (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        ) : trendingTags.length === 0 ? (
          <p className="text-sm text-twitter-darkGray">Henüz trend konu yok</p>
        ) : (
          <div className="space-y-3">
            {trendingTags.map((tag, i) => (
              <NavLink
                key={tag.tag || tag.name || i}
                to={`/search?q=${encodeURIComponent('#' + (tag.tag || tag.name))}`}
                className="block hover:bg-white/50 p-2 rounded-lg transition-colors"
              >
                <p className="text-sm text-twitter-darkGray">Trend</p>
                <p className="font-bold text-twitter-black">#{tag.tag || tag.name}</p>
                <p className="text-sm text-twitter-darkGray">
                  {(tag.count || tag.posts_count || 0).toLocaleString('tr-TR')} gönderi
                </p>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users */}
      {user && (
        <div className="mt-4 bg-twitter-background rounded-2xl p-4">
          <h3 className="font-bold text-lg text-twitter-black mb-3">
            Önerilen Hesaplar
          </h3>
          {loadingUsers ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : suggestedUsers.length === 0 ? (
            <p className="text-sm text-twitter-darkGray">Öneri bulunmuyor</p>
          ) : (
            <div className="space-y-3">
              {suggestedUsers.map((suggestedUser) => (
                <NavLink
                  key={suggestedUser.id}
                  to={`/profile/${suggestedUser.username}`}
                  className="flex items-center gap-3 p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <Avatar 
                    src={suggestedUser.avatar} 
                    name={suggestedUser.name} 
                    size="sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-twitter-black truncate text-sm">
                      {suggestedUser.name}
                    </p>
                    <p className="text-sm text-twitter-darkGray truncate">
                      @{suggestedUser.username}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
      <Footer></Footer>
    </aside>
  )
}
