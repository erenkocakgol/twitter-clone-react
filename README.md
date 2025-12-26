# 🎨 SanatSepet - Eski Twitter Klonu + Mesajlaşma

<div align="center">

**Herkes için tasarlanmış modern sosyal medya platformu**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php)](https://php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Demo](#demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [API](#-api-dokümantasyonu) • [Katkıda Bulunma](#-katkıda-bulunma)

</div>

---

## 📖 Hakkında

SanatSepet, sanatçıların eserlerini paylaşabildiği, birbirlerini takip edebildiği ve etkileşimde bulunabildiği Twitter benzeri bir sosyal medya platformudur. Türk sanatçı topluluğu için özel olarak tasarlanmıştır.

<div align="center">
</div>

## ✨ Özellikler

### 👤 Kullanıcı Yönetimi
- 📧 E-posta doğrulamalı kayıt sistemi
- 🔐 JWT tabanlı güvenli kimlik doğrulama
- 🔄 Şifre sıfırlama (e-posta ile)
- 👤 Özelleştirilebilir profil (avatar, kapak fotoğrafı, bio)
- ⚙️ Bildirim ve gizlilik ayarları

### 📝 Paylaşımlar
- ✍️ Metin ve görsel paylaşımı
- 🏷️ Hashtag desteği (Türkçe karakter normalizasyonu)
- ⭐ Yıldızlama (beğeni) sistemi
- 🔄 Repost (yeniden paylaşım)
- 💬 Yorum ve yanıt sistemi
- 🗑️ Soft delete ile güvenli silme

### 👥 Sosyal Özellikler
- 👣 Takip/Takipçi sistemi
- 💌 Özel mesajlaşma
- 🔔 Bildirimler
- 🚫 Kullanıcı engelleme
- 🔍 Kullanıcı ve içerik arama

### 📊 Keşfet
- 🔥 Trend olan etiketler
- 👥 Önerilen kullanıcılar
- 🔍 Gelişmiş arama

### 🛡️ Admin Paneli
- 📊 İstatistik dashboard
- 🚨 Şikayet yönetimi
- 👥 Kullanıcı yönetimi
- ⚙️ Site ayarları (SEO, AdSense)

## 🛠️ Teknoloji Stack

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| React 18 | UI Framework |
| React Router 6 | Routing |
| TailwindCSS | Styling |
| Axios | HTTP Client |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| PHP 8.x | Backend Language |
| MySQL 8.x | Database |
| PDO | Database Access |
| JWT | Authentication |
| PHPMailer | Email Service |

## 📁 Proje Yapısı

```
sanatsepet/
├── 📂 api/                    # PHP Backend
│   ├── auth.php               # Kimlik doğrulama
│   ├── posts.php              # Post işlemleri
│   ├── users.php              # Kullanıcı işlemleri
│   ├── comments.php           # Yorum işlemleri
│   ├── messages.php           # Mesajlaşma
│   ├── notifications.php      # Bildirimler
│   ├── upload.php             # Dosya yükleme
│   └── admin.php              # Admin işlemleri
│
├── 📂 config/                 # Yapılandırma
│   ├── database.php           # Veritabanı bağlantısı
│   ├── jwt.php                # JWT ayarları
│   ├── mail.php               # E-posta ayarları
│   ├── response.php           # API response helpers
│   └── .env.example           # Örnek environment dosyası
│
├── 📂 models/                 # PHP Model Sınıfları
│   ├── User.php
│   ├── Post.php
│   ├── Comment.php
│   ├── Follow.php
│   ├── Message.php
│   ├── Report.php
│   ├── Token.php
│   └── Settings.php
│
├── 📂 src/                    # React Frontend
│   ├── 📂 components/         # React Bileşenleri
│   │   ├── 📂 common/         # Ortak bileşenler
│   │   ├── 📂 layout/         # Layout bileşenleri
│   │   ├── 📂 post/           # Post bileşenleri
│   │   ├── 📂 profile/        # Profil bileşenleri
│   │   └── 📂 modals/         # Modal bileşenleri
│   │
│   ├── 📂 pages/              # Sayfa bileşenleri
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── PostPage.jsx
│   │   ├── Search.jsx
│   │   ├── Messages.jsx
│   │   ├── Notifications.jsx
│   │   └── Settings.jsx
│   │
│   ├── 📂 context/            # React Context
│   │   └── AuthContext.jsx
│   │
│   ├── 📂 hooks/              # Custom Hooks
│   │   ├── usePosts.js
│   │   └── useAuth.js
│   │
│   ├── 📂 services/           # API Servisleri
│   │   └── api.js
│   │
│   └── 📂 utils/              # Yardımcı fonksiyonlar
│       └── helpers.js
│
├── 📂 uploads/                # Yüklenen dosyalar
│   ├── avatars/
│   ├── covers/
│   └── posts/
│
└── 📂 sql/                    # Veritabanı şemaları
    └── schema.sql
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- PHP 8.0+
- MySQL 8.0+
- Composer (opsiyonel, PHPMailer için)

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/kullaniciadi/sanatsepet.git
cd sanatsepet
```

### 2. Backend Kurulumu

```bash
# Environment dosyasını oluşturun
cp config/.env.example config/.env

# .env dosyasını düzenleyin
nano config/.env
```

**.env dosyası içeriği:**
```env
# Database
DB_HOST=localhost
DB_NAME=sanatsepet
DB_USER=root
DB_PASS=your_password

# JWT
JWT_SECRET=your_super_secret_key_min_32_characters

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password

# Mail
MAIL_FROM=noreply@sanatsepet.tr
MAIL_FROM_NAME=SanatSepet

# Site
SITE_URL=https://sanatsepet.tr
```

### 3. Veritabanı Kurulumu

```bash
# MySQL'e bağlanın
mysql -u root -p

# Veritabanını oluşturun
CREATE DATABASE sanatsepet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Şemayı import edin
USE sanatsepet;
SOURCE sql/schema.sql;
```

### 4. Frontend Kurulumu

```bash
# Bağımlılıkları yükleyin
npm install

# Development server başlatın
npm run dev
```

### 5. PHP Server (Development)

```bash
# API klasöründe PHP server başlatın
cd api
php -S localhost:8000
```

### 6. Production Build

```bash
# Frontend build
npm run build

# Build klasörünü web sunucusuna deploy edin
```

## 🔧 Yapılandırma

### Apache .htaccess (API için)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS Headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, X-Auth-Token"
```

### Nginx Yapılandırması

```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 📚 API Dokümantasyonu

### Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth.php?action=register` | Kayıt |
| POST | `/api/auth.php?action=login` | Giriş |
| POST | `/api/auth.php?action=logout` | Çıkış |
| POST | `/api/auth.php?action=forgot-password` | Şifre sıfırlama |
| GET | `/api/auth.php?action=me` | Mevcut kullanıcı |

### Postlar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/posts.php` | Post listesi |
| GET | `/api/posts.php?slug={slug}` | Tek post |
| POST | `/api/posts.php` | Post oluştur |
| PUT | `/api/posts.php?id={id}` | Post güncelle |
| DELETE | `/api/posts.php?id={id}` | Post sil |
| POST | `/api/posts.php?action=star&id={id}` | Yıldızla |
| POST | `/api/posts.php?action=repost&id={id}` | Repost |

### Kullanıcılar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/users.php?username={username}` | Profil |
| PUT | `/api/users.php` | Profil güncelle |
| POST | `/api/users.php?action=follow&id={id}` | Takip et |
| GET | `/api/users.php?action=followers&id={id}` | Takipçiler |
| GET | `/api/users.php?action=following&id={id}` | Takip edilenler |

### Authentication Header

```
X-Auth-Token: <jwt_token>
```

## 🔒 Güvenlik

- ✅ JWT tabanlı stateless authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL Injection koruması (Prepared Statements)
- ✅ XSS koruması
- ✅ CORS yapılandırması
- ✅ Rate limiting (önerilir)
- ✅ Environment variables ile hassas veri yönetimi

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen aşağıdaki adımları izleyin:

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Commit Mesajı Formatı

```
feat: Yeni özellik
fix: Bug düzeltmesi
docs: Dokümantasyon
style: Kod formatı
refactor: Refactoring
test: Test ekleme
chore: Genel bakım
```

## 📝 Yapılacaklar

- [ ] Gerçek zamanlı bildirimler (WebSocket)
- [ ] Hikaye özelliği
- [ ] Görsel düzenleme araçları
- [ ] Çoklu dil desteği
- [ ] PWA desteği
- [ ] Mobil uygulama (React Native)
- [ ] AI destekli içerik önerileri

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👏 Teşekkürler

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [PHPMailer](https://github.com/PHPMailer/PHPMailer)

---

<div align="center">

**[⬆ Başa Dön](#-sanatsepet)**

Made with ❤️ by [Eren Koçakgöl](https://www.erenkocakgol.com.tr)

</div>
