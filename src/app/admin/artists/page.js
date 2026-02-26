'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiUser, FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowLeft, FiMusic, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi'

const ITEMS_PER_PAGE = 20

export default function ArtistsList() {
  const router = useRouter()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/artists', { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) return
      const data = await res.json()
      setArtists(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/artists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setArtists(artists.filter(artist => artist.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting artist:', error)
    }
  }

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredArtists.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedArtists = filteredArtists.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FiUser className="w-5 h-5 text-emerald-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">All Artists</h1>
              </div>
            </div>
            <Link
              href="/admin/artists/add"
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Artist</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Artists Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500">Loading artists...</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-500">
              {searchTerm ? 'No artists found matching your search.' : 'No artists yet. Add your first artist!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedArtists.map((artist) => (
              <div key={artist.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                {artist.imageUrl ? (
                  <Image src={artist.imageUrl} alt={artist.name} width={400} height={192} className="w-full h-36 sm:h-48 object-cover" unoptimized />
                ) : (
                  <div className="w-full h-36 sm:h-48 bg-emerald-50 flex items-center justify-center">
                    <FiUser className="w-12 h-12 text-emerald-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{artist.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{artist.country || '\u00A0'}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <FiMusic className="w-3 h-3" />
                      {artist._count?.songs || 0}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={`/artist/${artist.slug}`}
                      target="_blank"
                      aria-label="View artist"
                      className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View artist page"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/artists/${artist.id}`}
                      aria-label="Edit artist"
                      className="p-2 text-slate-500 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(artist.id)}
                      aria-label="Delete artist"
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredArtists.length)} of {filteredArtists.length} artists
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
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Artist?</h3>
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
