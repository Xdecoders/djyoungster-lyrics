'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  FiBell,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiClock,
  FiUsers,
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiSmartphone,
  FiMonitor,
  FiMousePointer,
  FiTrendingUp,
  FiBarChart2,
  FiMusic,
  FiSearch
} from 'react-icons/fi'

export default function PushNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [activeSubscribers, setActiveSubscribers] = useState(0)
  const [analytics, setAnalytics] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [sending, setSending] = useState(null)

  // Song selection
  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [songSearch, setSongSearch] = useState('')
  const [showSongDropdown, setShowSongDropdown] = useState(false)
  const songSearchRef = useRef(null)

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (songSearchRef.current && !songSearchRef.current.contains(e.target)) {
        setShowSongDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const [res, songsRes] = await Promise.all([
        fetch('/api/admin/push-notifications', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/songs', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setActiveSubscribers(data.activeSubscribers || 0)
        setAnalytics(data.analytics || null)
      }
      if (songsRes.ok) {
        const data = await songsRes.json()
        setSongs((data || []).filter(s => s.status === 'published'))
      }
    } catch (error) {
      console.error('Error fetching push notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSongs = songs.filter(song =>
    song.title?.toLowerCase().includes(songSearch.toLowerCase()) ||
    song.artists?.some(sa => sa.artist?.name?.toLowerCase().includes(songSearch.toLowerCase()))
  ).slice(0, 10)

  const handleSongSelect = (song) => {
    setSelectedSong(song)
    setSongSearch('')
    setShowSongDropdown(false)

    const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || ''
    setTitle(`${song.title}${artistNames ? ` - ${artistNames}` : ''}`)
    setBody(`Check out the lyrics for ${song.title}${artistNames ? ` by ${artistNames}` : ''} on DJYoungster!`)
    setUrl(`/song/${song.slug}`)
  }

  const openCompose = (notification = null) => {
    if (notification) {
      setEditingNotification(notification)
      setTitle(notification.title)
      setBody(notification.body)
      setUrl(notification.url || '')
    } else {
      setEditingNotification(null)
      setTitle('')
      setBody('')
      setUrl('')
      setSelectedSong(null)
      setSongSearch('')
    }
    setShowCompose(true)
  }

  const handleSave = async (sendNow = false) => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')

      if (editingNotification) {
        const res = await fetch(`/api/admin/push-notifications/${editingNotification.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
            url: url.trim() || null,
            ...(sendNow && { action: 'send' }),
          }),
        })
        if (!res.ok) throw new Error('Failed to update')
      } else {
        const res = await fetch('/api/admin/push-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
            url: url.trim() || null,
            sendNow,
          }),
        })
        if (!res.ok) throw new Error('Failed to create')
      }

      setShowCompose(false)
      fetchData()
    } catch (error) {
      console.error('Error saving notification:', error)
      alert('Failed to save notification')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async (notification) => {
    setSending(notification.id)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/push-notifications/${notification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'send' }),
      })
      if (!res.ok) throw new Error('Failed to send')
      const data = await res.json()
      alert(`Sent to ${data.sent} subscribers (${data.failed} failed)`)
      fetchData()
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification')
    } finally {
      setSending(null)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/push-notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setDeleteConfirm(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting notification:', error)
      alert('Failed to delete notification')
    }
  }

  const sentCount = notifications.filter((n) => n.status === 'sent').length
  const draftCount = notifications.filter((n) => n.status === 'draft').length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Push Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Send push notifications and track engagement</p>
        </div>
        <button
          onClick={() => openCompose()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          <FiPlus className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MiniStat
          label="Subscribers"
          value={analytics?.activeSubscribers ?? 0}
          icon={FiUsers}
          color="blue"
          loading={loading}
        />
        <MiniStat
          label="Unsubscribed"
          value={analytics?.unsubscribed ?? 0}
          icon={FiAlertCircle}
          color="slate"
          loading={loading}
        />
        <MiniStat
          label="PWA Installs"
          value={analytics?.totalPwaInstalls ?? 0}
          icon={FiDownload}
          color="purple"
          loading={loading}
        />
        <MiniStat
          label="Delivered"
          value={analytics?.totalDelivered ?? 0}
          icon={FiSend}
          color="emerald"
          loading={loading}
        />
        <MiniStat
          label="Clicks"
          value={analytics?.totalClicks ?? 0}
          icon={FiMousePointer}
          color="amber"
          loading={loading}
        />
        <MiniStat
          label="Click Rate"
          value={`${analytics?.clickRate ?? '0.0'}%`}
          icon={FiTrendingUp}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Platform Breakdown + Notification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Install Platform Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800 text-sm">Install Platforms</h3>
          </div>
          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : !analytics?.totalPwaInstalls ? (
            <p className="text-sm text-slate-400">No installs yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics.platformBreakdown || {}).map(([platform, count]) => {
                const percent = ((count / analytics.totalPwaInstalls) * 100).toFixed(0)
                const Icon = platform === 'android' ? FiSmartphone : platform === 'ios' ? FiSmartphone : FiMonitor
                const color = platform === 'android' ? 'emerald' : platform === 'ios' ? 'blue' : 'slate'
                return (
                  <div key={platform} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 text-${color}-500`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 capitalize">{platform}</span>
                        <span className="text-xs text-slate-500">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`bg-${color}-500 h-1.5 rounded-full transition-all`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notification Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-800 text-sm">Notification Summary</h3>
          </div>
          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{sentCount}</p>
                <p className="text-xs text-emerald-600">Sent</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{draftCount}</p>
                <p className="text-xs text-amber-600">Drafts</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{analytics?.totalDelivered ?? 0}</p>
                <p className="text-xs text-blue-600">Total Delivered</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{analytics?.totalFailed ?? 0}</p>
                <p className="text-xs text-red-600">Total Failed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All Notifications</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first push notification</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-800 truncate">
                        {notification.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{notification.body}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.status === 'sent' && (
                        <>
                          <span className="flex items-center gap-1 text-emerald-500">
                            <FiCheck className="w-3 h-3" />
                            {notification.sentTo} delivered
                          </span>
                          {notification.failedTo > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <FiAlertCircle className="w-3 h-3" />
                              {notification.failedTo} failed
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-amber-500">
                            <FiMousePointer className="w-3 h-3" />
                            {notification.clicks} clicks
                            {notification.sentTo > 0 && (
                              <span className="text-slate-400">
                                ({((notification.clicks / notification.sentTo) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </>
                      )}
                      {notification.url && (
                        <span className="text-blue-500 truncate max-w-[200px]">
                          {notification.url}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {notification.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleSend(notification)}
                          disabled={sending === notification.id}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Send Now"
                        >
                          {sending === notification.id ? (
                            <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                          ) : (
                            <FiSend className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openCompose(notification)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingNotification ? 'Edit Notification' : 'Compose Notification'}
              </h2>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Song Selection */}
              {!editingNotification && (
                <div ref={songSearchRef} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Song</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={songSearch}
                      onChange={(e) => {
                        setSongSearch(e.target.value)
                        setShowSongDropdown(true)
                      }}
                      onFocus={() => setShowSongDropdown(true)}
                      placeholder="Search for a song..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {showSongDropdown && filteredSongs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredSongs.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => handleSongSelect(song)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition text-left"
                        >
                          {song.coverImage ? (
                            <Image src={song.coverImage} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <FiMusic className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{song.title}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || 'Unknown Artist'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSong && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      {selectedSong.coverImage ? (
                        <Image src={selectedSong.coverImage} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover" unoptimized />
                      ) : (
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FiMusic className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{selectedSong.title}</p>
                        <p className="text-sm text-slate-500">
                          {selectedSong.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSong(null)
                          setTitle('')
                          setBody('')
                          setUrl('')
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/songs/example-song or https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !title.trim() || !body.trim()}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !title.trim() || !body.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Notification?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, icon: Icon, color, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`bg-${color}-100 w-7 h-7 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
        </div>
      </div>
      <p className="text-lg font-bold text-slate-800">
        {loading ? <span className="inline-block w-8 h-5 bg-slate-200 rounded animate-pulse"></span> : value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
