import { useState, useEffect } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'

export default function SiteSettings() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_footer: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#1DA1F2',
    maintenance_mode: false
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings()
      setSettings(prev => ({ ...prev, ...response.data.data }))
    } catch (error) {
      toast.error('Ayarlar yüklenemedi')
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
      await adminAPI.updateSettings(settings)
      toast.success('Ayarlar kaydedildi')
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Site Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">Sitenizin temel ayarlarını buradan yönetin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Temel Bilgiler</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Site Adı
              </label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="SanatSepet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Site Açıklaması
              </label>
              <textarea
                name="site_description"
                value={settings.site_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Türk sanat ve kültür platformu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Footer Metni
              </label>
              <input
                type="text"
                name="site_footer"
                value={settings.site_footer}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="© 2024 SanatSepet. Tüm hakları saklıdır."
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Marka Ayarları</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logo_url"
                  value={settings.logo_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Favicon URL
                </label>
                <input
                  type="text"
                  name="favicon_url"
                  value={settings.favicon_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ana Renk
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleChange}
                  className="w-12 h-10 sm:w-14 sm:h-12 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={settings.primary_color}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm"
                  placeholder="#1DA1F2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Bakım Modu</h2>
          </div>
          <div className="p-4 sm:p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleChange}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-twitter-blue focus:ring-twitter-blue flex-shrink-0"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 text-sm sm:text-base block">
                  Bakım Modunu Etkinleştir
                </span>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Site bakım modundayken sadece adminler erişebilir
                </p>
              </div>
            </label>
            {settings.maintenance_mode && (
              <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-yellow-700">
                  Bakım modu aktif. Normal kullanıcılar siteye erişemez.
                </p>
              </div>
            )}
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