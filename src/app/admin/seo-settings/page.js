'use client'

import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiSave, FiCheck, FiHome, FiMusic, FiUser, FiDisc, FiFilm, FiTag, FiGlobe, FiImage, FiUpload, FiX } from 'react-icons/fi'

const PAGE_ICONS = {
  homepage: FiHome,
  songs: FiMusic,
  artists: FiUser,
  albums: FiDisc,
  movies: FiFilm,
  genres: FiTag,
}

const PAGE_COLORS = {
  homepage: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  songs: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  artists: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
  albums: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  movies: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
  genres: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
}

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})
  const [editedSettings, setEditedSettings] = useState({})
  const [uploadingPageOgImage, setUploadingPageOgImage] = useState({})

  // Favicon states
  const [faviconUrl, setFaviconUrl] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [globalSaved, setGlobalSaved] = useState(false)
  const faviconInputRef = useRef(null)

  // OG Image states
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [ogImagePreview, setOgImagePreview] = useState('')
  const [uploadingOgImage, setUploadingOgImage] = useState(false)
  const ogImageInputRef = useRef(null)

  // Hero section states
  const [heroHeading, setHeroHeading] = useState('')
  const [heroDescription, setHeroDescription] = useState('')

  useEffect(() => {
    fetchSettings()
    fetchGlobalSettings()
  }, [])

  const fetchGlobalSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/site-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.favicon) {
          setFaviconUrl(data.favicon)
          setFaviconPreview(data.favicon)
        }
        if (data.ogImage) {
          setOgImageUrl(data.ogImage)
          setOgImagePreview(data.ogImage)
        }
        if (data.heroHeading) setHeroHeading(data.heroHeading)
        if (data.heroDescription) setHeroDescription(data.heroDescription)
      }
    } catch (error) {
      console.error('Error fetching global settings:', error)
    }
  }

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/x-icon', 'image/ico', 'image/svg+xml', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, ICO, SVG, or JPEG file')
      return
    }

    // Validate size (max 1MB for favicon)
    if (file.size > 1024 * 1024) {
      alert('Favicon should be less than 1MB')
      return
    }

    setUploadingFavicon(true)
    try {
      const token = localStorage.getItem('adminToken')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setFaviconUrl(data.url)
        setFaviconPreview(data.url)
      } else {
        alert(data.message || 'Failed to upload favicon')
      }
    } catch (error) {
      console.error('Error uploading favicon:', error)
      alert('Error uploading favicon')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleOgImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPEG, or WebP file')
      return
    }

    // Validate size (max 5MB for OG image)
    if (file.size > 5 * 1024 * 1024) {
      alert('OG Image should be less than 5MB')
      return
    }

    setUploadingOgImage(true)
    try {
      const token = localStorage.getItem('adminToken')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setOgImageUrl(data.url)
        setOgImagePreview(data.url)
      } else {
        alert(data.message || 'Failed to upload OG image')
      }
    } catch (error) {
      console.error('Error uploading OG image:', error)
      alert('Error uploading OG image')
    } finally {
      setUploadingOgImage(false)
    }
  }

  const clearOgImage = () => {
    setOgImageUrl('')
    setOgImagePreview('')
    if (ogImageInputRef.current) {
      ogImageInputRef.current.value = ''
    }
  }

  const handleSaveGlobal = async () => {
    setSavingGlobal(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          favicon: faviconUrl,
          ogImage: ogImageUrl,
          heroHeading: heroHeading,
          heroDescription: heroDescription
        })
      })

      if (res.ok) {
        setGlobalSaved(true)
        setTimeout(() => setGlobalSaved(false), 3000)
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSavingGlobal(false)
    }
  }

  const clearFavicon = () => {
    setFaviconUrl('')
    setFaviconPreview('')
    if (faviconInputRef.current) {
      faviconInputRef.current.value = ''
    }
  }

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/seo-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setSettings(data)

      // Initialize edited settings
      const edited = {}
      data.forEach(s => {
        edited[s.pageKey] = { ...s }
      })
      setEditedSettings(edited)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (pageKey, field, value) => {
    setEditedSettings(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value
      }
    }))
    // Clear saved status when editing
    setSaved(prev => ({ ...prev, [pageKey]: false }))
  }

  const handlePageOgImageUpload = async (e, pageKey) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPEG, or WebP file')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('OG Image should be less than 5MB')
      return
    }

    setUploadingPageOgImage(prev => ({ ...prev, [pageKey]: true }))
    try {
      const token = localStorage.getItem('adminToken')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        handleChange(pageKey, 'ogImage', data.url)
      } else {
        alert(data.message || 'Failed to upload OG image')
      }
    } catch (error) {
      console.error('Error uploading OG image:', error)
      alert('Error uploading OG image')
    } finally {
      setUploadingPageOgImage(prev => ({ ...prev, [pageKey]: false }))
    }
  }

  const clearPageOgImage = (pageKey) => {
    handleChange(pageKey, 'ogImage', '')
  }

  const handleSave = async (pageKey) => {
    setSaving(prev => ({ ...prev, [pageKey]: true }))

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/seo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editedSettings[pageKey])
      })

      if (res.ok) {
        setSaved(prev => ({ ...prev, [pageKey]: true }))
        setTimeout(() => {
          setSaved(prev => ({ ...prev, [pageKey]: false }))
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(prev => ({ ...prev, [pageKey]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FiSearch className="w-6 h-6 text-primary" />
            </div>
            SEO Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage meta titles and descriptions for all pages</p>
        </div>
      </div>

      {/* Global Site Settings - Favicon & Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Global Site Settings</h2>
              <p className="text-xs text-slate-400">Favicon, hero section, and site-wide settings</p>
            </div>
          </div>
          <button
            onClick={handleSaveGlobal}
            disabled={savingGlobal}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              globalSaved
                ? 'bg-green-100 text-green-600'
                : 'bg-primary text-white hover:bg-emerald-600'
            }`}
          >
            {savingGlobal ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : globalSaved ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {globalSaved ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <FiImage className="inline w-4 h-4 mr-2" />
            Site Favicon
          </label>

          <div className="flex items-start gap-6">
            {/* Favicon Preview */}
            <div className="flex-shrink-0">
              {faviconPreview ? (
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={clearFavicon}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept=".png,.ico,.svg,.jpg,.jpeg"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  id="favicon-upload"
                />
                <label
                  htmlFor="favicon-upload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition ${
                    uploadingFavicon
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {uploadingFavicon ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiUpload className="w-4 h-4" />
                  )}
                  {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                </label>
              </div>

              <p className="text-xs text-slate-400">
                Recommended: 32x32 or 180x180 PNG. Supports PNG, ICO, SVG, JPEG. Max 1MB.
              </p>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Or enter favicon URL</label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => {
                    setFaviconUrl(e.target.value)
                    setFaviconPreview(e.target.value)
                  }}
                  placeholder="https://example.com/favicon.png"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-6"></div>

          {/* OG Image Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              <FiImage className="inline w-4 h-4 mr-2" />
              Default OG Image (Social Media Sharing)
            </label>
            <p className="text-xs text-slate-400">
              This image appears when your homepage is shared on social media (Facebook, Twitter, LinkedIn, etc.)
            </p>

            <div className="flex items-start gap-6">
              {/* OG Image Preview */}
              <div className="flex-shrink-0">
                {ogImagePreview ? (
                  <div className="relative">
                    <div className="w-40 h-24 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={ogImagePreview}
                        alt="OG Image preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={clearOgImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    <FiImage className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <input
                    ref={ogImageInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleOgImageUpload}
                    className="hidden"
                    id="og-image-upload"
                  />
                  <label
                    htmlFor="og-image-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer transition ${
                      uploadingOgImage
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {uploadingOgImage ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiUpload className="w-4 h-4" />
                    )}
                    {uploadingOgImage ? 'Uploading...' : 'Upload OG Image'}
                  </label>
                </div>

                <p className="text-xs text-slate-400">
                  Recommended: 1200x630 pixels. Supports PNG, JPEG, WebP. Max 5MB.
                </p>

                {/* URL Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Or enter OG image URL</label>
                  <input
                    type="text"
                    value={ogImageUrl}
                    onChange={(e) => {
                      setOgImageUrl(e.target.value)
                      setOgImagePreview(e.target.value)
                    }}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-6"></div>

          {/* Hero Section Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FiHome className="w-4 h-4" />
              Homepage Hero Section
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hero Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="Discover Your Favorite *Song Lyrics*"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-slate-400 mt-1">Wrap words in *asterisks* to highlight them in green gradient. E.g. Discover Your Favorite *Song Lyrics*</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hero Description</label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="Explore thousands of song lyrics from your favorite artists. Search, discover, and sing along!"
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">Subtitle text below the heading</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page-specific SEO Settings */}
      <div className="space-y-6">
        {settings.map((setting) => {
          const Icon = PAGE_ICONS[setting.pageKey] || FiSearch
          const colorClass = PAGE_COLORS[setting.pageKey] || 'bg-slate-100 text-slate-600'
          const edited = editedSettings[setting.pageKey] || {}

          return (
            <div key={setting.pageKey} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">{setting.pageTitle || setting.pageKey}</h2>
                    <p className="text-xs text-slate-400">/{setting.pageKey === 'homepage' ? '' : setting.pageKey}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSave(setting.pageKey)}
                  disabled={saving[setting.pageKey]}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    saved[setting.pageKey]
                      ? 'bg-green-100 text-green-600'
                      : 'bg-primary text-white hover:bg-emerald-600'
                  }`}
                >
                  {saving[setting.pageKey] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : saved[setting.pageKey] ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  {saved[setting.pageKey] ? 'Saved!' : 'Save'}
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={edited.metaTitle || ''}
                    onChange={(e) => handleChange(setting.pageKey, 'metaTitle', e.target.value)}
                    placeholder="Page title for search engines"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                  <textarea
                    value={edited.metaDescription || ''}
                    onChange={(e) => handleChange(setting.pageKey, 'metaDescription', e.target.value)}
                    placeholder="Description for search engine results"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Recommended: 150-160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Keywords</label>
                  <input
                    type="text"
                    value={edited.metaKeywords || ''}
                    onChange={(e) => handleChange(setting.pageKey, 'metaKeywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated keywords</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">OG Title (Social Media)</label>
                    <input
                      type="text"
                      value={edited.ogTitle || ''}
                      onChange={(e) => handleChange(setting.pageKey, 'ogTitle', e.target.value)}
                      placeholder="Title for social media sharing"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">OG Description</label>
                    <input
                      type="text"
                      value={edited.ogDescription || ''}
                      onChange={(e) => handleChange(setting.pageKey, 'ogDescription', e.target.value)}
                      placeholder="Description for social media"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* OG Image for this page */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    <FiImage className="inline w-4 h-4 mr-2" />
                    OG Image (Social Media Sharing)
                  </label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {edited.ogImage ? (
                        <div className="relative">
                          <div className="w-32 h-20 rounded-lg border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                            <img
                              src={edited.ogImage}
                              alt="OG Image preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => clearPageOgImage(setting.pageKey)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                          <FiImage className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Upload Section */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          onChange={(e) => handlePageOgImageUpload(e, setting.pageKey)}
                          className="hidden"
                          id={`og-image-${setting.pageKey}`}
                        />
                        <label
                          htmlFor={`og-image-${setting.pageKey}`}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition ${
                            uploadingPageOgImage[setting.pageKey]
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {uploadingPageOgImage[setting.pageKey] ? (
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiUpload className="w-3 h-3" />
                          )}
                          {uploadingPageOgImage[setting.pageKey] ? 'Uploading...' : 'Upload'}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={edited.ogImage || ''}
                        onChange={(e) => handleChange(setting.pageKey, 'ogImage', e.target.value)}
                        placeholder="Or enter image URL"
                        className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                      />
                      <p className="text-xs text-slate-400">1200x630px recommended. Falls back to global OG image if empty.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
