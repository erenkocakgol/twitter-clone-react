import { useState, useEffect } from 'react'
import { Save, DollarSign, Info, TrendingUp } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'

export default function AdsenseSettings() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    adsense_enabled: false,
    adsense_client_id: '',
    ad_slot_feed: '',
    ad_slot_sidebar: '',
    ad_slot_post: '',
    ad_frequency: 5
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getAdsense()
      setSettings(prev => ({ ...prev, ...response.data.data }))
    } catch (error) {
      toast.error('AdSense ayarları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.updateAdsense(settings)
      toast.success('AdSense ayarları kaydedildi')
    } catch (error) {
      toast.error(error.message || 'Ayarlar kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AdSense Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">Reklam geliri ayarlarını yönetin</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 flex-1">
          <p className="font-medium mb-1">Google AdSense Entegrasyonu</p>
          <p className="text-xs sm:text-sm">
            Reklam geliri elde etmek için Google AdSense hesabınızdan aldığınız bilgileri buraya girin. 
            AdSense hesabınız onaylandıktan sonra reklamlar otomatik olarak gösterilecektir.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Enable/Disable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Reklam Durumu</h2>
          </div>
          <div className="p-4 sm:p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="adsense_enabled"
                checked={settings.adsense_enabled}
                onChange={handleChange}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-twitter-blue focus:ring-twitter-blue flex-shrink-0"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 text-sm sm:text-base block">
                  Reklamları Etkinleştir
                </span>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Sitede Google AdSense reklamlarını göster
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Account Settings */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-opacity ${!settings.adsense_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Hesap Bilgileri</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                AdSense Client ID
              </label>
              <input
                type="text"
                name="adsense_client_id"
                value={settings.adsense_client_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                AdSense hesabınızdaki Publisher ID
              </p>
            </div>
          </div>
        </div>

        {/* Ad Slots */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-opacity ${!settings.adsense_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Reklam Slot ID'leri</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Feed Reklamı
                  <span className="text-gray-400 font-normal ml-1 text-xs">(Ana sayfa)</span>
                </label>
                <input
                  type="text"
                  name="ad_slot_feed"
                  value={settings.ad_slot_feed}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sidebar Reklamı
                  <span className="text-gray-400 font-normal ml-1 text-xs">(Kenar çubuğu)</span>
                </label>
                <input
                  type="text"
                  name="ad_slot_sidebar"
                  value={settings.ad_slot_sidebar}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                  placeholder="1234567890"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gönderi İçi Reklam
                <span className="text-gray-400 font-normal ml-1 text-xs">(Post detay sayfası)</span>
              </label>
              <input
                type="text"
                name="ad_slot_post"
                value={settings.ad_slot_post}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Ad Frequency */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-opacity ${!settings.adsense_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Reklam Sıklığı</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kaç gönderide bir reklam gösterilsin?
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="range"
                  name="ad_frequency"
                  min="3"
                  max="10"
                  value={settings.ad_frequency}
                  onChange={handleChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-twitter-blue w-full"
                />
                <span className="w-full sm:w-20 text-center font-bold text-xl text-twitter-blue bg-blue-50 py-2 rounded-lg border border-blue-100">
                  {settings.ad_frequency}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">
                Her <strong>{settings.ad_frequency}</strong> gönderiden sonra bir reklam gösterilecek
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 sm:static">
          <Button 
            type="submit" 
            loading={saving}
            className="w-full sm:w-auto shadow-lg sm:shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  )
}