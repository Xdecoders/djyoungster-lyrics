'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMessageSquare, FiSearch, FiTrash2, FiCheck, FiX, FiClock, FiMusic, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const ITEMS_PER_PAGE = 20

export default function CommentsManagement() {
  const router = useRouter()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all') // all, pending, approved
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingCount, setPendingCount] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [selectedComments, setSelectedComments] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchComments()
  }, [statusFilter])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/comments?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setComments(data.comments)
      setPendingCount(data.pendingCount)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: !currentStatus })
      })

      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        setComments(comments.filter(c => c.id !== id))
        setDeleteConfirm(null)
        setPendingCount(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) return

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedComments })
      })

      if (res.ok) {
        fetchComments()
        setSelectedComments([])
      }
    } catch (error) {
      console.error('Error deleting comments:', error)
    }
  }

  const toggleSelectComment = (id) => {
    setSelectedComments(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedComments.length === paginatedComments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(paginatedComments.map(c => c.id))
    }
  }

  // Filter comments by search term
  const filteredComments = comments.filter(comment =>
    comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.song?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedComments = filteredComments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Time ago formatter
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit)
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
      }
    }
    return 'just now'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <FiMessageSquare className="w-8 h-8 text-primary" />
                Comments Management
              </h1>
              <p className="text-slate-500 mt-1">Moderate and manage user comments</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium">
              {pendingCount} Pending Approval
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => { setStatusFilter('all'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({comments.length})
              </button>
              <button
                onClick={() => { setStatusFilter('pending'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'pending'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => { setStatusFilter('approved'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search comments, songs, or names..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedComments.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">{selectedComments.length} selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedComments([])}
                className="px-4 py-1.5 bg-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-300 transition"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {paginatedComments.length === 0 ? (
            <div className="text-center py-16">
              <FiMessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No comments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedComments.length === paginatedComments.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Song</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Comment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedComments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedComments.includes(comment.id)}
                          onChange={() => toggleSelectComment(comment.id)}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/song/${comment.song?.slug}`}
                          target="_blank"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <FiMusic className="w-4 h-4" />
                          <span className="text-sm font-medium max-w-[200px] truncate">
                            {comment.song?.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-700">{comment.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600 max-w-md line-clamp-2">
                          {comment.comment}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {comment.approved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <FiCheck className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            <FiClock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(comment.id, comment.approved)}
                            className={`p-2 rounded-lg transition ${
                              comment.approved
                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={comment.approved ? 'Reject' : 'Approve'}
                          >
                            {comment.approved ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                          </button>
                          {deleteConfirm === comment.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-600 text-xs rounded hover:bg-slate-300 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(comment.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredComments.length)} of {filteredComments.length} comments
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
