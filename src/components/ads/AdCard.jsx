import { useEffect, useRef } from 'react'

export default function AdCard({ adClient, adSlot }) {
  const adRef = useRef(null)
  const isLoaded = useRef(false)

  useEffect(() => {
    if (!adClient || !adSlot || isLoaded.current) return

    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement('script')
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.setAttribute('data-ad-client', adClient)
        document.head.appendChild(script)
      }

      // Push the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({})
      isLoaded.current = true
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [adClient, adSlot])

  if (!adClient || !adSlot) {
    return null
  }

  return (
    <div className="card p-4 my-2">
      <div className="text-xs text-twitter-lightGray mb-2 text-center">
        Sponsorlu
      </div>
      <div ref={adRef} className="flex items-center justify-center min-h-[250px] bg-twitter-extraLightGray rounded-xl overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '250px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}

// Placeholder version for development/preview
export function AdCardPlaceholder() {
  return (
    <div className="card p-4 my-2">
      <div className="text-xs text-twitter-lightGray mb-2 text-center">
        Sponsorlu
      </div>
      <div className="flex flex-col items-center justify-center min-h-[250px] bg-gradient-to-br from-twitter-extraLightGray to-twitter-lightGray/20 rounded-xl">
        <div className="text-twitter-lightGray text-sm">Reklam Alanı</div>
        <div className="text-twitter-lightGray/60 text-xs mt-1">AdSense entegrasyonu aktif değil</div>
      </div>
    </div>
  )
}
