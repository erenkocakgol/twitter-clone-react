import { useState, useEffect } from 'react'
import { Search, Trash2, Shield, ShieldOff, Ban, Check, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

export default function UserManagement() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilterMobile, setShowFilterMobile] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page, filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.users(page, 15, searchQuery, filter)
      setUsers(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleToggleAdmin = async (user) => {
    setActionLoading(true)
    try {
      await adminAPI.updateUser(user.id, { is_admin: user.is_admin ? 0 : 1 })
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
      ))
      toast.success(user.is_admin ? 'Admin yetkisi kaldırıldı' : 'Admin yapıldı')
    } catch (error) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleBan = async (user) => {
    setActionLoading(true)
    try {
      await adminAPI.updateUser(user.id, { is_banned: user.is_banned ? 0 : 1 })
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_banned: !u.is_banned } : u
      ))
      toast.success(user.is_banned ? 'Yasak kaldırıldı' : 'Kullanıcı yasaklandı')
    } catch (error) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      await adminAPI.deleteUser(selectedUser.id)
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      toast.success('Kullanıcı silindi')
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(error.message || 'Kullanıcı silinemedi')
    } finally {
      setActionLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'admin', label: 'Adminler' },
    { value: 'banned', label: 'Yasaklılar' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {pagination?.total || 0} kullanıcı</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent"
              />
            </div>
            <Button type="submit" size="sm" className="flex-shrink-0">
              Ara
            </Button>
          </form>
          
          {/* Desktop Filter */}
          <div className="hidden sm:flex gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => { setFilter(option.value); setPage(1); }}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === option.value
                    ? 'bg-twitter-blue text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilterMobile(!showFilterMobile)}
            className="sm:hidden px-4 py-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filtre
          </button>
        </div>

        {/* Mobile Filter Options */}
        {showFilterMobile && (
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => { 
                  setFilter(option.value); 
                  setPage(1); 
                  setShowFilterMobile(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  filter === option.value
                    ? 'bg-twitter-blue text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-500">
            Kullanıcı bulunamadı
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kayıt
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.name} size="md" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {user.is_admin && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              Admin
                            </span>
                          )}
                          {user.is_banned && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Yasaklı
                            </span>
                          )}
                          {user.is_verified && !user.is_banned && !user.is_admin && (
                            <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Doğrulanmış
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_admin 
                                ? 'text-blue-600 hover:bg-blue-50' 
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            }`}
                            title={user.is_admin ? 'Admin yetkisini kaldır' : 'Admin yap'}
                          >
                            {user.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleToggleBan(user)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_banned 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-100 hover:text-orange-600'
                            }`}
                            title={user.is_banned ? 'Yasağı kaldır' : 'Yasakla'}
                          >
                            {user.is_banned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                            disabled={actionLoading}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {users.map(user => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar src={user.avatar} alt={user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {user.is_admin && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        Admin
                      </span>
                    )}
                    {user.is_banned && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Yasaklı
                      </span>
                    )}
                    {user.is_verified && !user.is_banned && !user.is_admin && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Doğrulanmış
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatRelativeTime(user.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      disabled={actionLoading}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.is_admin 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {user.is_admin ? (
                        <span className="flex items-center justify-center gap-1">
                          <ShieldOff className="w-4 h-4" /> Admin Kaldır
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Shield className="w-4 h-4" /> Admin Yap
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleBan(user)}
                      disabled={actionLoading}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.is_banned 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {user.is_banned ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> Yasağı Kaldır
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Ban className="w-4 h-4" /> Yasakla
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                      disabled={actionLoading}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Toplam {pagination.total} kullanıcı
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 px-2">
                {page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
        title="Kullanıcıyı Sil"
      >
        <div className="p-4 sm:p-0">
          <p className="text-gray-600 mb-6">
            <strong>{selectedUser?.username}</strong> kullanıcısını silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteUser}
              loading={actionLoading}
              className="w-full sm:w-auto"
            >
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}