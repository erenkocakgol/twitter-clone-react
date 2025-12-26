import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  Menu,
  X,
  PenSquare,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import Button from '../common/Button'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-twitter-extraLightGray">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-twitter-blue to-primary-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-display font-bold text-xl text-twitter-black hidden sm:block">
              SanatSepet
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link
              to="/search"
              className="w-full flex items-center gap-2 px-4 py-2 bg-twitter-background rounded-full text-twitter-darkGray hover:bg-twitter-extraLightGray transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Ara...</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <Link
              to="/search"
              className="md:hidden btn-icon"
            >
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <>
                {/* Messages Button */}
                <Link to="/messages" className="btn-icon relative">
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* New Post Button */}
                <Link to="/?compose=true">
                  <Button size="sm" className="hidden sm:flex">
                    <PenSquare className="w-4 h-4 mr-2" />
                    Paylaş
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-twitter-background transition-colors"
                  >
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-twitter-black max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="dropdown">
                      <div className="px-4 py-3 border-b border-twitter-extraLightGray">
                        <p className="font-medium text-twitter-black">{user.name}</p>
                        <p className="text-sm text-twitter-darkGray">@{user.username}</p>
                      </div>

                      <Link
                        to={`/profile/${user.username}`}
                        className="dropdown-item"
                        onClick={() => setShowMenu(false)}
                      >
                        <User className="w-5 h-5" />
                        Profilim
                      </Link>

                      <Link
                        to="/messages"
                        className="dropdown-item"
                        onClick={() => setShowMenu(false)}
                      >
                        <MessageCircle className="w-5 h-5" />
                        Mesajlar
                      </Link>

                      <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="w-5 h-5" />
                        Ayarlar
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="dropdown-item text-primary-600"
                          onClick={() => setShowMenu(false)}
                        >
                          <Shield className="w-5 h-5" />
                          Admin Panel
                        </Link>
                      )}

                      <hr className="my-1 border-twitter-extraLightGray" />

                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-accent-heart w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Giriş
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden btn-icon"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="sm:hidden bg-white border-t border-twitter-extraLightGray animate-slide-down">
          <nav className="px-4 py-2">
            {user ? (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-background rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  Profilim
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-background rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageCircle className="w-5 h-5" />
                  Mesajlar
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-background rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings className="w-5 h-5" />
                  Ayarlar
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-background rounded-lg text-primary-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-twitter-background rounded-lg text-accent-heart w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 py-2">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Button variant="secondary" fullWidth>
                    Giriş Yap
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Button fullWidth>
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
