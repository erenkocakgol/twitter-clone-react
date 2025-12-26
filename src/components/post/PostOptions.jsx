import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Trash2, Flag, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import ReportModal from '../common/ReportModal'
import { copyToClipboard } from '../../utils/helpers'

export default function PostOptions({ post, onDelete }) {
  const { user } = useAuth()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef(null)

  const isOwner = user && user.id === post.user.id
  const isAdmin = user && user.role === 'admin'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopyLink = async () => {
    // DÜZELTME: API'den gelen gerçek slug'ı kullanıyoruz
    const url = `${window.location.origin}/post/${post.slug}`
    await copyToClipboard(url)
    toast.success('Bağlantı kopyalandı!')
    setIsOpen(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete?.(post.id)
      setIsOpen(false)
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReport = () => {
    setIsOpen(false)
    setShowReportModal(true)
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsOpen(!isOpen)
          }}
          className="btn-icon opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Daha fazla seçenek"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="dropdown right-0">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="dropdown-item"
            >
              <LinkIcon className="w-5 h-5" />
              Bağlantıyı kopyala
            </button>

            {/* Delete - for owner or admin */}
            {(isOwner || isAdmin) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="dropdown-item text-accent-heart"
              >
                <Trash2 className="w-5 h-5" />
                {isDeleting ? 'Siliniyor...' : 'Gönderiyi sil'}
              </button>
            )}

            {/* Report - for others */}
            {!isOwner && user && (
              <button
                onClick={handleReport}
                className="dropdown-item text-accent-heart"
              >
                <Flag className="w-5 h-5" />
                Bildir
              </button>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="POST"
        targetId={post.id}
      />
    </>
  )
}