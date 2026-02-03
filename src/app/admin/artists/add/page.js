'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiSave, FiArrowLeft, FiUser, FiGlobe, FiImage } from 'react-icons/fi'

export default function AddArtist() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

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
      const res = await fetch('/api/admin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        alert('Artist added successfully!')
        router.push('/admin/artists')
      } else {
        alert(data.message || 'Failed to add artist')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
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
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Add New Artist</h1>
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
                {loading ? 'Saving...' : 'Save'}
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

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-4 h-4 text-slate-400" />
                  Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="https://example.com/image.jpg"
                />
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
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">SEO Settings</h2>
            <p className="text-sm text-slate-500 mb-4">Leave empty to use auto-generated defaults shown below.</p>

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
                  placeholder={formData.name ? `${formData.name} Songs Lyrics with English Translation - DJYoungster` : 'SEO optimized title'}
                />
                {!formData.metaTitle && formData.name && (
                  <p className="text-xs text-slate-400 mt-1">Default: {formData.name} Songs Lyrics with English Translation - DJYoungster</p>
                )}
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
                  placeholder={formData.name ? `${formData.name} through his song lyrics and meanings. Djyoungster provides ${formData.name} lyrics in English Translation, Hindi and Punjabi language variations.` : 'Brief description for search engines...'}
                />
                {!formData.metaDescription && formData.name && (
                  <p className="text-xs text-slate-400 mt-1">Default: {formData.name} through his song lyrics and meanings. Djyoungster provides {formData.name} lyrics in English Translation, Hindi and Punjabi language variations.</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
