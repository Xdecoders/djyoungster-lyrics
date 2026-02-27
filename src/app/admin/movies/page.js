'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiFilm, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiCheck, FiMusic, FiCalendar, FiX, FiChevronLeft, FiChevronRight, FiImage, FiUpload, FiLink, FiEye, FiSearch, FiZap } from 'react-icons/fi'

const ITEMS_PER_PAGE = 20

export default function MoviesPage() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [imageMode, setImageMode] = useState('url')
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    director: '',
    description: '',
    cast: '',
    producer: '',
    musicDirector: '',
    writer: '',
    genre: '',
    language: '',
    posterUrl: '',
    metaTitle: '',
    metaDescription: ''
  })
  const [generatingMeta, setGeneratingMeta] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/movies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setMovies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, posterUrl: data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      year: '',
      director: '',
      description: '',
      cast: '',
      producer: '',
      musicDirector: '',
      writer: '',
      genre: '',
      language: '',
      posterUrl: '',
      metaTitle: '',
      metaDescription: ''
    })
    setImageMode('url')
    setShowForm(false)
    setEditingId(null)
  }

  const handleGenerateMeta = async () => {
    if (!formData.title.trim()) {
      alert('Enter the movie title first')
      return
    }
    setGeneratingMeta(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          type: 'movie',
          title: formData.title,
          year: formData.year,
          language: formData.language,
          director: formData.director,
          cast: formData.cast,
          musicDirector: formData.musicDirector,
          genre: formData.genre
        })
      })
      const data = await res.json()
      if (data.metaDescription) {
        setFormData(prev => ({ ...prev, metaDescription: data.metaDescription }))
      }
    } catch (error) {
      console.error('Generate meta error:', error)
    } finally {
      setGeneratingMeta(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingId
        ? `/api/admin/movies/${editingId}`
        : '/api/admin/movies'

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchMovies()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving movie:', error)
    }
  }

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      year: movie.year || '',
      director: movie.director || '',
      description: movie.description || '',
      cast: movie.cast || '',
      producer: movie.producer || '',
      musicDirector: movie.musicDirector || '',
      writer: movie.writer || '',
      genre: movie.genre || '',
      language: movie.language || '',
      posterUrl: movie.posterUrl || '',
      metaTitle: movie.metaTitle || '',
      metaDescription: movie.metaDescription || ''
    })
    setEditingId(movie.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/movies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setMovies(movies.filter(movie => movie.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
    }
  }

  // Filter and pagination logic
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.language?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
                <div className="bg-rose-100 p-2 rounded-lg">
                  <FiFilm className="w-5 h-5 text-rose-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Manage Movies</h1>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Movie</span>
            </button>
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
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <button onClick={resetForm} aria-label="Close form" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Movie title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Director</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Director name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Producer</label>
                  <input
                    type="text"
                    name="producer"
                    value={formData.producer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Producer name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Music Director</label>
                  <input
                    type="text"
                    name="musicDirector"
                    value={formData.musicDirector}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Music director name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Writer</label>
                  <input
                    type="text"
                    name="writer"
                    value={formData.writer}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Screenplay/Story writer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Drama, Action, Romance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="Hindi, Punjabi, English"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cast (Starring)</label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4 text-slate-400" />
                  Poster Image
                </label>

                {/* Toggle between URL and Upload */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      imageMode === 'url'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FiLink className="w-4 h-4" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      imageMode === 'upload'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <input
                    type="text"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="https://example.com/poster.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-primary hover:file:bg-emerald-100"
                  />
                )}

                {formData.posterUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.posterUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Movie description (optional - will be auto-generated if empty)"
                />
              </div>

              {/* SEO Settings */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-700">SEO Settings</p>
                  <button
                    type="button"
                    onClick={handleGenerateMeta}
                    disabled={generatingMeta}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-emerald-50 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50"
                  >
                    <FiZap className="w-3.5 h-3.5" />
                    {generatingMeta ? 'Generating...' : 'Auto Generate'}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                      placeholder={formData.title ? `${formData.title}${formData.year ? ` (${formData.year})` : ''} Songs Lyrics - DJYoungster` : 'SEO optimized title'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Meta Description</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none text-sm"
                      placeholder="Brief description for search engines..."
                    />
                    {formData.metaDescription && (
                      <p className="text-xs text-slate-400 mt-1">{formData.metaDescription.length} characters</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 font-medium text-sm"
                >
                  <FiCheck className="w-4 h-4" />
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Movies Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiFilm className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-slate-500">
              {searchTerm ? 'No movies found matching your search.' : 'No movies yet. Add your first movie!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedMovies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={movie.title} width={400} height={192} className="w-full h-36 sm:h-48 object-cover" unoptimized />
                ) : (
                  <div className="w-full h-36 sm:h-48 bg-rose-50 flex items-center justify-center">
                    <FiFilm className="w-12 h-12 text-rose-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{movie.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{movie.director ? `Dir: ${movie.director}` : movie.language || '\u00A0'}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {movie.year && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {movie.year}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiMusic className="w-3 h-3" />
                      {movie._count?.songs || 0}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
                    <Link
                      href={`/movie/${movie.slug}`}
                      target="_blank"
                      aria-label="View movie"
                      className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View movie page"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(movie)}
                      aria-label="Edit movie"
                      className="p-2 text-slate-500 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(movie.id)}
                      aria-label="Delete movie"
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
            Showing {filteredMovies.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredMovies.length)} of {filteredMovies.length} movies
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
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
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Movie?</h3>
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
