import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  Settings,
  Search,
  DollarSign,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/admin/posts', icon: FileText, label: 'Gönderiler' },
    { path: '/admin/reports', icon: Flag, label: 'Şikayetler' },
    { path: '/admin/settings', icon: Settings, label: 'Site Ayarları' },
    { path: '/admin/seo', icon: Search, label: 'SEO Ayarları' },
    { path: '/admin/adsense', icon: DollarSign, label: 'AdSense' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="font-bold text-lg text-gray-900">Admin Panel</h1>

        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200
          transform transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="font-bold text-xl text-twitter-blue">
            SanatSepet Admin
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <nav className="p-3 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-sm font-medium
                transition-all
                ${
                  isActive
                    ? 'bg-twitter-blue text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg
              text-gray-600 hover:bg-gray-100 hover:text-twitter-blue"
          >
            <ArrowLeft className="w-5 h-5" />
            Siteye Dön
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
