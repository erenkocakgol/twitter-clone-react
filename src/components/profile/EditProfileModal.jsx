import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import { uploadAPI } from '../../services/api';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '../../utils/constants';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || ''
  });

  // DÜZELTME 1: Backend 'cover' gönderdiği için her iki ihtimali de kontrol ediyoruz
  // Öncelik Backend'den gelen 'cover' alanında olmalı
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [banner, setBanner] = useState(profile.cover || profile.banner || '');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast('Sadece JPG, PNG, GIF ve WEBP dosyaları yüklenebilir', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('Dosya boyutu 5MB\'dan küçük olmalı', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'avatar') {
        setAvatar(event.target.result);
        setAvatarFile(file);
      } else {
        setBanner(event.target.result);
        setBannerFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad gerekli';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Ad 50 karakterden uzun olamaz';
    }

    if (formData.bio.length > 160) {
      newErrors.bio = 'Biyografi 160 karakterden uzun olamaz';
    }

    if (formData.location.length > 30) {
      newErrors.location = 'Konum 30 karakterden uzun olamaz';
    }

    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Geçerli bir URL girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // --- AVATAR MANTIĞI ---
      let avatarUrl = profile.avatar;
      
      // Eğer kullanıcı avatarı kaldırdıysa (avatar state boşsa) ve yeni dosya seçmediyse
      if (!avatar && !avatarFile) {
        avatarUrl = null;
      } 
      // Yeni dosya seçildiyse yükle
      else if (avatarFile) {
        const response = await uploadAPI.avatar(avatarFile);
        avatarUrl = response.data.url || response.data.data?.url || response.data;
      }

      // --- COVER/BANNER MANTIĞI ---
      // Varsayılan olarak mevcut cover'ı al (değişiklik yoksa bunu göndereceğiz)
      let bannerUrl = profile.cover || profile.banner;

      // Durum 1: Kullanıcı X ile resmi kaldırdı (banner state boş) VE yeni dosya seçmedi
      if (!banner && !bannerFile) {
        bannerUrl = null; // Backend'e null göndererek silinmesini sağla
      }
      
      // Durum 2: Kullanıcı yeni bir dosya seçti
      else if (bannerFile) {
        const response = await uploadAPI.cover(bannerFile);
        bannerUrl = response.data.url || response.data.data?.url || response.data;
      }
      
      // Durum 3 (Else): Kullanıcı ne sildi ne de yeni yükledi, bannerUrl yukarıdaki varsayılan değerde kalır.

      // DÜZELTME 3: Backend 'cover' beklediği için 'banner' yerine 'cover' anahtarını kullanıyoruz
      await onSave({
        ...formData,
        avatar: avatarUrl,
        cover: bannerUrl // ÖNEMLİ: Burası 'banner' idi, 'cover' yapıldı
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || error.message || 'Profil güncellenemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Profili Düzenle">
      <form onSubmit={handleSubmit}>
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-r from-twitter-blue to-blue-400 -mx-6 -mt-6 mb-12">
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Kapak Fotoğrafı Yok
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <Camera size={20} />
            </button>
            {banner && (
              <button
                type="button"
                onClick={() => {
                  setBanner('');
                  setBannerFile(null);
                }}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ml-2"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e, 'banner')}
            className="hidden"
          />

          {/* Avatar */}
          <div className="absolute -bottom-10 left-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white bg-twitter-extraLightGray overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-twitter-gray text-2xl font-bold">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
              >
                <Camera size={20} className="text-white" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'avatar')}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-twitter-darkGray mb-1">
              Ad
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              maxLength={50}
            />
            <p className="text-xs text-twitter-gray mt-1 text-right">
              {formData.name.length}/50
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-twitter-darkGray mb-1">
              Biyografi
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={160}
              className={`
                w-full px-3 py-2 rounded-lg border transition-colors resize-none
                focus:outline-none focus:ring-2 focus:ring-twitter-blue/20 focus:border-twitter-blue
                ${errors.bio ? 'border-red-500' : 'border-twitter-lightGray'}
              `}
              placeholder="Kendiniz hakkında kısa bir bilgi"
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1">{errors.bio}</p>
            )}
            <p className="text-xs text-twitter-gray mt-1 text-right">
              {formData.bio.length}/160
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-twitter-darkGray mb-1">
              Konum
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              placeholder="İstanbul, Türkiye"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-twitter-darkGray mb-1">
              Web Sitesi
            </label>
            <Input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              error={errors.website}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-twitter-lightGray">
          <Button type="button" variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}