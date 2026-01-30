'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMusic,
  FiUser,
  FiDisc,
  FiGrid,
  FiPlus,
  FiFolder,
  FiFilm,
  FiUpload,
  FiChevronRight,
  FiLogOut,
  FiHome,
  FiAlertCircle,
  FiEdit2,
  FiClock,
  FiTag
} from 'react-icons/fi'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalGenres: 0
  })
  const [reports, setReports] = useState([])
  const [pendingReports, setPendingReports] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reports?status=pending')
      ])
      const statsData = await statsRes.json()
      setStats(statsData)

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData.reports?.slice(0, 5) || [])
        setPendingReports(reportsData.counts?.pending || 0)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-2.5 shadow-lg shadow-emerald-200">
                <FiMusic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Lyrics Admin</h1>
                <p className="text-xs sm:text-sm text-slate-500">Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 text-sm sm:text-base">Here's an overview of your music library</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Songs"
            value={stats.totalSongs}
            Icon={FiMusic}
            bgColor="bg-blue-50"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            loading={loading}
          />
          <StatCard
            title="Total Artists"
            value={stats.totalArtists}
            Icon={FiUser}
            bgColor="bg-emerald-50"
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            loading={loading}
          />
          <StatCard
            title="Total Albums"
            value={stats.totalAlbums}
            Icon={FiDisc}
            bgColor="bg-emerald-50"
            iconBgColor="bg-emerald-100"
            iconColor="text-primary"
            loading={loading}
          />
          <StatCard
            title="Total Genres"
            value={stats.totalGenres}
            Icon={FiGrid}
            bgColor="bg-amber-50"
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <ActionButton
              href="/admin/songs/add"
              Icon={FiPlus}
              title="Add Song"
              description="Add a new song"
              bgColor="bg-blue-50"
              hoverBgColor="hover:bg-blue-100"
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <ActionButton
              href="/admin/artists/add"
              Icon={FiUser}
              title="Add Artist"
              description="Add a new artist"
              bgColor="bg-emerald-50"
              hoverBgColor="hover:bg-emerald-100"
              iconBgColor="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <ActionButton
              href="/admin/albums/add"
              Icon={FiDisc}
              title="Add Album"
              description="Add a new album"
              bgColor="bg-emerald-50"
              hoverBgColor="hover:bg-emerald-100"
              iconBgColor="bg-emerald-100"
              iconColor="text-primary"
            />
            <ActionButton
              href="/admin/genres"
              Icon={FiGrid}
              title="Manage Genres"
              description="Add/Edit genres"
              bgColor="bg-amber-50"
              hoverBgColor="hover:bg-amber-100"
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
            />
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ManagementCard
            title="Songs Management"
            Icon={FiMusic}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            items={[
              { label: 'View All Songs', href: '/admin/songs', Icon: FiMusic },
              { label: 'Add New Song', href: '/admin/songs/add', Icon: FiPlus },
              { label: 'Bulk Import', href: '/admin/songs/import', Icon: FiUpload }
            ]}
          />
          <ManagementCard
            title="Artists Management"
            Icon={FiUser}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            items={[
              { label: 'View All Artists', href: '/admin/artists', Icon: FiUser },
              { label: 'Add New Artist', href: '/admin/artists/add', Icon: FiPlus }
            ]}
          />
          <ManagementCard
            title="Albums Management"
            Icon={FiDisc}
            iconBgColor="bg-emerald-100"
            iconColor="text-primary"
            items={[
              { label: 'View All Albums', href: '/admin/albums', Icon: FiDisc },
              { label: 'Add New Album', href: '/admin/albums/add', Icon: FiPlus }
            ]}
          />
          <ManagementCard
            title="Categories & Genres"
            Icon={FiFolder}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            items={[
              { label: 'Manage Genres', href: '/admin/genres', Icon: FiGrid },
              { label: 'Manage Categories', href: '/admin/categories', Icon: FiFolder },
              { label: 'Manage Tags', href: '/admin/tags', Icon: FiTag },
              { label: 'Manage Movies', href: '/admin/movies', Icon: FiFilm }
            ]}
          />
        </div>

        {/* Reports Section */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Recent Reports</h3>
                  <p className="text-sm text-slate-500">{pendingReports} pending reports</p>
                </div>
              </div>
              <Link
                href="/admin/reports"
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-sm flex items-center gap-2"
              >
                View All
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-500">No pending reports</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {report.song?.coverImage ? (
                        <img
                          src={report.song.coverImage}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiMusic className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {report.song?.title || 'Song deleted'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                            {report.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {report.song && (
                      <Link
                        href={`/admin/songs/${report.song.id}`}
                        className="p-2 text-primary hover:bg-emerald-50 rounded-lg transition flex-shrink-0"
                        title="Edit Song"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, Icon, bgColor, iconBgColor, iconColor, loading }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-6 border border-slate-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="order-2 sm:order-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse"></span>
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
        <div className={`${iconBgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center order-1 sm:order-2 self-start sm:self-auto`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

function ActionButton({ href, Icon, title, description, bgColor, hoverBgColor, iconBgColor, iconColor }) {
  return (
    <Link
      href={href}
      className={`${bgColor} ${hoverBgColor} rounded-xl p-4 transition-all duration-200 block border border-slate-100 hover:shadow-md hover:scale-[1.02]`}
    >
      <div className={`${iconBgColor} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-0.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">{description}</p>
    </Link>
  )
}

function ManagementCard({ title, Icon, iconBgColor, iconColor, items }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${iconBgColor} w-10 h-10 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center justify-between px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5">
              <item.Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        ))}
      </div>
    </div>
  )
}
