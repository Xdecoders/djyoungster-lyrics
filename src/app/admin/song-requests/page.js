'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEye,
  FiInbox,
  FiMail,
  FiMusic,
  FiSave,
  FiTrash2,
  FiUser,
  FiX,
  FiXCircle,
  FiCheckCircle,
  FiYoutube,
  FiExternalLink
} from 'react-icons/fi'
import { FaSpotify } from 'react-icons/fa6'

export default function SongRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [counts, setCounts] = useState({ pending: 0, reviewed: 0, completed: 0, rejected: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingNotes, setEditingNotes] = useState({})

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const url = filter ? `/api/admin/song-requests?status=${filter}` : '/api/admin/song-requests'
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setRequests(data.requests || [])
      setCounts(data.counts || { pending: 0, reviewed: 0, completed: 0, rejected: 0, total: 0 })
    } catch (error) {
      console.error('Error fetching song requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/song-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error updating song request:', error)
    }
  }

  const saveNotes = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/song-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ adminNotes: editingNotes[id] || '' })
      })
      if (res.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/song-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setDeleteConfirm(null)
        fetchRequests()
      }
    } catch (error) {
      console.error('Error deleting song request:', error)
    }
  }

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      const req = requests.find(r => r.id === id)
      if (req && !(id in editingNotes)) {
        setEditingNotes(prev => ({ ...prev, [id]: req.adminNotes || '' }))
      }
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      reviewed: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700'
    }
    return styles[status] || 'bg-slate-100 text-slate-700'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <FiInbox className="w-5 h-5 text-amber-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Song Requests</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats / Filter Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <button
            onClick={() => setFilter('')}
            className={`p-4 rounded-xl border transition ${
              filter === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className={`text-sm ${filter === '' ? 'text-slate-300' : 'text-slate-500'}`}>All</p>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`p-4 rounded-xl border transition ${
              filter === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.pending}</p>
            <p className={`text-sm ${filter === 'pending' ? 'text-amber-100' : 'text-slate-500'}`}>Pending</p>
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`p-4 rounded-xl border transition ${
              filter === 'reviewed' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.reviewed}</p>
            <p className={`text-sm ${filter === 'reviewed' ? 'text-blue-100' : 'text-slate-500'}`}>Reviewed</p>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`p-4 rounded-xl border transition ${
              filter === 'completed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.completed}</p>
            <p className={`text-sm ${filter === 'completed' ? 'text-emerald-100' : 'text-slate-500'}`}>Completed</p>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`p-4 rounded-xl border transition ${
              filter === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-slate-200 hover:border-red-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.rejected}</p>
            <p className={`text-sm ${filter === 'rejected' ? 'text-red-100' : 'text-slate-500'}`}>Rejected</p>
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-slate-500">Loading song requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-500">
                {filter ? `No ${filter} song requests` : 'No song requests yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="hover:bg-slate-50/50 transition">
                  {/* Summary Row */}
                  <div
                    className="p-4 sm:p-5 cursor-pointer"
                    onClick={() => toggleExpand(req.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiMusic className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(req.status)}`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="font-medium text-slate-800 truncate">{req.songName}</p>
                          <p className="text-sm text-slate-500 truncate">
                            <FiUser className="w-3 h-3 inline mr-1" />{req.artistName}
                            <span className="mx-2 text-slate-300">|</span>
                            <FiMail className="w-3 h-3 inline mr-1" />{req.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400">{formatDate(req.createdAt)}</span>
                        {expandedId === req.id ? (
                          <FiChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <FiChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === req.id && (
                    <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Details */}
                        <div className="space-y-3">
                          {req.lyrics && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Lyrics</p>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto">{req.lyrics}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {req.youtubeUrl && (
                              <a
                                href={req.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FiYoutube className="w-4 h-4" /> YouTube <FiExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {req.spotifyUrl && (
                              <a
                                href={req.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaSpotify className="w-4 h-4" /> Spotify <FiExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            <p>IP: {req.ipAddress || 'N/A'}</p>
                            <p>Newsletter: {req.newsletterOptIn ? 'Yes' : 'No'}</p>
                          </div>
                        </div>

                        {/* Right: Admin Notes + Actions */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Admin Notes</p>
                            <textarea
                              value={editingNotes[req.id] ?? req.adminNotes ?? ''}
                              onChange={(e) => setEditingNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                              placeholder="Add notes about this request..."
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); saveNotes(req.id) }}
                              className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                            >
                              <FiSave className="w-3 h-3" /> Save Notes
                            </button>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Actions</p>
                            <div className="flex flex-wrap gap-2">
                              {req.status === 'pending' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'reviewed') }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                                >
                                  <FiEye className="w-4 h-4" /> Mark Reviewed
                                </button>
                              )}
                              {req.status !== 'completed' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'completed') }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
                                >
                                  <FiCheck className="w-4 h-4" /> Mark Completed
                                </button>
                              )}
                              {req.status !== 'rejected' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'rejected') }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition"
                                >
                                  <FiXCircle className="w-4 h-4" /> Reject
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(req.id) }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                              >
                                <FiTrash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Song Request?</h3>
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
