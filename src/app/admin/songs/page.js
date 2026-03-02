'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMusic, FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowLeft, FiCheck, FiX, FiEye, FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown, FiBookOpen } from 'react-icons/fi'

const ITEMS_PER_PAGE = 10

export default function SongsList() {
  const router = useRouter()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt') // title, views, status, createdAt
  const [sortOrder, setSortOrder] = useState('desc') // asc or desc
  const [statusFilter, setStatusFilter] = useState('all') // all, published, draft

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/songs', { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) return
      const data = await res.json()
      setSongs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/songs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setSongs(songs.filter(song => song.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting song:', error)
    }
  }

  const createStory = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/songs/${id}/web-story`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setSongs(songs.map(s => s.id === id ? { ...s, hasWebStory: true } : s))
      }
    } catch (error) {
      console.error('Error creating web story:', error)
    }
  }

  // Sort handler
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to descending
      setSortBy(column)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page
  }

  // Counts for filter pills
  const publishedCount = songs.filter(s => s.status === 'published').length
  const draftCount = songs.filter(s => s.status === 'draft').length

  // Filter songs by search term and status
  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artists?.some(a => a.artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || song.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort filtered songs
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'views':
        aValue = a.views || 0
        bValue = b.views || 0
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedSongs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSongs = sortedSongs.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Sort indicator component
  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? (
      <FiArrowUp className="w-3.5 h-3.5 inline-block ml-1" />
    ) : (
      <FiArrowDown className="w-3.5 h-3.5 inline-block ml-1" />
    )
  }

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

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
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiMusic className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">All Songs</h1>
              </div>
            </div>
            <Link
              href="/admin/songs/add"
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Song</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar & Status Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search songs by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 mt-3">
            {[
              { key: 'all', label: 'All', count: songs.length },
              { key: 'published', label: 'Published', count: publishedCount },
              { key: 'draft', label: 'Draft', count: draftCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  statusFilter === key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Songs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p>Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-500">
                {searchTerm ? 'No songs found matching your search.' : 'No songs yet. Add your first song!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th
                      onClick={() => handleSort('title')}
                      className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      Song <SortIcon column="title" />
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Artists</th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Album</th>
                    <th
                      onClick={() => handleSort('status')}
                      className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      Status <SortIcon column="status" />
                    </th>
                    <th className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Verified</th>
                    <th
                      onClick={() => handleSort('views')}
                      className="text-left px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      Views <SortIcon column="views" />
                    </th>
                    <th className="text-right px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSongs.map((song) => (
                    <tr key={song.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {song.coverImage ? (
                            <Image src={song.coverImage} alt={song.title} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized />
                          ) : (
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <FiMusic className="text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800">{song.title}</p>
                            <p className="text-xs text-slate-500 md:hidden">{song.artists?.map(a => a.artist.name).join(', ') || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                        {song.artists?.map(a => a.artist.name).join(', ') || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                        {song.album?.title || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          song.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {song.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        {song.verified ? (
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <FiCheck className="w-4 h-4 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                            <FiX className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <FiEye className="w-3.5 h-3.5 text-slate-400" />
                          {song.views?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/song/${song.slug}`}
                            target="_blank"
                            className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Preview"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          {song.hasWebStory ? (
                            <Link
                              href={`/web-stories/${song.slug}`}
                              target="_blank"
                              className="p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="View Story"
                            >
                              <FiBookOpen className="w-4 h-4" />
                            </Link>
                          ) : (
                            <button
                              onClick={() => createStory(song.id)}
                              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition"
                              title="Create Story"
                            >
                              <FiBookOpen className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            href={`/admin/songs/${song.id}`}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(song.id)}
                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedSongs.length)} of {sortedSongs.length} songs
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={`p-2 rounded-lg transition ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={`p-2 rounded-lg transition ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
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
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Song?</h3>
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
