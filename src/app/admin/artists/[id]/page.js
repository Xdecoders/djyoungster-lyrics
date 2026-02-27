'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiSave, FiArrowLeft, FiUser, FiGlobe, FiImage, FiUpload, FiLink, FiZap } from 'react-icons/fi'

export default function EditArtist() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [imageMode, setImageMode] = useState('url') // 'url' or 'upload'
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    imageUrl: '',
    country: '',
    metaTitle: '',
    metaDescription: ''
  })
  const [errors, setErrors] = useState({})
  const [generatingMeta, setGeneratingMeta] = useState(false)

  const handleGenerateMeta = async () => {
    if (!formData.name.trim()) {
      alert('Artist name is required')
      return
    }
    setGeneratingMeta(true)
    try {
      const res = await fetch('/api/admin/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'artist', name: formData.name, bio: formData.bio })
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

  useEffect(() => {
    if (!params.id) return // Wait for params to be available

    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchArtist()
  }, [params.id])

  const fetchArtist = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/artists/${params.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) {
        alert('Artist not found')
        router.push('/admin/artists')
        return
      }
      const data = await res.json()
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        bio: data.bio || '',
        imageUrl: data.imageUrl || '',
        country: data.country || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || ''
      })
    } catch (error) {
      console.error('Error fetching artist:', error)
      alert('Failed to load artist')
    } finally {
      setFetching(false)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/artists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        alert('Artist updated successfully!')
        router.push('/admin/artists')
      } else {
        alert(data.message || 'Failed to update artist')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading artist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/artists" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FiUser className="w-5 h-5 text-emerald-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Edit Artist</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/artists"
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium text-sm hidden sm:block"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200 text-sm font-medium"
              >
                <FiSave className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="bg-emerald-50 p-1.5 rounded-lg">
                <FiUser className="w-4 h-4 text-emerald-600" />
              </div>
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  placeholder="Enter artist name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="auto-generated-slug"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-slate-400" />
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="e.g., India, USA"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4 text-slate-400" />
                  Artist Image
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
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-primary hover:file:bg-emerald-100"
                  />
                )}

                {formData.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Write about the artist..."
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">SEO Settings</h2>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder={`${formData.name} Songs Lyrics with English Translation - DJYoungster`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  placeholder="Brief description for search engines..."
                />
                {formData.metaDescription && (
                  <p className="text-xs text-slate-400 mt-1">{formData.metaDescription.length} characters</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
