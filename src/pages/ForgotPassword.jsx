import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { validateEmail } from '../utils/helpers'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const toast = useToast()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi girin')
      return
    }
    
    setLoading(true)
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (error) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-twitter-black mb-2">
              E-posta Gönderildi!
            </h2>
            <p className="text-twitter-darkGray mb-6">
              Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. 
              Lütfen e-postanızı kontrol edin.
            </p>
            <p className="text-sm text-twitter-lightGray mb-6">
              E-posta gelmedi mi? Spam klasörünü kontrol edin veya birkaç dakika bekleyip tekrar deneyin.
            </p>
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
              >
                Farklı E-posta Dene
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-display font-bold text-twitter-blue">
              SanatSepet
            </h1>
          </Link>
          <p className="text-twitter-darkGray mt-2">Şifrenizi sıfırlayın</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-twitter-darkGray hover:text-twitter-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş'e dön
            </Link>
          </div>

          <h2 className="text-xl font-bold text-twitter-black mb-2">
            Şifremi Unuttum
          </h2>
          <p className="text-twitter-darkGray text-sm mb-6">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="E-posta"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="ornek@email.com"
              error={error}
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-twitter-darkGray">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-twitter-blue hover:underline font-medium">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
