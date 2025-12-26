import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gerekli';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Ad en az 2 karakter olmalı';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gerekli';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalı';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifre tekrarı gerekli';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
    } catch (error) {
      if (error.message?.includes('kullanıcı adı') || error.message?.includes('username')) {
        setErrors({ username: 'Bu kullanıcı adı zaten kullanılıyor' });
      } else if (error.message?.includes('e-posta') || error.message?.includes('email')) {
        setErrors({ email: 'Bu e-posta adresi zaten kayıtlı' });
      } else {
        setErrors({ general: error.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
              Kayıt Başarılı!
            </h2>
            <p className="text-twitter-gray mb-6">
              E-posta adresinize bir doğrulama bağlantısı gönderdik. Hesabınızı aktifleştirmek için lütfen e-postanızı kontrol edin.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-twitter-darkGray">
              SanatSepet
            </h1>
            <p className="text-twitter-gray mt-2">Yeni hesap oluşturun</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="name"
              placeholder="Ad Soyad"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User size={18} />}
              autoComplete="name"
            />

            <Input
              type="text"
              name="username"
              placeholder="Kullanıcı adı"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              icon={<AtSign size={18} />}
              autoComplete="username"
            />

            <Input
              type="email"
              name="email"
              placeholder="E-posta adresi"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={18} />}
              autoComplete="email"
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Şifre"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} />}
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-twitter-gray hover:text-twitter-darkGray"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Input
              type={showPasswordConfirm ? 'text' : 'password'}
              name="passwordConfirm"
              placeholder="Şifre tekrarı"
              value={formData.passwordConfirm}
              onChange={handleChange}
              error={errors.passwordConfirm}
              icon={<Lock size={18} />}
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="text-twitter-gray hover:text-twitter-darkGray"
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <p className="text-xs text-twitter-gray">
              Kayıt olarak{' '}
              <a href="/terms" className="text-twitter-blue hover:underline">
                Kullanım Koşulları
              </a>{' '}
              ve{' '}
              <a href="/privacy" className="text-twitter-blue hover:underline">
                Gizlilik Politikası
              </a>
              'nı kabul etmiş olursunuz.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              <UserPlus size={18} className="mr-2" />
              Kayıt Ol
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-twitter-gray text-sm">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-twitter-blue hover:underline font-medium">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
