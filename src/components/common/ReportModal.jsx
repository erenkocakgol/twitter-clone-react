import { useState } from 'react'
import { Flag, AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { reportsAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { REPORT_REASONS } from '../../utils/constants'

export default function ReportModal({
  isOpen,
  onClose,
  type = 'POST', // POST, COMMENT, USER
  targetId
}) {
  const [selectedReason, setSelectedReason] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const reasons = REPORT_REASONS[type] || REPORT_REASONS.POST

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedReason) {
      toast.error('Lütfen bir sebep seçin')
      return
    }

    setLoading(true)
    
    try {
      const reason = additionalInfo 
        ? `${selectedReason}: ${additionalInfo}`
        : selectedReason
      
      await reportsAPI.create(type.toLowerCase(), targetId, reason)
      toast.success('Raporunuz alındı. İncelenecektir.')
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Rapor gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedReason('')
    setAdditionalInfo('')
    onClose()
  }

  const typeLabel = {
    POST: 'Gönderi',
    COMMENT: 'Yorum',
    USER: 'Kullanıcı'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${typeLabel[type]} Bildir`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            Yanlış veya kötü niyetli raporlar hesabınızın askıya alınmasına neden olabilir.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-twitter-black">
            Neden bildiriyorsunuz?
          </label>
          
          <div className="space-y-2">
            {reasons.map((reason) => (
              <label
                key={reason.value}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                  transition-colors
                  ${selectedReason === reason.value 
                    ? 'border-twitter-blue bg-primary-50' 
                    : 'border-twitter-extraLightGray hover:bg-twitter-background'}
                `}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-twitter-blue focus:ring-twitter-blue"
                />
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedReason === 'other' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-twitter-black">
              Ek bilgi
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Lütfen açıklayın..."
              className="input min-h-[100px] resize-none"
              maxLength={500}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={loading}
            disabled={!selectedReason}
            className="flex-1"
          >
            <Flag className="w-4 h-4 mr-2" />
            Bildir
          </Button>
        </div>
      </form>
    </Modal>
  )
}
