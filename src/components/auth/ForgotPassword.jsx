import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('E-posta adresi gerekli');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-twitter-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-twitter-blue" />
            </div>
            <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
              E-posta Gönderildi!
            </h2>
            <p className="text-twitter-gray mb-6">
              Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi. 
              Lütfen gelen kutunuzu kontrol edin.
            </p>
            <p className="text-sm text-twitter-gray mb-6">
              E-posta gelmedi mi? Spam/gereksiz klasörünü kontrol edin veya birkaç dakika bekleyin.
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                <ArrowLeft size={18} className="mr-2" />
                Giriş Sayfasına Dön
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
              Şifremi Unuttum
            </h1>
            <p className="text-twitter-gray mt-2">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error=""
              icon={<Mail size={18} />}
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              <Send size={18} className="mr-2" />
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-twitter-gray text-sm">
              Şifrenizi hatırladınız mı?{' '}
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
