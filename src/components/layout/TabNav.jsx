import { NavLink } from 'react-router-dom'
import { Home, Search, User, PlusSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function TabNav() {
  const { user } = useAuth()

  const navItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa', exact: true },
    { path: '/search', icon: Search, label: 'Keşfet' },
    ...(user ? [
      { path: `/?compose=true`, icon: PlusSquare, label: 'Paylaş', isAction: true },
      { path: `/profile/${user.username}`, icon: User, label: 'Profil' }
    ] : [])
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-twitter-extraLightGray md:hidden z-30">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full
              transition-colors
              ${item.isAction 
                ? 'text-twitter-blue' 
                : isActive 
                  ? 'text-twitter-blue' 
                  : 'text-twitter-darkGray hover:text-twitter-blue'}
            `}
          >
            <item.icon className={`w-6 h-6 ${item.isAction ? 'stroke-2' : ''}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
