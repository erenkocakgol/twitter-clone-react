import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const { token } = useParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'E-posta doğrulanamadı.');
      }
    };

    if (token) {
      verify();
    } else {
      setStatus('error');
      setErrorMessage('Geçersiz doğrulama bağlantısı.');
    }
  }, [token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-twitter-gray">E-posta doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twitter-extraLightGray px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
              E-posta Doğrulandı!
            </h2>
            <p className="text-twitter-gray mb-6">
              Hesabınız başarıyla aktifleştirildi. Artık SanatSepet'e giriş yapabilirsiniz.
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
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-twitter-darkGray mb-2">
            Doğrulama Başarısız
          </h2>
          <p className="text-twitter-gray mb-6">
            {errorMessage}
          </p>
          <p className="text-sm text-twitter-gray mb-6">
            Bağlantının süresi dolmuş olabilir. Giriş sayfasından yeni bir doğrulama bağlantısı talep edebilirsiniz.
          </p>
          <div className="space-y-3">
            <Link to="/login">
              <Button variant="primary" className="w-full">
                <Mail size={18} className="mr-2" />
                Giriş Sayfasına Git
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
