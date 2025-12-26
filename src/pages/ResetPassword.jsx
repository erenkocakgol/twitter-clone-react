import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { validatePassword } from '../utils/helpers'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [failed, setFailed] = useState(false)

  const validate = () => {
    const newErrors = {}
    
    // --- DÜZELTİLEN KISIM ---
    const passwordCheck = validatePassword(formData.password)
    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.errors[0]
    }
    // -----------------------
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    try {
      await resetPassword(token, formData.password)
      setSuccess(true)
    } catch (error) {
      if (error.message?.includes('geçersiz') || error.message?.includes('süresi dolmuş')) {
        setFailed(true)
      } else {
        toast.error(error.message || 'Şifre sıfırlanamadı')
      }
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
              Şifre Değiştirildi!
            </h2>
            <p className="text-twitter-darkGray mb-6">
              Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twitter-extraLightGray to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-twitter-black mb-2">
              Bağlantı Geçersiz
            </h2>
            <p className="text-twitter-darkGray mb-6">
              Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
              Lütfen yeni bir sıfırlama bağlantısı talep edin.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Yeni Bağlantı İste
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
          <p className="text-twitter-darkGray mt-2">Yeni şifrenizi belirleyin</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-twitter-black mb-2">
            Yeni Şifre Oluştur
          </h2>
          <p className="text-twitter-darkGray text-sm mb-6">
            Güçlü bir şifre seçin ve kimseyle paylaşmayın.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="Yeni Şifre"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="En az 8 karakter"
              error={errors.password}
              required
            />

            <Input
              type="password"
              label="Şifre Tekrar"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Şifrenizi tekrar girin"
              error={errors.confirmPassword}
              required
            />

            <div className="text-xs text-twitter-lightGray space-y-1">
              <p>Şifreniz şunları içermelidir:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>En az 8 karakter</li>
                <li>En az bir büyük harf</li>
                <li>En az bir küçük harf</li>
                <li>En az bir rakam</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Şifreyi Değiştir
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
