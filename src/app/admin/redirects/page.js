'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiX, FiCheck, FiCornerUpRight, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'

const ITEMS_PER_PAGE = 25

export default function RedirectsPage() {
  const router = useRouter()
  const [redirects, setRedirects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    oldUrl: '',
    newUrl: '',
    type: '301',
    isActive: true,
    note: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchRedirects()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchRedirects = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/redirects', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setRedirects(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching redirects:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ oldUrl: '', newUrl: '', type: '301', isActive: true, note: '' })
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingId
        ? `/api/admin/redirects/${editingId}`
        : '/api/admin/redirects'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        await fetchRedirects()
        resetForm()
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to save redirect.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (redirect) => {
    setFormData({
      oldUrl: redirect.oldUrl,
      newUrl: redirect.newUrl,
      type: String(redirect.type),
      isActive: redirect.isActive,
      note: redirect.note || ''
    })
    setEditingId(redirect.id)
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleToggle = async (redirect) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/redirects/${redirect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !redirect.isActive })
      })
      if (res.ok) {
        setRedirects(prev =>
          prev.map(r => r.id === redirect.id ? { ...r, isActive: !r.isActive } : r)
        )
      }
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setRedirects(prev => prev.filter(r => r.id !== id))
        setDeleteConfirm(null)
      }
    } catch {}
  }

  const filteredRedirects = redirects.filter(r =>
    r.oldUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.newUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.note || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRedirects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filteredRedirects.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const activeCount = redirects.filter(r => r.isActive).length

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
                <div className="bg-violet-100 p-2 rounded-lg">
                  <FiCornerUpRight className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">URL Redirects</h1>
                  {!loading && (
                    <p className="text-xs text-slate-400 hidden sm:block">
                      {activeCount} active · {redirects.length} total
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Redirect</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Redirect' : 'Add New Redirect'}
              </h2>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    From (Old URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="oldUrl"
                    value={formData.oldUrl}
                    onChange={handleChange}
                    placeholder="/old-page-slug"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Path on your site, e.g. /old-song-name</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    To (New URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="newUrl"
                    value={formData.newUrl}
                    onChange={handleChange}
                    placeholder="/song/new-slug or https://..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Path or full URL to redirect to</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Redirect Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-sm"
                  >
                    <option value="301">301 — Permanent (SEO)</option>
                    <option value="302">302 — Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Why this redirect exists"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative" onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}>
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-slate-200'}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 font-medium text-sm disabled:opacity-60"
                >
                  <FiCheck className="w-4 h-4" />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by URL or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-slate-500">Loading redirects...</p>
          </div>
        ) : filteredRedirects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="bg-violet-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiCornerUpRight className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-slate-500 font-medium mb-1">
              {searchTerm ? 'No redirects found matching your search.' : 'No redirects yet.'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-slate-400">Add your first redirect to forward old URLs to new ones.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">From</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">To</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Active</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((redirect) => (
                    <tr key={redirect.id} className="hover:bg-slate-50/60 transition group">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-sm text-slate-800 break-all">{redirect.oldUrl}</div>
                        {redirect.note && (
                          <div className="text-xs text-slate-400 mt-0.5">{redirect.note}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-sm text-slate-600 break-all">{redirect.newUrl}</div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          redirect.type === 301
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {redirect.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggle(redirect)}
                          title={redirect.isActive ? 'Click to deactivate' : 'Click to activate'}
                          className="relative inline-flex items-center"
                        >
                          <div className={`w-10 h-5 rounded-full transition-colors ${redirect.isActive ? 'bg-primary' : 'bg-slate-200'}`} />
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${redirect.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(redirect)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(redirect.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredRedirects.length)} of {filteredRedirects.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-slate-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                            currentPage === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && filteredRedirects.length > 0 && totalPages <= 1 && (
          <div className="mt-4 text-sm text-slate-500">
            {filteredRedirects.length} redirect{filteredRedirects.length !== 1 ? 's' : ''}
          </div>
        )}

      </main>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Redirect?</h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              Visitors going to{' '}
              <span className="font-mono text-slate-700">
                {redirects.find(r => r.id === deleteConfirm)?.oldUrl}
              </span>
              {' '}will no longer be redirected.
            </p>
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
