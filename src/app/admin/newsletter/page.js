'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMail,
  FiSend,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiClock,
  FiTrendingUp,
  FiArrowLeft,
  FiEye,
  FiUserMinus,
  FiMusic,
  FiSearch
} from 'react-icons/fi'

export default function NewsletterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [newsletters, setNewsletters] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [songs, setSongs] = useState([])
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    totalEmailsSent: 0,
    totalNewsletters: 0
  })
  const [subscriberStats, setSubscriberStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0
  })

  // Modal states
  const [showCompose, setShowCompose] = useState(false)
  const [showSubscribers, setShowSubscribers] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingNewsletter, setEditingNewsletter] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Form states
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedSong, setSelectedSong] = useState(null)
  const [songSearch, setSongSearch] = useState('')
  const [showSongDropdown, setShowSongDropdown] = useState(false)
  const [saving, setSaving] = useState(false)
  const songSearchRef = useRef(null)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://djyoungster.com'

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
      const [newslettersRes, subscribersRes, songsRes] = await Promise.all([
        fetch('/api/admin/newsletter'),
        fetch('/api/admin/newsletter/subscribers'),
        fetch('/api/admin/songs')
      ])

      if (newslettersRes.ok) {
        const data = await newslettersRes.json()
        setNewsletters(data.newsletters || [])
        setStats(data.stats || {})
      }

      if (subscribersRes.ok) {
        const data = await subscribersRes.json()
        setSubscribers(data.subscribers || [])
        setSubscriberStats(data.stats || {})
      }

      if (songsRes.ok) {
        const data = await songsRes.json()
        setSongs(data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEmailTemplate = (song) => {
    if (!song) return ''

    const lyricsExcerpt = song.lyrics
      ? song.lyrics.split('\n').filter(line => line.trim()).slice(0, 3).join('\n')
      : ''

    const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || 'Unknown Artist'
    const coverImage = song.coverImage || `${siteUrl}/default-cover.jpg`
    const songUrl = `${siteUrl}/song/${song.slug}`

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${song.title} - New Lyrics on DJYoungster</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">DJYoungster</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Lyrics Destination</p>
            </td>
          </tr>

          <!-- Cover Image -->
          <tr>
            <td style="padding: 24px 24px 16px;">
              <img src="${coverImage}" alt="${song.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; display: block;">
            </td>
          </tr>

          <!-- Song Details -->
          <tr>
            <td style="padding: 0 24px;">
              <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 700;">${song.title}</h2>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">by ${artistNames}${song.releaseYear ? ` • ${song.releaseYear}` : ''}</p>
            </td>
          </tr>

          <!-- Lyrics Excerpt -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="background-color: #f8fafc; border-left: 3px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; white-space: pre-line;">${lyricsExcerpt}...</p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 32px;" align="center">
              <a href="${songUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">Read Full Lyrics</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 12px; color: #94a3b8; font-size: 13px;">
                <a href="${siteUrl}" style="color: #10b981; text-decoration: none;">Visit DJYoungster</a>
                <span style="margin: 0 8px;">•</span>
                <a href="${siteUrl}/unsubscribe" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 12px;">© ${new Date().getFullYear()} DJYoungster. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  const handleSongSelect = (song) => {
    setSelectedSong(song)
    setSongSearch('')
    setShowSongDropdown(false)

    const artistNames = song.artists?.map(sa => sa.artist?.name).filter(Boolean).join(', ') || ''
    setSubject(`🎵 New Lyrics: ${song.title}${artistNames ? ` by ${artistNames}` : ''}`)
    setContent(generateEmailTemplate(song))
  }

  const handleSave = async (sendNow = false) => {
    if (!subject.trim() || !content.trim()) {
      alert('Please select a song to generate the newsletter')
      return
    }

    setSaving(true)
    try {
      const url = editingNewsletter
        ? `/api/admin/newsletter/${editingNewsletter.id}`
        : '/api/admin/newsletter'

      const method = editingNewsletter ? 'PUT' : 'POST'
      const body = editingNewsletter
        ? { subject, content, action: sendNow ? 'send' : undefined }
        : { subject, content, sendNow }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setShowCompose(false)
        setEditingNewsletter(null)
        setSubject('')
        setContent('')
        setSelectedSong(null)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.message || 'Error saving newsletter')
      }
    } catch (error) {
      console.error('Error saving newsletter:', error)
      alert('Error saving newsletter')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setDeleteConfirm(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error)
    }
  }

  const handleDeleteSubscriber = async (id) => {
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id))
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    }
  }

  const openEdit = (newsletter) => {
    setEditingNewsletter(newsletter)
    setSubject(newsletter.subject)
    setContent(newsletter.content)
    setSelectedSong(null)
    setShowCompose(true)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredSongs = songs.filter(song =>
    song.title?.toLowerCase().includes(songSearch.toLowerCase()) ||
    song.artists?.some(sa => sa.artist?.name?.toLowerCase().includes(songSearch.toLowerCase()))
  ).slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FiMail className="w-5 h-5 text-purple-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Newsletter</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingNewsletter(null)
                setSubject('')
                setContent('')
                setSelectedSong(null)
                setShowCompose(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Compose</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{subscriberStats.active}</p>
                <p className="text-sm text-slate-500">Active Subscribers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <FiSend className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalEmailsSent}</p>
                <p className="text-sm text-slate-500">Emails Sent</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl">
                <FiMail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalNewsletters}</p>
                <p className="text-sm text-slate-500">Newsletters Sent</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSubscribers(true)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-xl">
                <FiTrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{subscriberStats.total}</p>
                <p className="text-sm text-slate-500">View Subscribers</p>
              </div>
            </div>
          </button>
        </div>

        {/* Newsletters List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">All Newsletters</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-slate-500">Loading...</p>
            </div>
          ) : newsletters.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-slate-500 mb-4">No newsletters yet</p>
              <button
                onClick={() => setShowCompose(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium text-sm"
              >
                Create First Newsletter
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {newsletters.map((newsletter) => (
                <div key={newsletter.id} className="p-5 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          newsletter.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {newsletter.status === 'sent' ? 'Sent' : 'Draft'}
                        </span>
                        {newsletter.sentTo > 0 && (
                          <span className="text-xs text-slate-500">
                            to {newsletter.sentTo} subscribers
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 truncate">{newsletter.subject}</h3>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {newsletter.status === 'sent' && newsletter.sentAt
                          ? `Sent ${formatDate(newsletter.sentAt)}`
                          : `Created ${formatDate(newsletter.createdAt)}`
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingNewsletter(newsletter)
                          setContent(newsletter.content)
                          setShowPreview(true)
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Preview"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {newsletter.status === 'draft' && (
                        <>
                          <button
                            onClick={() => openEdit(newsletter)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Send this newsletter to all subscribers?')) {
                                const res = await fetch(`/api/admin/newsletter/${newsletter.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'send' })
                                })
                                if (res.ok) fetchData()
                              }
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Send Now"
                          >
                            <FiSend className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(newsletter.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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
      </main>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingNewsletter ? 'Edit Newsletter' : 'Compose Newsletter'}
              </h3>
              <button
                onClick={() => {
                  setShowCompose(false)
                  setEditingNewsletter(null)
                  setSubject('')
                  setContent('')
                  setSelectedSong(null)
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Song Selection */}
                {!editingNewsletter && (
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
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {showSongDropdown && filteredSongs.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredSongs.map((song) => (
                          <button
                            key={song.id}
                            onClick={() => handleSongSelect(song)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition text-left"
                          >
                            {song.coverImage ? (
                              <img src={song.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
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
                      <div className="mt-3 flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                        {selectedSong.coverImage ? (
                          <img src={selectedSong.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FiMusic className="w-5 h-5 text-purple-500" />
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
                            setSubject('')
                            setContent('')
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Newsletter subject..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Preview */}
                {content && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preview</label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <iframe
                        srcDoc={content}
                        className="w-full h-96 border-0"
                        title="Newsletter Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !content}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !content || subscriberStats.active === 0}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {saving ? 'Sending...' : `Send to ${subscriberStats.active} Subscribers`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && editingNewsletter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Newsletter Preview</h3>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setEditingNewsletter(null)
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <iframe
                srcDoc={content}
                className="w-full h-[600px] border-0"
                title="Newsletter Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Modal */}
      {showSubscribers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Subscribers</h3>
                <p className="text-sm text-slate-500">
                  {subscriberStats.active} active, {subscriberStats.unsubscribed} unsubscribed
                </p>
              </div>
              <button
                onClick={() => setShowSubscribers(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              {subscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No subscribers yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-800">{subscriber.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            subscriber.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {subscriber.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(subscriber.subscribedAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove subscriber"
                      >
                        <FiUserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Newsletter?</h3>
            <p className="text-slate-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
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
