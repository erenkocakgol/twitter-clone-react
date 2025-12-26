import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

export default function Login() {
  const navigate = useNavigate()
  const { login, resendVerification } = useAuth()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true
  })
  const [loading, setLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(formData.email, formData.password, formData.remember)
      toast.success('Giriş başarılı!')
      navigate('/')
    } catch (error) {
      if (error.message?.includes('doğrulanmamış') || error.message?.includes('doğrulayın')) {
        setShowResend(true)
      }
      toast.error(error.message || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)
    try {
      await resendVerification(formData.email)
      toast.success('Doğrulama bağlantısı gönderildi')
      setShowResend(false)
    } catch (error) {
      toast.error(error.message || 'Bağlantı gönderilemedi')
    } finally {
      setResending(false)
    }
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
          <p className="text-twitter-darkGray mt-2">Hesabınıza giriş yapın</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="E-posta"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="ornek@email.com"
              required
            />

            <Input
              type="password"
              label="Şifre"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.remember}
                  onChange={(e) => setFormData(prev => ({ ...prev, remember: e.target.checked }))}
                  className="rounded border-gray-300 text-twitter-blue focus:ring-twitter-blue" 
                />
                <span className="text-twitter-darkGray">Beni hatırla</span>
              </label>
              <Link to="/forgot-password" className="text-twitter-blue hover:underline">
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Giriş Yap
            </Button>
          </form>

          {/* Resend Verification */}
          {showResend && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-3">
                E-posta adresiniz doğrulanmamış. Yeni doğrulama bağlantısı göndermek ister misiniz?
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                loading={resending}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Doğrulama Bağlantısı Gönder
              </Button>
            </div>
          )}

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
