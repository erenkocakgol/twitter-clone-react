import { useState, useEffect } from 'react'
import { Search, Trash2, Eye, ChevronLeft, ChevronRight, Image, X } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

export default function PostManagement() {
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.posts(page, 15, searchQuery)
      setPosts(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Gönderiler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return
    setActionLoading(true)
    try {
      await adminAPI.deletePost(selectedPost.id)
      setPosts(prev => prev.filter(p => p.id !== selectedPost.id))
      toast.success('Gönderi silindi')
      setShowDeleteModal(false)
      setSelectedPost(null)
    } catch (error) {
      toast.error(error.message || 'Gönderi silinemedi')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gönderi Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {pagination?.total || 0} gönderi</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Gönderi ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent"
            />
          </div>
          <Button type="submit" size="sm" className="flex-shrink-0">
            Ara
          </Button>
        </form>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-500">
            Gönderi bulunamadı
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İçerik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Yazar
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İstatistik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          {post.title && (
                            <p className="font-medium text-gray-900 truncate mb-1">{post.title}</p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.content}
                          </p>
                          {post.images?.length > 0 && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400">
                              <Image className="w-3 h-3" /> {post.images.length} görsel
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={post.user_avatar} alt={post.user_name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.user_name}</p>
                            <p className="text-xs text-gray-500">@{post.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                          <span title="Yıldız">⭐ {post.stars_count || 0}</span>
                          <span title="Repost">🔁 {post.reposts_count || 0}</span>
                          <span title="Yorum">💬 {post.comments_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(post.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedPost(post); setShowPreviewModal(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            title="Önizle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedPost(post); setShowDeleteModal(true); }}
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
              {posts.map(post => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar src={post.user_avatar} alt={post.user_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{post.user_name}</p>
                      <p className="text-xs text-gray-500">@{post.username}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(post.created_at)}
                    </span>
                  </div>

                  {post.title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  )}
                  
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {post.content}
                  </p>

                  {post.images?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <Image className="w-3 h-3" />
                      <span>{post.images.length} görsel</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>⭐ {post.stars_count || 0}</span>
                      <span>🔁 {post.reposts_count || 0}</span>
                      <span>💬 {post.comments_count || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedPost(post); setShowPreviewModal(true); }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Önizle
                      </button>
                      <button
                        onClick={() => { setSelectedPost(post); setShowDeleteModal(true); }}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
              Toplam {pagination.total} gönderi
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

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => { setShowPreviewModal(false); setSelectedPost(null); }}
        title="Gönderi Önizleme"
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4 sm:p-0">
            <div className="flex items-center gap-3">
              <Avatar src={selectedPost.user_avatar} alt={selectedPost.user_name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{selectedPost.user_name}</p>
                <p className="text-sm text-gray-500">@{selectedPost.username}</p>
              </div>
            </div>
            {selectedPost.title && (
              <h3 className="font-bold text-lg sm:text-xl">{selectedPost.title}</h3>
            )}
            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
              {selectedPost.content}
            </p>
            {selectedPost.images?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPost.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="" 
                    className="rounded-lg w-full h-40 sm:h-48 object-cover" 
                  />
                ))}
              </div>
            )}
            {selectedPost.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedPost(null); }}
        title="Gönderiyi Sil"
      >
        <div className="p-4 sm:p-0">
          <p className="text-gray-600 mb-6">
            Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => { setShowDeleteModal(false); setSelectedPost(null); }}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeletePost}
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