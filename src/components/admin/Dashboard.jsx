import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Flag,
  TrendingUp,
  Eye,
  UserPlus,
  AlertCircle
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Spinner from '../common/Spinner'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.dashboard()
      setData(response.data.data)
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-gray-600 text-lg mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-twitter-blue text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const stats = data?.stats || {}
  const recentActivity = data?.recent_activity || {}

  const statCards = [
    { 
      label: 'Toplam Kullanıcı', 
      value: stats.total_users || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-500'
    },
    { 
      label: 'Toplam Gönderi', 
      value: stats.total_posts || 0, 
      icon: FileText, 
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-500'
    },
    { 
      label: 'Toplam Yorum', 
      value: stats.total_comments || 0, 
      icon: MessageSquare, 
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-500'
    },
    { 
      label: 'Bekleyen Şikayet', 
      value: stats.pending_reports || 0, 
      icon: Flag, 
      color: 'bg-red-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-500'
    },
    { 
      label: 'Bugünkü Ziyaret', 
      value: stats.today_visits || 0, 
      icon: Eye, 
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-500'
    },
    { 
      label: 'Aktif Kullanıcı', 
      sublabel: '(7 gün)',
      value: stats.active_users || 0, 
      icon: TrendingUp, 
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistemin genel durumunu buradan takip edebilirsiniz
          </p>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
          Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
        </p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">
                  {stat.label}
                  {stat.sublabel && <span className="hidden sm:inline"> {stat.sublabel}</span>}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${stat.bgLight} flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Sections - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* New Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white">
            <UserPlus className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Yeni Kullanıcılar</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {(recentActivity.new_users || []).length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">Yeni kullanıcı yok</p>
            ) : (
              (recentActivity.new_users || []).slice(0, 5).map((user, index) => (
                <div key={index} className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <Avatar src={user.avatar} alt={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatRelativeTime(user.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-green-50 to-white">
            <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Son Gönderiler</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {(recentActivity.new_posts || []).length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">Yeni gönderi yok</p>
            ) : (
              (recentActivity.new_posts || []).slice(0, 5).map((post, index) => (
                <div key={index} className="px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {post.title || post.content?.substring(0, 60) + '...'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-gray-500 truncate">@{post.username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-red-50 to-white">
            <Flag className="w-5 h-5 text-red-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Son Şikayetler</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {(recentActivity.new_reports || []).length === 0 ? (
              <p className="p-5 text-center text-gray-400 text-sm">Yeni şikayet yok</p>
            ) : (
              (recentActivity.new_reports || []).slice(0, 5).map((report, index) => (
                <div key={index} className="px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(report.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{report.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}