import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, Trash2, Flag, User } from 'lucide-react'

// --- NOT: Kendi projenizde aşağıdaki orijinal importları AÇIN (Uncomment) ---
// import Avatar from '../common/Avatar'
// import ReportModal from '../common/ReportModal'
// import { useAuth } from '../../hooks/useAuth'
// import { formatPostDate } from '../../utils/helpers'

// --- DEMO/ÖNİZLEME İÇİN GEÇİCİ BİLEŞENLER (Projenize eklerken bu bloğu SİLİN) ---
const useAuth = () => ({ 
  user: { id: 'demo_user_id', username: 'demo', name: 'Demo Kullanıcı' } 
})

const formatPostDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

const Avatar = ({ src, name, size }) => (
  <div className={`rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 ${size === 'md' ? 'w-10 h-10' : 'w-8 h-8'}`}>
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover"/>
    ) : (
      <span className="text-xs font-bold text-gray-500">{(name || '?')[0]}</span>
    )}
  </div>
)

const ReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">Bildir</h3>
        <p className="text-gray-600 mb-4 text-sm">Bu içerik bildirildi (Demo Modalı).</p>
        <button onClick={onClose} className="w-full bg-gray-200 py-2 rounded text-sm hover:bg-gray-300 transition-colors">Kapat</button>
      </div>
    </div>
  )
}
// -----------------------------------------------------------------------------

export default function CommentItem({ comment, onDelete }) {
  const { user } = useAuth()
  const [showOptions, setShowOptions] = useState(false)
  const [showReport, setShowReport] = useState(false)
  
  // Eğer yorum objesi tamamen bozuksa hiç render etme
  if (!comment) return null

  // VERİ YAPISI DÜZELTME:
  // API bazen 'user' objesi içinde, bazen düz (flat) alanlar olarak veri dönebilir.
  // Burada her iki ihtimali de kontrol ederek güvenli bir 'commentUser' oluşturuyoruz.
  const commentUser = comment.user || {
    id: comment.user_id || 'unknown',
    username: comment.username || 'unknown',
    name: comment.user_name || comment.username || 'Bilinmeyen Kullanıcı',
    avatar: comment.user_avatar || null
  }

  // Güvenli erişim - ID'leri String'e çevirerek karşılaştırıyoruz
  const isOwner = user?.id && commentUser.id && String(user.id) === String(commentUser.id)

  return (
    <article className="p-4 border-b border-twitter-extraLightGray hover:bg-twitter-extraLightGray/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar Linki */}
        {commentUser.username !== 'unknown' ? (
          <Link to={`/profile/${commentUser.username}`}>
            <Avatar
              src={commentUser.avatar}
              name={commentUser.name}
              size="md"
            />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              {commentUser.username !== 'unknown' ? (
                <>
                  <Link 
                    to={`/profile/${commentUser.username}`}
                    className="font-bold text-twitter-black hover:underline truncate"
                  >
                    {commentUser.name}
                  </Link>
                  <Link 
                    to={`/profile/${commentUser.username}`}
                    className="text-twitter-darkGray truncate"
                  >
                    @{commentUser.username}
                  </Link>
                </>
              ) : (
                <span className="font-bold text-gray-500">Silinmiş Kullanıcı</span>
              )}
              
              <span className="text-twitter-darkGray">·</span>
              <time className="text-twitter-darkGray text-sm whitespace-nowrap">
                {comment.created_at ? formatPostDate(comment.created_at) : ''}
              </time>
            </div>
            
            {/* Seçenekler Menüsü */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="btn-icon text-twitter-darkGray hover:text-twitter-blue hover:bg-twitter-blue/10"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showOptions && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-lg z-20 min-w-[180px] py-1">
                    {isOwner ? (
                      <button
                        onClick={() => {
                          onDelete(comment.id)
                          setShowOptions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Yorumu Sil</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowReport(true)
                          setShowOptions(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Şikayet Et</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Yorum İçeriği */}
          <p className="mt-1 text-twitter-black whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
      
      {/* Rapor Modalı */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        type="comment"
        targetId={comment.id}
      />
    </article>
  )
}