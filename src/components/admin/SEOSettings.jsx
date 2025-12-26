import { useState, useEffect } from 'react'
import { Save, Search, Globe, TrendingUp } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../common/Spinner'
import Button from '../common/Button'

export default function SEOSettings() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    twitter_card: 'summary_large_image',
    google_analytics_id: '',
    google_search_console: '',
    robots_txt: '',
    sitemap_enabled: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSEO()
      setSettings(prev => ({ ...prev, ...response.data.data }))
    } catch (error) {
      toast.error('SEO ayarları yüklenemedi')
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
      await adminAPI.updateSEO(settings)
      toast.success('SEO ayarları kaydedildi')
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SEO Ayarları</h1>
        <p className="text-sm text-gray-500 mt-1">Arama motoru optimizasyonu ayarlarını yönetin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Meta Tags */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Meta Etiketleri</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta Title
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  ({settings.meta_title.length}/60)
                </span>
              </label>
              <input
                type="text"
                name="meta_title"
                value={settings.meta_title}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="SanatSepet - Türk Sanat ve Kültür Platformu"
              />
              <p className="text-xs text-gray-500 mt-1">
                Arama motorlarında görünecek başlık
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta Description
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  ({settings.meta_description.length}/160)
                </span>
              </label>
              <textarea
                name="meta_description"
                value={settings.meta_description}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Türk sanatı ve kültürünü keşfedin, paylaşın ve tartışın."
              />
              <p className="text-xs text-gray-500 mt-1">
                Arama motorlarında görünecek açıklama
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta Keywords
              </label>
              <input
                type="text"
                name="meta_keywords"
                value={settings.meta_keywords}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="sanat, kültür, türk sanatı, forum, topluluk"
              />
              <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak yazın</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Sosyal Medya</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                OG Image URL
              </label>
              <input
                type="text"
                name="og_image"
                value={settings.og_image}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Önerilen boyut: 1200x630 piksel
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Twitter Card Tipi
              </label>
              <select
                name="twitter_card"
                value={settings.twitter_card}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
              Analytics & Doğrulama
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Google Analytics ID
              </label>
              <input
                type="text"
                name="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="G-XXXXXXXXXX veya UA-XXXXXXXXX-X"
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Analytics izleme kodu
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Google Search Console
              </label>
              <input
                type="text"
                name="google_search_console"
                value={settings.google_search_console}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent text-sm sm:text-base"
                placeholder="Doğrulama meta etiketi içeriği"
              />
              <p className="text-xs text-gray-500 mt-1">
                Site doğrulama kodu
              </p>
            </div>
          </div>
        </div>

        {/* Robots & Sitemap */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
            <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
              Robots & Sitemap
            </h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                robots.txt İçeriği
              </label>
              <textarea
                name="robots_txt"
                value={settings.robots_txt}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent font-mono text-xs sm:text-sm resize-none"
                placeholder={`User-agent: *\nAllow: /\nSitemap: https://sanatsepet.com/sitemap.xml`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Arama motoru tarama kuralları
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="sitemap_enabled"
                checked={settings.sitemap_enabled}
                onChange={handleChange}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-twitter-blue focus:ring-twitter-blue flex-shrink-0"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 text-sm sm:text-base block">
                  Otomatik Sitemap
                </span>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Sitemap.xml otomatik oluştursun
                </p>
              </div>
            </label>
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