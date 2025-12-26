import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Lock, Bell, Shield, LogOut, UserX, Check, X, Edit2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { usersAPI } from '../services/api'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import Avatar from '../components/common/Avatar'
import Spinner from '../components/common/Spinner'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, changePassword, deleteAccount, refreshUser } = useAuth()
  const toast = useToast()

  const [activeSection, setActiveSection] = useState('account')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  
  // Username/Email editing state
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Notification settings state
  const [notifications, setNotifications] = useState({
    email_new_follower: true,
    email_new_message: true,
    email_post_comment: true,
    email_post_star: false,
    email_post_repost: false,
    push_enabled: true
  })
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    show_email: false,
    allow_messages: true,
    show_activity: true
  })
  const [privacyLoading, setPrivacyLoading] = useState(false)

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(false)
  const [unblockingId, setUnblockingId] = useState(null)
  
  // Initial settings loading state
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    setSettingsLoading(true)
    try {
      // Notification ayarlarını yükle
      const notifResponse = await usersAPI.getNotifications()
      const notifData = notifResponse.data?.data || notifResponse.data || {}
      setNotifications(prev => ({ ...prev, ...notifData }))
      
      // Privacy ayarlarını yükle
      const privacyResponse = await usersAPI.getPrivacy()
      const privacyData = privacyResponse.data?.data || privacyResponse.data || {}
      setPrivacy(prev => ({ ...prev, ...privacyData }))
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Load blocked users when privacy section is active
  useEffect(() => {
    if (activeSection === 'privacy') {
      loadBlockedUsers()
    }
  }, [activeSection])

  const loadBlockedUsers = async () => {
    setBlockedLoading(true)
    try {
      const response = await usersAPI.blocked()
      setBlockedUsers(response.data?.data || [])
    } catch (error) {
      console.error('Engellenen kullanıcılar yüklenemedi:', error)
    } finally {
      setBlockedLoading(false)
    }
  }

  const handleUnblock = async (username) => {
    setUnblockingId(username)
    try {
      await usersAPI.unblock(username)
      setBlockedUsers(prev => prev.filter(u => u.username !== username))
      toast.success('Kullanıcı engeli kaldırıldı')
    } catch (error) {
      toast.error(error.message || 'Engel kaldırılamadı')
    } finally {
      setUnblockingId(null)
    }
  }

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      toast.error('Kullanıcı adı boş olamaz')
      return
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      toast.error('Kullanıcı adı 3-20 karakter arası olmalıdır')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      toast.error('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir')
      return
    }

    setUsernameLoading(true)
    try {
      await usersAPI.updateUsername(newUsername)
      toast.success('Kullanıcı adı güncellendi')
      setEditingUsername(false)
      if (refreshUser) await refreshUser()
    } catch (error) {
      toast.error(error.message || 'Kullanıcı adı güncellenemedi')
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error('E-posta boş olamaz')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Geçerli bir e-posta adresi girin')
      return
    }

    setEmailLoading(true)
    try {
      await usersAPI.updateEmail(newEmail)
      toast.success('E-posta güncellendi. Doğrulama e-postası gönderildi.')
      setEditingEmail(false)
      if (refreshUser) await refreshUser()
    } catch (error) {
      toast.error(error.message || 'E-posta güncellenemedi')
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Şifreniz başarıyla değiştirildi')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.message || 'Şifre değiştirilemedi')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleNotificationsSave = async () => {
    setNotificationsLoading(true)
    try {
      await usersAPI.updateNotifications(notifications)
      toast.success('Bildirim ayarları kaydedildi')
    } catch (error) {
      toast.error(error.message || 'Ayarlar kaydedilemedi')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handlePrivacySave = async () => {
    setPrivacyLoading(true)
    try {
      await usersAPI.updatePrivacy(privacy)
      toast.success('Gizlilik ayarları kaydedildi')
    } catch (error) {
      toast.error(error.message || 'Ayarlar kaydedilemedi')
    } finally {
      setPrivacyLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.username) {
      toast.error('Kullanıcı adını doğru yazın')
      return
    }

    setDeleteLoading(true)
    try {
      await deleteAccount()
      toast.success('Hesabınız silindi')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Hesap silinemedi')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sections = [
    { id: 'account', label: 'Hesap', icon: User },
    { id: 'security', label: 'Güvenlik', icon: Lock },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'privacy', label: 'Gizlilik', icon: Shield }
  ]

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-twitter-blue' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-twitter-extraLightGray">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-icon">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-twitter-black">Ayarlar</h1>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-twitter-extraLightGray min-h-[calc(100vh-120px)] hidden md:block">
          <nav className="p-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                  activeSection === section.id
                    ? 'bg-twitter-extraLightGray font-bold'
                    : 'hover:bg-twitter-extraLightGray/50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            ))}
            
            <hr className="my-2 border-twitter-extraLightGray" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 max-w-2xl">
          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-twitter-black mb-4">
                  Hesap Bilgileri
                </h2>
                <div className="space-y-3">
                  {/* Username */}
                  <div className="p-4 bg-twitter-extraLightGray/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-twitter-darkGray">Kullanıcı Adı</p>
                        {editingUsername ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-twitter-darkGray">@</span>
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="flex-1 px-2 py-1 border border-twitter-extraLightGray rounded-lg focus:outline-none focus:border-twitter-blue"
                              placeholder="yeni_kullanici_adi"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <p className="font-medium">@{user?.username}</p>
                        )}
                      </div>
                      {editingUsername ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleUsernameChange}
                            disabled={usernameLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          >
                            {usernameLoading ? <Spinner size="sm" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUsername(false)
                              setNewUsername('')
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setNewUsername(user?.username || '')
                            setEditingUsername(true)
                          }}
                          className="p-2 text-twitter-blue hover:bg-blue-50 rounded-full"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="p-4 bg-twitter-extraLightGray/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-twitter-darkGray">E-posta</p>
                        {editingEmail ? (
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-twitter-extraLightGray rounded-lg focus:outline-none focus:border-twitter-blue"
                            placeholder="yeni@eposta.com"
                            autoFocus
                          />
                        ) : (
                          <p className="font-medium">{user?.email}</p>
                        )}
                      </div>
                      {editingEmail ? (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={handleEmailChange}
                            disabled={emailLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          >
                            {emailLoading ? <Spinner size="sm" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmail(false)
                              setNewEmail('')
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setNewEmail(user?.email || '')
                            setEditingEmail(true)
                          }}
                          className="p-2 text-twitter-blue hover:bg-blue-50 rounded-full"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="p-4 bg-twitter-extraLightGray/50 rounded-xl">
                    <p className="text-sm text-twitter-darkGray">Üyelik Tarihi</p>
                    <p className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-twitter-black mb-4">
                  Şifre Değiştir
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    type="password"
                    label="Mevcut Şifre"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    required
                  />
                  <Input
                    type="password"
                    label="Yeni Şifre"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    required
                    minLength={8}
                  />
                  <Input
                    type="password"
                    label="Yeni Şifre (Tekrar)"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    required
                  />
                  <Button type="submit" loading={passwordLoading}>
                    Şifreyi Değiştir
                  </Button>
                </form>
              </div>

              <hr className="border-twitter-extraLightGray" />

              <div>
                <h2 className="text-lg font-bold text-red-500 mb-4">
                  Tehlikeli Bölge
                </h2>
                <p className="text-twitter-darkGray mb-4">
                  Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. 
                  Bu işlem geri alınamaz.
                </p>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Hesabımı Sil
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-twitter-black mb-4">
                Bildirim Ayarları
              </h2>
              
              <div className="space-y-4">
                <h3 className="font-medium text-twitter-black">E-posta Bildirimleri</h3>
                
                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Yeni takipçi</p>
                    <p className="text-sm text-twitter-darkGray">Birisi sizi takip ettiğinde</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.email_new_follower}
                    onChange={(val) => setNotifications(prev => ({ ...prev, email_new_follower: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Yeni mesaj</p>
                    <p className="text-sm text-twitter-darkGray">Size mesaj gönderildiğinde</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.email_new_message}
                    onChange={(val) => setNotifications(prev => ({ ...prev, email_new_message: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Gönderi yorumları</p>
                    <p className="text-sm text-twitter-darkGray">Gönderinize yorum yapıldığında</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.email_post_comment}
                    onChange={(val) => setNotifications(prev => ({ ...prev, email_post_comment: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Yıldızlamalar</p>
                    <p className="text-sm text-twitter-darkGray">Gönderiniz yıldızlandığında</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.email_post_star}
                    onChange={(val) => setNotifications(prev => ({ ...prev, email_post_star: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Repostlar</p>
                    <p className="text-sm text-twitter-darkGray">Gönderiniz repostlandığında</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.email_post_repost}
                    onChange={(val) => setNotifications(prev => ({ ...prev, email_post_repost: val }))}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleNotificationsSave} loading={notificationsLoading}>
                    Ayarları Kaydet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-twitter-black mb-4">
                Gizlilik Ayarları
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">E-postayı göster</p>
                    <p className="text-sm text-twitter-darkGray">Profilinizde e-posta adresinizi gösterin</p>
                  </div>
                  <ToggleSwitch
                    checked={privacy.show_email}
                    onChange={(val) => setPrivacy(prev => ({ ...prev, show_email: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Mesaj almaya izin ver</p>
                    <p className="text-sm text-twitter-darkGray">Takip etmediğiniz kişilerden mesaj alın</p>
                  </div>
                  <ToggleSwitch
                    checked={privacy.allow_messages}
                    onChange={(val) => setPrivacy(prev => ({ ...prev, allow_messages: val }))}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-twitter-extraLightGray">
                  <div>
                    <p className="font-medium">Aktiviteyi göster</p>
                    <p className="text-sm text-twitter-darkGray">Beğeni ve repost aktivitenizi gösterin</p>
                  </div>
                  <ToggleSwitch
                    checked={privacy.show_activity}
                    onChange={(val) => setPrivacy(prev => ({ ...prev, show_activity: val }))}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handlePrivacySave} loading={privacyLoading}>
                    Ayarları Kaydet
                  </Button>
                </div>
              </div>

              {/* Blocked Users */}
              <hr className="border-twitter-extraLightGray" />
              
              <div>
                <h3 className="text-lg font-bold text-twitter-black mb-4 flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  Engellenen Kullanıcılar
                </h3>
                
                {blockedLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <p className="text-twitter-darkGray py-4">
                    Henüz engellediğiniz kullanıcı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map(blockedUser => (
                      <div
                        key={blockedUser.id}
                        className="flex items-center justify-between p-3 bg-twitter-extraLightGray/50 rounded-xl"
                      >
                        <Link 
                          to={`/profile/${blockedUser.username}`}
                          className="flex items-center gap-3 flex-1"
                        >
                          <Avatar src={blockedUser.avatar} alt={blockedUser.name} size="sm" />
                          <div>
                            <p className="font-medium text-twitter-black">{blockedUser.name}</p>
                            <p className="text-sm text-twitter-darkGray">@{blockedUser.username}</p>
                          </div>
                        </Link>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUnblock(blockedUser.username)}
                          loading={unblockingId === blockedUser.username}
                        >
                          Engeli Kaldır
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="md:hidden mt-8 space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeSection === section.id
                    ? 'bg-twitter-extraLightGray font-bold'
                    : 'hover:bg-twitter-extraLightGray/50'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            ))}
            
            <hr className="my-2 border-twitter-extraLightGray" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hesabı Sil"
      >
        <div className="space-y-4">
          <p className="text-twitter-darkGray">
            Bu işlem geri alınamaz. Hesabınızı silmek istediğinize emin misiniz?
          </p>
          <p className="text-twitter-darkGray">
            Onaylamak için kullanıcı adınızı yazın: <strong>@{user?.username}</strong>
          </p>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Kullanıcı adınızı yazın"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              İptal
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              disabled={deleteConfirm !== user?.username}
            >
              Hesabımı Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
