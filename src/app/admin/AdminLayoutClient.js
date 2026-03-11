'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  FiMusic,
  FiHome,
  FiDisc,
  FiUsers,
  FiGrid,
  FiTag,
  FiFilm,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiAlertCircle,
  FiMail,
  FiSearch,
  FiFileText,
  FiDatabase,
  FiDownload,
  FiDownloadCloud,
  FiInbox,
  FiList,
  FiCornerUpRight,
  FiBarChart2
} from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [pendingReports, setPendingReports] = useState(0)
  const [activeSubscribers, setActiveSubscribers] = useState(0)
  const [pendingSongRequests, setPendingSongRequests] = useState(0)

  // Check if on login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Check for admin token
    const token = localStorage.getItem('adminToken')
    setIsLoggedIn(!!token)

    // Fetch badge counts
    if (token && !isLoginPage) {
      fetchPendingReports()
      fetchSubscriberCount()
      fetchPendingSongRequests()
    }
  }, [pathname, isLoginPage])

  const fetchPendingReports = async () => {
    try {
      const res = await fetch('/api/admin/reports?status=pending')
      if (res.ok) {
        const data = await res.json()
        setPendingReports(data.counts?.pending || 0)
      }
    } catch (error) {
      console.error('Error fetching pending reports:', error)
    }
  }

  const fetchPendingSongRequests = async () => {
    try {
      const res = await fetch('/api/admin/song-requests?status=pending&limit=1')
      if (res.ok) {
        const data = await res.json()
        setPendingSongRequests(data.counts?.pending || 0)
      }
    } catch (error) {
      console.error('Error fetching pending song requests:', error)
    }
  }

  const fetchSubscriberCount = async () => {
    try {
      const res = await fetch('/api/admin/newsletter/subscribers?limit=1')
      if (res.ok) {
        const data = await res.json()
        setActiveSubscribers(data.stats?.active || 0)
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/admin/songs', label: 'Songs', icon: FiMusic },
    { href: '/admin/songs/scrape', label: 'Scrape Song', icon: FiDownload },
    { href: '/admin/bulk-import', label: 'Bulk Import', icon: FiDownloadCloud },
    { href: '/admin/artists', label: 'Artists', icon: FiUsers },
    { href: '/admin/albums', label: 'Albums', icon: FiDisc },
    { href: '/admin/genres', label: 'Genres', icon: FiTag },
    { href: '/admin/categories', label: 'Categories', icon: FiGrid },
    { href: '/admin/movies', label: 'Movies', icon: FiFilm },
    { href: '/admin/top-lists', label: 'Top Lists', icon: FiList },
    { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { href: '/admin/redirects', label: 'Redirects', icon: FiCornerUpRight },
{ href: '/admin/newsletter', label: 'Newsletter', icon: FiMail, badgeType: 'subscriber' },
    { href: '/admin/reports', label: 'Reports', icon: FiAlertCircle, badgeType: 'reports' },
    { href: '/admin/song-requests', label: 'Song Requests', icon: FiInbox, badgeType: 'songRequests' },
    { href: '/admin/seo-settings', label: 'SEO Settings', icon: FiSearch },
    { href: '/admin/pages', label: 'Pages', icon: FiFileText },
    { href: '/admin/homepage', label: 'Homepage', icon: FiHome },
    { href: '/admin/cache', label: 'Cache', icon: FiDatabase },
    { href: '/admin/settings', label: 'Settings', icon: FiSettings },
  ]

  const isActive = (path) => {
    // Exact match for scrape and song-requests to avoid conflict with /admin/songs
    if (path === '/admin/songs' && (pathname.startsWith('/admin/songs/scrape') || pathname.startsWith('/admin/song-requests'))) return false
    return pathname.startsWith(path)
  }

  // Login page - minimal layout
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 overflow-hidden transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-2">
                <FiMusic className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-800">DJYoungster</span>
                <span className="text-xs text-slate-400 block">Admin Panel</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const badgeCount = item.badgeType === 'reports' ? pendingReports : item.badgeType === 'subscriber' ? activeSubscribers : item.badgeType === 'songRequests' ? pendingSongRequests : 0
              const hasBadge = badgeCount > 0
              const isReportsBadge = item.badgeType === 'reports' && hasBadge
              const isSongRequestsBadge = item.badgeType === 'songRequests' && hasBadge
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(item.href)
                      ? isReportsBadge ? 'bg-red-50 text-red-600' : isSongRequestsBadge ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-primary'
                      : isReportsBadge ? 'text-red-600 hover:bg-red-50' : isSongRequestsBadge ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {hasBadge && (
                    <span className={`ml-auto text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                      item.badgeType === 'reports' ? 'bg-red-500' : item.badgeType === 'songRequests' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all mb-2"
            >
              <FiHome className="w-5 h-5" />
              <span className="font-medium">View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all w-full"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Admin</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
