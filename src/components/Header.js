'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiMusic,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiInfo,
  FiList,
  FiFilm,
  FiZap,
  FiMail,
  FiShield
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const searchInputRef = useRef(null)
  const browseRef = useRef(null)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  // Don't render header on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
    setIsBrowseOpen(false)
  }, [pathname])

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Close browse dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setIsBrowseOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  // Check if link is active
  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/about', label: 'About', icon: FiInfo },
    { href: '/updates/category/news', label: 'News', icon: FiList },
    { href: '/updates/category/movie-reviews', label: 'Reviews', icon: FiFilm },
    { href: '/quiz', label: 'Quiz', icon: FiZap, highlight: true },
    { href: '/contact', label: 'Contact Us', icon: FiMail },
  ]

  const browseLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-and-conditions', label: 'Terms and Conditions' },
    { href: '/disclaimer', label: 'Disclaimer' },
    { href: '/dmca', label: 'DMCA' },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-sm'
            : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg'
        } border-b border-slate-100 dark:border-slate-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-2">
                <FiMusic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                DJYoungster
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                link.highlight ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900'
                        : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 ring-1 ring-emerald-200 dark:ring-emerald-800'
                    }`}
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-primary bg-emerald-50 dark:bg-emerald-900/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}

              {/* Browse Dropdown */}
              <div ref={browseRef} className="relative">
                <button
                  onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                  aria-label="Browse menu"
                  aria-expanded={isBrowseOpen}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    isBrowseOpen || browseLinks.some(l => isActive(l.href))
                      ? 'text-primary bg-emerald-50 dark:bg-emerald-900/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Policies
                  <FiChevronDown className={`w-4 h-4 transition-transform ${isBrowseOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isBrowseOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 animate-fadeIn">
                    {browseLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? 'text-primary bg-emerald-50 dark:bg-emerald-900/30'
                            : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:text-primary dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>

              {/* Desktop Search */}
              <div className="hidden md:block">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search songs, artists..."
                        className="w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      aria-label="Close search"
                      className="ml-2 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open search"
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Google Preferred Source Badge — desktop: full pill, mobile: icon only */}
              <a
                href="https://www.google.com/preferences/source?q=djyoungster.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
                aria-label="Add DJYoungster as a preferred source on Google"
              >
                {/* Google G Logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span className="hidden md:block text-xs font-medium text-white leading-tight whitespace-nowrap">
                  Add as a preferred<br />source on Google
                </span>
              </a>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-4 animate-slideDown">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs, artists, lyrics..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-xl z-40 transform transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                link.highlight
                  ? isActive(link.href)
                    ? 'text-white bg-emerald-500'
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 ring-1 ring-emerald-200 dark:ring-emerald-800'
                  : isActive(link.href)
                    ? 'text-primary bg-emerald-50 dark:bg-emerald-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <link.icon className={`w-5 h-5 ${link.highlight && !isActive(link.href) ? 'text-emerald-500' : ''}`} />
              <span className="font-medium">{link.label}</span>
              {link.highlight && <span className="ml-auto text-xs font-semibold bg-emerald-500 text-white rounded-full px-2 py-0.5">Daily</span>}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Policies</p>
            {browseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.href)
                    ? 'text-primary bg-emerald-50 dark:bg-emerald-900/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FiShield className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

        </nav>
      </div>
      {/* Sticky WhatsApp Channel Button */}
      <a
        href="https://whatsapp.com/channel/0029Vb7A52PEAKW8b0wxfV03"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join DJYoungster WhatsApp Channel"
        className="fixed bottom-5 right-4 z-50 flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full w-13 h-13 shadow-lg shadow-green-400/40 transition-all duration-300"
        style={{ width: '52px', height: '52px' }}
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    </>
  )
}
