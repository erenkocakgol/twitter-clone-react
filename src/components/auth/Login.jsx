import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { login, resendVerification } = useAuth();
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
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      if (error.message?.includes('doğrulanmamış') || error.message?.includes('verify')) {
        setErrors({ general: 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin veya yeni doğrulama bağlantısı alın.' });
        setResendEmail(formData.email);
      } else {
        setErrors({ general: error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setErrors({ resend: 'E-posta adresi gerekli' });
      return;
    }

    setResendLoading(true);
    try {
      await resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (error) {
      setErrors({ resend: error.message || 'Doğrulama bağlantısı gönderilemedi.' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-twitter-darkGray">
              SanatSepet
            </h1>
            <p className="text-twitter-gray mt-2">Hesabınıza giriş yapın</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              <LogIn size={18} className="mr-2" />
              Giriş Yap
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Link
              to="/forgot-password"
              className="block text-twitter-blue hover:underline text-sm"
            >
              Şifremi unuttum
            </Link>

            <button
              type="button"
              onClick={() => setShowResendVerification(!showResendVerification)}
              className="text-twitter-blue hover:underline text-sm"
            >
              Doğrulama bağlantısı al
            </button>

            <p className="text-twitter-gray text-sm">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-twitter-blue hover:underline font-medium">
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {showResendVerification && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-twitter-darkGray mb-3">
              Doğrulama Bağlantısı Al
            </h3>
            {resendSuccess ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                Doğrulama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
              </div>
            ) : (
              <form onSubmit={handleResendVerification} className="space-y-3">
                <Input
                  type="email"
                  placeholder="E-posta adresi"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  error={errors.resend}
                  icon={<Mail size={18} />}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  loading={resendLoading}
                >
                  Bağlantı Gönder
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
