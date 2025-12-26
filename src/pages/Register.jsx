import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AtSign, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { validateEmail, validateUsername, validatePassword } from '../utils/helpers'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gerekli'
    }
    
    if (!validateUsername(formData.username)) {
      newErrors.username = 'Kullanıcı adı 3-20 karakter, harf, rakam ve alt çizgi içerebilir'
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }
    
    // --- DÜZELTİLEN KISIM BAŞLANGIÇ ---
    const passwordCheck = validatePassword(formData.password)
    
    // Eğer valid değilse, hatalar dizisindeki İLK hatayı alıyoruz
    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.errors[0] 
    }
    // --- DÜZELTİLEN KISIM BİTİŞ ---
    
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
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      setSuccess(true)
    } catch (error) {
      toast.error(error.message || 'Kayıt başarısız')
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
              Kayıt Başarılı!
            </h2>
            <p className="text-twitter-darkGray mb-6">
              E-posta adresinize bir doğrulama bağlantısı gönderdik. 
              Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Giriş Sayfasına Git
            </Button>
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
          <p className="text-twitter-darkGray mt-2">Yeni hesap oluşturun</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Adınız Soyadınız"
              error={errors.name}
              required
            />

            <Input
              label="Kullanıcı Adı"
              icon={AtSign}
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
              placeholder="kullaniciadi"
              error={errors.username}
              required
            />

            <Input
              type="email"
              label="E-posta"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="ornek@email.com"
              error={errors.email}
              required
            />

            <Input
              type="password"
              label="Şifre"
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

            <div className="text-sm text-twitter-darkGray">
              <label className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded border-gray-300 text-twitter-blue focus:ring-twitter-blue" 
                  required
                />
                <span>
                  <Link to="/terms" className="text-twitter-blue hover:underline">Kullanım Koşulları</Link>'nı 
                  ve <Link to="/privacy" className="text-twitter-blue hover:underline">Gizlilik Politikası</Link>'nı 
                  okudum ve kabul ediyorum.
                </span>
              </label>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Kayıt Ol
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-twitter-darkGray">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-twitter-blue hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
