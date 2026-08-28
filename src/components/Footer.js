'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FiMusic,
  FiMail
} from 'react-icons/fi'
import { FaWhatsapp, FaXTwitter, FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube, FaGooglePlay, FaAppStoreIos } from 'react-icons/fa6'

export default function Footer() {
  const pathname = usePathname()
  const [categories, setCategories] = useState([])
  const [genres, setGenres] = useState([])
  const [tags, setTags] = useState([])
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState('')

  // Don't render footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  // Fetch categories and genres for footer links
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homepageRes, tagsRes] = await Promise.all([
          fetch('/api/public/homepage'),
          fetch('/api/public/tags?sort=recent&limit=6')
        ])
        const data = await homepageRes.json()
        const tagsData = await tagsRes.json()
        if (data.categories) setCategories(data.categories.slice(0, 6))
        if (data.genres) setGenres(data.genres.slice(0, 5))
        if (Array.isArray(tagsData)) setTags(tagsData)
      } catch (error) {
        console.error('Error fetching footer data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setSubscribeMessage('Please enter a valid email')
      return
    }

    setSubscribing(true)
    setSubscribeMessage('')

    try {
      const res = await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      setSubscribeMessage(data.message)
      if (res.ok) {
        setEmail('')
      }
    } catch (error) {
      setSubscribeMessage('Error subscribing. Please try again.')
    } finally {
      setSubscribing(false)
      setTimeout(() => setSubscribeMessage(''), 5000)
    }
  }

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/songs', label: 'All Songs' },
    { href: '/artists', label: 'Artists' },
    { href: '/albums', label: 'Albums' },
    { href: '/genres', label: 'Genres' },
    { href: '/movies', label: 'Movies' },
    { href: '/updates', label: 'Latest Updates' },
    { href: '/web-stories', label: 'Lyric Stories' },
    { href: '/request-song', label: 'Request Song Lyrics' },
  ]

  const legalLinks = [
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
    { href: '/lyrics-instagram-story-maker', label: 'Lyrics Story Maker' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
    { href: '/disclaimer', label: 'Disclaimer' },
    { href: '/dmca', label: 'DMCA Takedown' },
  ]

  return (
    <>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-10">
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-2">
                  <FiMusic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">DJYoungster</span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                Your ultimate destination for song lyrics. Find, read, and sing along to your favorite songs from Bollywood, Punjabi, and more.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stay updated with new lyrics</p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <div className="relative flex-1">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      disabled={subscribing}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-md flex-shrink-0 disabled:opacity-50"
                  >
                    {subscribing ? '...' : 'Subscribe'}
                  </button>
                </form>
                {subscribeMessage && (
                  <p className={`text-xs mt-2 ${subscribeMessage.includes('Error') || subscribeMessage.includes('already') ? 'text-red-500' : 'text-emerald-500'}`}>
                    {subscribeMessage}
                  </p>
                )}
              </div>

              {/* App Store Badges */}
              <div className="mb-5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Get the App</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=net.djyoungster.twa&hl=en_IN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl transition group w-fit"
                    aria-label="Get it on Google Play"
                  >
                    <FaGooglePlay className="w-5 h-5 text-white flex-shrink-0" />
                    <div className="leading-tight">
                      <div className="text-[10px] text-slate-300 group-hover:text-slate-200">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                  <a
                    href="https://apps.apple.com/us/app/djyoungster/id6794410019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl transition group w-fit"
                    aria-label="Download on the App Store"
                  >
                    <FaAppStoreIos className="w-5 h-5 text-white flex-shrink-0" />
                    <div className="leading-tight">
                      <div className="text-[10px] text-slate-300 group-hover:text-slate-200">DOWNLOAD ON THE</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-3">
                <a href="https://x.com/djyoungstercom" target="_blank" rel="noopener noreferrer me" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition" aria-label="Follow on X">
                  <FaXTwitter className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/djyoungster" target="_blank" rel="noopener noreferrer me" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-[#1877F2] hover:text-white transition" aria-label="Follow on Facebook">
                  <FaFacebookF className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/djyoungster_com" target="_blank" rel="noopener noreferrer me" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition" aria-label="Follow on Instagram">
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a href="https://www.linkedin.com/in/djyoungsterofficial" target="_blank" rel="noopener noreferrer me" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-[#0A66C2] hover:text-white transition" aria-label="Follow on LinkedIn">
                  <FaLinkedinIn className="w-4 h-4" />
                </a>
                <a href="https://youtube.com/@Djyoungstercom" target="_blank" rel="noopener noreferrer me" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-[#FF0000] hover:text-white transition" aria-label="Subscribe on YouTube">
                  <FaYoutube className="w-4 h-4" />
                </a>
              </div>

            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Languages</h4>
              <ul className="space-y-2.5">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition"
                      >
                        {cat.name} Songs
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link href="/category/hindi" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">Hindi Songs</Link></li>
                    <li><Link href="/category/punjabi" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">Punjabi Songs</Link></li>
                    <li><Link href="/category/english" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">English Songs</Link></li>
                    <li><Link href="/category/tamil" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">Tamil Songs</Link></li>
                    <li><Link href="/category/telugu" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">Telugu Songs</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-4">Tags</h4>
              <ul className="space-y-2.5">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/tag/${tag.slug}`}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition"
                      >
                        {tag.name.replace(/\b\w/g, c => c.toUpperCase())} Songs
                      </Link>
                    </li>
                  ))
                ) : (
                  <li><Link href="/tags" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition">Browse Tags</Link></li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center sm:text-left">
                &copy; {currentYear} DJYoungster Lyrics. All rights reserved.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Feelings borrowed from songs.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </>
  )
}
