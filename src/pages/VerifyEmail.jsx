import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()
  
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      handleVerification()
    } else {
      setStatus('error')
      setMessage('Doğrulama kodu bulunamadı')
    }
  }, [token])

  const handleVerification = async () => {
    try {
      await verifyEmail(token)
      setStatus('success')
      setMessage('E-posta adresiniz başarıyla doğrulandı!')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Doğrulama başarısız oldu. Bağlantı geçersiz veya süresi dolmuş olabilir.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="w-16 h-16 text-twitter-blue animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-twitter-black mb-2">
              E-posta Doğrulanıyor...
            </h2>
            <p className="text-twitter-darkGray">
              Lütfen bekleyin, e-posta adresiniz doğrulanıyor.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-twitter-black mb-2">
              Doğrulama Başarılı!
            </h2>
            <p className="text-twitter-darkGray mb-6">
              {message}
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-twitter-black mb-2">
            Doğrulama Başarısız
          </h2>
          <p className="text-twitter-darkGray mb-6">
            {message}
          </p>
          <div className="space-y-2">
            <Link to="/login">
              <Button className="w-full">
                Giriş Sayfasına Dön
              </Button>
            </Link>
            <p className="text-sm text-twitter-lightGray">
              Yeni bir doğrulama bağlantısı almak için giriş sayfasından
              "Doğrulama bağlantısı al" seçeneğini kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
