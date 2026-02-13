'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiEdit2,
  FiEye,
  FiFilter,
  FiMusic,
  FiTrash2,
  FiX,
  FiCheckCircle
} from 'react-icons/fi'

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [counts, setCounts] = useState({ pending: 0, reviewed: 0, resolved: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const url = filter ? `/api/admin/reports?status=${filter}` : '/api/admin/reports'
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setReports(data.reports || [])
      setCounts(data.counts || { pending: 0, reviewed: 0, resolved: 0, total: 0 })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id))
        setDeleteConfirm(null)
        fetchReports()
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const getTypeLabel = (type) => {
    const types = {
      lyrics: 'Incorrect Lyrics',
      spelling: 'Spelling/Grammar',
      artist: 'Wrong Artist Info',
      album: 'Wrong Album Info',
      credits: 'Wrong Credits',
      other: 'Other'
    }
    return types[type] || type
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      reviewed: 'bg-blue-100 text-blue-700',
      resolved: 'bg-emerald-100 text-emerald-700'
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
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Reports</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setFilter('')}
            className={`p-4 rounded-xl border transition ${
              filter === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className={`text-sm ${filter === '' ? 'text-slate-300' : 'text-slate-500'}`}>Total</p>
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
            onClick={() => setFilter('resolved')}
            className={`p-4 rounded-xl border transition ${
              filter === 'resolved' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <p className="text-2xl font-bold">{counts.resolved}</p>
            <p className={`text-sm ${filter === 'resolved' ? 'text-emerald-100' : 'text-slate-500'}`}>Resolved</p>
          </button>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-slate-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-500">
                {filter ? `No ${filter} reports` : 'No reports yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report.id} className="p-4 sm:p-5 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Song Info */}
                    <div className="flex items-start gap-3 flex-1">
                      {report.song?.coverImage ? (
                        <img
                          src={report.song.coverImage}
                          alt={report.song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FiMusic className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                            {getTypeLabel(report.type)}
                          </span>
                        </div>
                        {report.song ? (
                          <Link
                            href={`/song/${report.song.slug}`}
                            className="font-medium text-slate-800 hover:text-primary transition"
                            target="_blank"
                          >
                            {report.song.title}
                          </Link>
                        ) : (
                          <p className="font-medium text-slate-500">Song deleted</p>
                        )}
                        {report.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{report.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{formatDate(report.createdAt)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(report.id, 'reviewed')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Mark as Reviewed"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      )}
                      {report.status !== 'resolved' && (
                        <button
                          onClick={() => updateStatus(report.id, 'resolved')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Mark as Resolved"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      {report.song && (
                        <Link
                          href={`/admin/songs/${report.song.id}`}
                          className="p-2 text-primary hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Song"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(report.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete Report"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Report?</h3>
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
