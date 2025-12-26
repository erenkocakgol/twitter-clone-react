import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const { verifyResetToken, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await verifyResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };
    checkToken();
  }, [token, verifyResetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

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
      await resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err) {
      setErrors({ general: err.message || 'Şifre sıfırlanamadı. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-twitter-gray">Bağlantı doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
              Geçersiz Bağlantı
            </h2>
            <p className="text-twitter-gray mb-6">
              Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
              Lütfen yeni bir şifre sıfırlama talebinde bulunun.
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" className="w-full">
                Yeni Bağlantı İste
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
              Şifre Değiştirildi!
            </h2>
            <p className="text-twitter-gray mb-6">
              Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </p>
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link
            to="/login"
            className="inline-flex items-center text-twitter-gray hover:text-twitter-darkGray mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Geri
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-twitter-darkGray">
              Yeni Şifre Belirle
            </h1>
            <p className="text-twitter-gray mt-2">
              Hesabınız için yeni bir şifre belirleyin.
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Yeni şifre"
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
              placeholder="Yeni şifre tekrarı"
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
              Şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, 
              bir küçük harf ve bir rakam içermelidir.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Şifreyi Değiştir
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
