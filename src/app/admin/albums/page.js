'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiDisc, FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowLeft, FiMusic, FiCalendar, FiEye } from 'react-icons/fi'

export default function AlbumsList() {
  const router = useRouter()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/albums', { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) return
      const data = await res.json()
      setAlbums(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/albums/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setAlbums(albums.filter(album => album.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting album:', error)
    }
  }

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.artist?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FiDisc className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">All Albums</h1>
              </div>
            </div>
            <Link
              href="/admin/albums/add"
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Album</span>
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
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500">Loading albums...</p>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiDisc className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-500">
              {searchTerm ? 'No albums found matching your search.' : 'No albums yet. Add your first album!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredAlbums.map((album) => (
              <div key={album.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                {album.coverImage ? (
                  <Image src={album.coverImage} alt={album.title} width={400} height={192} className="w-full h-36 sm:h-48 object-cover" unoptimized />
                ) : (
                  <div className="w-full h-36 sm:h-48 bg-emerald-50 flex items-center justify-center">
                    <FiDisc className="w-12 h-12 text-emerald-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{album.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{album.artist?.name || 'Unknown Artist'}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {album.releaseDate && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {new Date(album.releaseDate).getFullYear()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiMusic className="w-3 h-3" />
                      {album._count?.songs || 0}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={`/album/${album.slug}`}
                      target="_blank"
                      aria-label="View album"
                      className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View album page"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/albums/${album.id}`}
                      aria-label="Edit album"
                      className="p-2 text-slate-500 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(album.id)}
                      aria-label="Delete album"
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

        {/* Stats */}
        <div className="mt-4 text-sm text-slate-500">
          Showing {filteredAlbums.length} of {albums.length} albums
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Album?</h3>
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
