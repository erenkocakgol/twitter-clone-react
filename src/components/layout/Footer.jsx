import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: 'Hakkında', href: '/about' },
    { label: 'Gizlilik', href: '/privacy' },
    { label: 'Kullanım Şartları', href: '/terms' },
    { label: 'İletişim', href: '/contact' }
  ]

  return (
    <footer className="hidden md:block text-center py-4 px-4 text-sm text-twitter-darkGray">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="hover:text-twitter-blue hover:underline transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p>© {currentYear} SanatSepet. Tüm hakları saklıdır.</p>
    </footer>
  )
}
