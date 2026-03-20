'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiEye, FiImage, FiSearch, FiX, FiUpload, FiZap, FiRefreshCw, FiPlus, FiCheck } from 'react-icons/fi'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function DBLinkField({ label, fieldId, fieldLabel, endpoint, labelKey = 'title', form, setForm }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  const search = async (val) => {
    if (!val.trim()) { setResults([]); return }
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    const res = await fetch(`/api/admin/${endpoint}?search=${encodeURIComponent(val)}&limit=8`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setResults(Array.isArray(data) ? data : data.songs || data.movies || data.artists || data.albums || [])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {form[fieldId] ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="text-sm text-emerald-800 flex-1">{form[fieldLabel]}</span>
          <button type="button" onClick={() => setForm(f => ({ ...f, [fieldId]: '', [fieldLabel]: '' }))} className="text-slate-400 hover:text-slate-600">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={q}
              onChange={e => { setQ(e.target.value); search(e.target.value) }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {results.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, [fieldId]: item.id, [fieldLabel]: item[labelKey] || item.name || item.title }))
                    setQ('')
                    setResults([])
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  {item[labelKey] || item.name || item.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminBlogAddPage() {
  return <BlogPostForm mode="add" />
}

export function BlogPostForm({ mode = 'add', initialData = null, postId = null }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [slugManual, setSlugManual] = useState(false)
  const [metaTitleManual, setMetaTitleManual] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', color: '#6b7280' })
  const [savingCat, setSavingCat] = useState(false)
  const [generatingCover, setGeneratingCover] = useState(false)

  const PRESET_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1DB954',
  ]

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    coverImage: '', ogImage: '', metaTitle: '', metaDescription: '',
    metaKeywords: '', author: 'Rahul Sharma', status: 'draft',
    isFeatured: false, blogCategoryId: '',
    relatedSongId: '', relatedSongLabel: '',
    relatedMovieId: '', relatedMovieLabel: '',
    relatedArtistId: '', relatedArtistLabel: '',
    relatedAlbumId: '', relatedAlbumLabel: '',
    tags: '',
  })

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchCategories()
    if (initialData) populateForm(initialData)
  }, [initialData])

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/blog/categories', { headers: authHeaders() })
    if (res.ok) setCategories(await res.json())
  }

  const handleAddCategory = async () => {
    if (!newCat.name.trim()) return
    setSavingCat(true)
    try {
      const slug = newCat.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newCat.name.trim(), slug, color: newCat.color }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories(prev => [...prev, created])
        setForm(f => ({ ...f, blogCategoryId: created.id }))
        setNewCat({ name: '', color: '#6b7280' })
        setShowNewCat(false)
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to create category')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSavingCat(false)
    }
  }

  const populateForm = (data) => {
    setForm({
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || '',
      ogImage: data.ogImage || '',
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      metaKeywords: data.metaKeywords || '',
      author: data.author || 'Rahul Sharma',
      status: data.status || 'draft',
      isFeatured: data.isFeatured || false,
      blogCategoryId: data.blogCategoryId || '',
      relatedSongId: data.relatedSongId || '',
      relatedSongLabel: data.relatedSong?.title || '',
      relatedMovieId: data.relatedMovieId || '',
      relatedMovieLabel: data.relatedMovie?.title || '',
      relatedArtistId: data.relatedArtistId || '',
      relatedArtistLabel: data.relatedArtist?.name || '',
      relatedAlbumId: data.relatedAlbumId || '',
      relatedAlbumLabel: data.relatedAlbum?.title || '',
      tags: data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags).join(', ') : data.tags.join(', ')) : '',
    })
    setSlugManual(true)
    if (data.metaTitle) setMetaTitleManual(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setForm(f => ({
      ...f,
      title,
      slug: slugManual ? f.slug : slugify(title),
      metaTitle: metaTitleManual ? f.metaTitle : (title ? `${title} | DJYoungster` : ''),
    }))
  }

  const handleContentChange = (html) => {
    setForm(f => ({ ...f, content: html }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, coverImage: data.url }))
      } else {
        const err = await res.json()
        alert(err.message || 'Upload failed')
      }
    } catch (err) {
      alert('Upload error: ' + err.message)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleGenerateContent = async () => {
    if (!form.title) { alert('Enter a title first.'); return }
    setGenerating(true)
    try {
      const selectedCategory = categories.find(c => c.id === form.blogCategoryId)
      const res = await fetch('/api/admin/blog/generate-content', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: form.title, categoryName: selectedCategory?.name || '' }),
      })
      if (res.ok) {
        const data = await res.json()
        // Auto-generate meta from content
        const plainText = data.content
          ? data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          : ''
        const autoMetaDesc = plainText.substring(0, 155).trim() + (plainText.length > 155 ? '...' : '')
        setForm(f => ({
          ...f,
          content: data.content || f.content,
          excerpt: data.excerpt && !f.excerpt ? data.excerpt : f.excerpt,
          metaTitle: f.metaTitle || `${f.title} | DJYoungster`,
          metaDescription: f.metaDescription || autoMetaDesc,
        }))
      } else {
        const err = await res.json()
        alert(err.error || 'Generation failed')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateExcerpt = async () => {
    if (!form.title && !form.content) { alert('Enter a title or content first.'); return }
    setGeneratingExcerpt(true)
    try {
      const res = await fetch('/api/admin/blog/generate-content', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: form.title, content: form.content, type: 'excerpt' }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.excerpt) setForm(f => ({ ...f, excerpt: data.excerpt }))
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to generate excerpt')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGeneratingExcerpt(false)
    }
  }

  const handleGenerateCover = async () => {
    if (!form.title) { alert('Enter a title first.'); return }
    setGeneratingCover(true)
    try {
      const selectedCategory = categories.find(c => c.id === form.blogCategoryId)
      const res = await fetch('/api/admin/blog/generate-cover', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: form.title,
          categoryName: selectedCategory?.name || '',
          categoryColor: selectedCategory?.color || '#1DB954',
          sourceImageUrl: form.coverImage || null,
          excerpt: form.excerpt || '',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, coverImage: data.url }))
      } else {
        const err = await res.json()
        alert(err.message || 'Cover generation failed')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setGeneratingCover(false)
    }
  }

  const handleSave = async (statusOverride) => {
    const status = statusOverride || form.status
    if (!form.title?.trim()) { alert('Please enter a title.'); return }
    if (!form.blogCategoryId) { alert('Please select a category.'); return }
    if (status === 'published' && !form.excerpt?.trim()) { alert('Please add an excerpt before publishing.'); return }
    setSaving(true)
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const payload = {
      ...form,
      status: statusOverride || form.status,
      tags,
      relatedSongId: form.relatedSongId || null,
      relatedMovieId: form.relatedMovieId || null,
      relatedArtistId: form.relatedArtistId || null,
      relatedAlbumId: form.relatedAlbumId || null,
    }
    const url = mode === 'edit' ? `/api/admin/blog/${postId}` : '/api/admin/blog'
    const method = mode === 'edit' ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      router.push('/admin/blog')
    } else {
      const err = await res.json()
      alert(err.message || 'Save failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">{mode === 'edit' ? 'Edit Post' : 'New Blog Post'}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:opacity-90 text-sm font-medium disabled:opacity-50"
          >
            <FiEye className="w-4 h-4" />
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-rose-500">*</span></label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="Post title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); handleChange(e) }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm font-mono"
                />
                <button type="button" onClick={() => { setSlugManual(false); setForm(f => ({ ...f, slug: slugify(f.title) })) }} className="px-3 py-2 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 whitespace-nowrap">
                  Reset
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Excerpt <span className="text-rose-500">*</span></label>
                <button
                  type="button"
                  onClick={handleGenerateExcerpt}
                  disabled={generatingExcerpt}
                  className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <FiRefreshCw className={`w-3 h-3 ${generatingExcerpt ? 'animate-spin' : ''}`} />
                  {generatingExcerpt ? 'Generating...' : 'Auto Generate'}
                </button>
              </div>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Short summary shown in post cards..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Content</label>
                <button
                  type="button"
                  onClick={handleGenerateContent}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <FiZap className="w-3.5 h-3.5" />
                  {generating ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <RichTextEditor value={form.content} onChange={handleContentChange} />
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={form.metaTitle}
                onChange={e => { setMetaTitleManual(true); handleChange(e) }}
                placeholder="Auto-filled from title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">{form.metaTitle.length}/60 chars</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                rows={3}
                placeholder="150-160 characters for best SEO..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{form.metaDescription.length}/160 chars</p>
            </div>
          </div>

          {/* DB Links */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Link to Database</h3>
            <p className="text-sm text-slate-500">Connect this post to existing content on the site.</p>
            <DBLinkField label="Related Song"   fieldId="relatedSongId"   fieldLabel="relatedSongLabel"   endpoint="songs"   labelKey="title" form={form} setForm={setForm} />
            <DBLinkField label="Related Movie"  fieldId="relatedMovieId"  fieldLabel="relatedMovieLabel"  endpoint="movies"  labelKey="title" form={form} setForm={setForm} />
            <DBLinkField label="Related Artist" fieldId="relatedArtistId" fieldLabel="relatedArtistLabel" endpoint="artists" labelKey="name"  form={form} setForm={setForm} />
            <DBLinkField label="Related Album"  fieldId="relatedAlbumId"  fieldLabel="relatedAlbumLabel"  endpoint="albums"  labelKey="title" form={form} setForm={setForm} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Publish Settings</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
              <select name="author" value={form.author} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm">
                <option value="Rahul Sharma">Rahul Sharma</option>
                <option value="Priya Mehta">Priya Mehta</option>
                <option value="Arjun Singh">Arjun Singh</option>
                <option value="Neha Kapoor">Neha Kapoor</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 text-primary rounded" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured Post</label>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="font-semibold text-slate-800">Category <span className="text-rose-500">*</span></h3>

            {categories.length === 0 && !showNewCat && (
              <p className="text-sm text-slate-400 italic">No categories yet. Add one below.</p>
            )}

            {/* Existing categories */}
            <div className="space-y-1.5">
              {categories.map(cat => {
                const selected = form.blogCategoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, blogCategoryId: cat.id }))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#6b7280' }} />
                    <span className="text-sm font-medium text-slate-700 flex-1">{cat.name}</span>
                    {selected && <FiCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Add new category inline */}
            {showNewCat ? (
              <div className="border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New Category</p>
                <input
                  type="text"
                  value={newCat.name}
                  onChange={e => setNewCat(n => ({ ...n, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Category name..."
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                />
                {/* Color presets */}
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCat(n => ({ ...n, color: c }))}
                        className="w-6 h-6 rounded-full border-2 transition-all flex-shrink-0"
                        style={{
                          backgroundColor: c,
                          borderColor: newCat.color === c ? '#1e293b' : 'transparent',
                          transform: newCat.color === c ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={newCat.color}
                      onChange={e => setNewCat(n => ({ ...n, color: e.target.value }))}
                      className="w-6 h-6 rounded-full cursor-pointer border border-slate-300"
                      title="Custom color"
                    />
                  </div>
                </div>
                {/* Preview */}
                {newCat.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Preview:</span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: newCat.color }}
                    >
                      {newCat.name}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={savingCat || !newCat.name.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                    {savingCat ? 'Adding...' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCat(false); setNewCat({ name: '', color: '#6b7280' }) }}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCat(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors mt-1"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Add new category
              </button>
            )}
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Cover Image</h3>

            {/* Auto Generate / Style image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {form.coverImage ? 'Style as Featured Image (1920×1080)' : 'Auto Generate (1920×1080)'}
              </label>
              <button
                type="button"
                onClick={handleGenerateCover}
                disabled={generatingCover || !form.title}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-medium"
              >
                <FiZap className="w-4 h-4" />
                {generatingCover
                  ? 'Generating...'
                  : form.coverImage
                    ? 'Create Editorial Cover'
                    : 'Generate from Title'}
              </button>
              <p className="text-xs text-slate-400 mt-1">
                {form.coverImage
                  ? 'Combines your uploaded image with title & category into a styled cover'
                  : 'Creates a styled cover using the post title & category color'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Upload from system */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload from Device</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <FiUpload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Click to upload image'}
              </button>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP — max 5MB</p>
            </div>

            {/* Preview */}
            {form.coverImage && (
              <div className="relative">
                <img src={form.coverImage} alt="Cover preview" className="w-full h-40 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Or URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Or paste Image URL</label>
              <input
                type="url"
                name="coverImage"
                value={form.coverImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">OG Image URL</label>
              <input
                type="url"
                name="ogImage"
                value={form.ogImage}
                onChange={handleChange}
                placeholder="Defaults to cover image..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Tags</h3>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="bollywood, review, 2026..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-slate-400">Comma separated</p>
          </div>
        </div>
      </div>
    </div>
  )
}
