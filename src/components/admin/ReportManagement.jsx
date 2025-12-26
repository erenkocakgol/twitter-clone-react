import { useState, useEffect } from 'react'
import { Flag, ChevronLeft, ChevronRight, Check, X, Trash2, Ban, Filter } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

export default function ReportManagement() {
  const toast = useToast()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFilterMobile, setShowFilterMobile] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.reports(page, 15, statusFilter)
      setReports(response.data.data || [])
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Şikayetler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId, status, adminNotes = '') => {
    setActionLoading(true)
    try {
      await adminAPI.updateReport(reportId, { status, admin_notes: adminNotes })
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status } : r
      ))
      toast.success('Şikayet güncellendi')
      setShowDetailModal(false)
    } catch (error) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      dismissed: 'bg-gray-100 text-gray-700'
    }
    const labels = {
      pending: 'Bekliyor',
      reviewed: 'İncelendi',
      resolved: 'Çözüldü',
      dismissed: 'Reddedildi'
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const styles = {
      spam: 'bg-orange-100 text-orange-700',
      harassment: 'bg-red-100 text-red-700',
      inappropriate: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700'
    }
    const labels = {
      spam: 'Spam',
      harassment: 'Taciz',
      inappropriate: 'Uygunsuz',
      other: 'Diğer'
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[type]}`}>
        {labels[type] || type}
      </span>
    )
  }

  const filterOptions = [
    { value: 'pending', label: 'Bekleyen' },
    { value: 'reviewed', label: 'İncelenen' },
    { value: 'resolved', label: 'Çözülen' },
    { value: 'dismissed', label: 'Reddedilen' },
    { value: 'all', label: 'Tümü' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Şikayet Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {pagination?.total || 0} şikayet</p>
        </div>
        
        {/* Desktop Filter */}
        <div className="hidden sm:flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => { setStatusFilter(option.value); setPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === option.value
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
          Filtre: {filterOptions.find(o => o.value === statusFilter)?.label}
        </button>

        {/* Mobile Filter Options */}
        {showFilterMobile && (
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => { 
                  setStatusFilter(option.value); 
                  setPage(1); 
                  setShowFilterMobile(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === option.value
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

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Şikayet bulunamadı</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Şikayet Eden
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tür
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sebep
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Durum
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
                  {reports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={report.reporter_avatar} alt={report.reporter_name} size="sm" />
                          <span className="text-sm text-gray-900">@{report.reporter_username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(report.type)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-xs">{report.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(report.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => { setSelectedReport(report); setShowDetailModal(true); }}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            İncele
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
              {reports.map(report => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar src={report.reporter_avatar} alt={report.reporter_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        @{report.reporter_username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(report.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="mb-3">
                    {getTypeBadge(report.type)}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {report.reason}
                  </p>

                  <button
                    onClick={() => { setSelectedReport(report); setShowDetailModal(true); }}
                    className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium"
                  >
                    İncele
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Toplam {pagination.total} şikayet
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedReport(null); }}
        title="Şikayet Detayı"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4 sm:p-0">
            {/* Reporter Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar src={selectedReport.reporter_avatar} alt={selectedReport.reporter_name} size="md" />
                <div>
                  <p className="font-medium text-gray-900">{selectedReport.reporter_name}</p>
                  <p className="text-sm text-gray-500">@{selectedReport.reporter_username}</p>
                </div>
              </div>
              <div className="text-right">
                {getTypeBadge(selectedReport.type)}
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(selectedReport.created_at)}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Şikayet Sebebi</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
                {selectedReport.reason}
              </p>
            </div>

            {/* Reported Content */}
            {selectedReport.target_type === 'post' && selectedReport.post_content && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Şikayet Edilen Gönderi</h4>
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedReport.post_content}</p>
                </div>
              </div>
            )}

            {selectedReport.target_type === 'user' && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Şikayet Edilen Kullanıcı</h4>
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <Avatar src={selectedReport.target_avatar} alt={selectedReport.target_name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedReport.target_name}</p>
                    <p className="text-sm text-gray-500">@{selectedReport.target_username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mevcut Durum:</span>
              {getStatusBadge(selectedReport.status)}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                disabled={actionLoading || selectedReport.status === 'reviewed'}
                className="w-full sm:w-auto"
              >
                <Check className="w-4 h-4 mr-1" />
                İncelendi
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                disabled={actionLoading || selectedReport.status === 'resolved'}
                className="w-full sm:w-auto"
              >
                <Check className="w-4 h-4 mr-1" />
                Çözüldü
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                disabled={actionLoading || selectedReport.status === 'dismissed'}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Reddet
              </Button>
              {selectedReport.target_type === 'post' && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  İçeriği Sil
                </Button>
              )}
              {selectedReport.target_type === 'user' && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  className="w-full sm:w-auto"
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Kullanıcıyı Yasakla
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}