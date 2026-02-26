'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiList, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiCheck, FiX, FiSearch, FiEye, FiChevronDown } from 'react-icons/fi'

export default function TopListsPage() {
  const router = useRouter()
  const [topLists, setTopLists] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    count: '50',
    categoryId: '',
    tagId: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  })

  // Category dropdown state
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const categoryDropdownRef = useRef(null)

  // Tag dropdown state
  const [tagSearch, setTagSearch] = useState('')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const tagDropdownRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchTopLists()
    fetchCategories()
    fetchTags()
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false)
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) {
        setShowTagDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTopLists = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/top-lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setTopLists(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching top lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      setTags(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      count: '50',
      categoryId: '',
      tagId: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true
    })
    setCategorySearch('')
    setTagSearch('')
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingId
        ? `/api/admin/top-lists/${editingId}`
        : '/api/admin/top-lists'

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          count: parseInt(formData.count)
        })
      })

      if (res.ok) {
        await fetchTopLists()
        const message = editingId ? 'Top list updated successfully!' : 'Top list created successfully!'
        setSuccessMessage(message)
        resetForm()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const data = await res.json()
        setErrorMessage(data.message || 'Failed to save top list. Please try again.')
      }
    } catch (error) {
      console.error('Error saving top list:', error)
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (topList) => {
    setFormData({
      title: topList.title,
      slug: topList.slug,
      count: String(topList.count),
      categoryId: topList.categoryId || '',
      tagId: topList.tagId || '',
      description: topList.description || '',
      metaTitle: topList.metaTitle || '',
      metaDescription: topList.metaDescription || '',
      isPublished: topList.isPublished
    })
    setCategorySearch(topList.category?.name || '')
    setTagSearch(topList.tag?.name || '')
    setEditingId(topList.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/top-lists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setTopLists(topLists.filter(tl => tl.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting top list:', error)
    }
  }

  const selectCategory = (category) => {
    setFormData(prev => ({ ...prev, categoryId: category.id }))
    setCategorySearch(category.name)
    setShowCategoryDropdown(false)
  }

  const clearCategory = () => {
    setFormData(prev => ({ ...prev, categoryId: '' }))
    setCategorySearch('')
  }

  const selectTag = (tag) => {
    setFormData(prev => ({ ...prev, tagId: tag.id }))
    setTagSearch(tag.name)
    setShowTagDropdown(false)
  }

  const clearTag = () => {
    setFormData(prev => ({ ...prev, tagId: '' }))
    setTagSearch('')
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const filteredTopLists = topLists.filter(tl =>
    tl.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const countOptions = [
    { value: '10', label: 'Top 10' },
    { value: '20', label: 'Top 20' },
    { value: '25', label: 'Top 25' },
    { value: '50', label: 'Top 50' },
    { value: '100', label: 'Top 100' }
  ]

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
                  <FiList className="w-5 h-5 text-violet-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Manage Top Lists</h1>
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
              <span className="hidden sm:inline">Add Top List</span>
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
              placeholder="Search top lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
            <FiCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FiX className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="ml-auto p-1 hover:bg-red-100 rounded">
              <FiX className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Top List' : 'Add New Top List'}
              </h2>
              <button onClick={resetForm} aria-label="Close form" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800"
                    placeholder="e.g. Top 50 Punjabi Songs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800"
                    placeholder="auto-generated"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Count Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Count</label>
                  <select
                    name="count"
                    value={formData.count}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800"
                  >
                    {countOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Category Searchable Dropdown */}
                <div ref={categoryDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category (optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value)
                        setShowCategoryDropdown(true)
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, categoryId: '' }))
                        }
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800 pr-16"
                      placeholder="All Categories (leave empty)"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {formData.categoryId && (
                        <button type="button" onClick={clearCategory} className="p-1 text-slate-400 hover:text-slate-600">
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                      <FiChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No categories found</div>
                      ) : (
                        filteredCategories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => selectCategory(cat)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${formData.categoryId === cat.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                          >
                            {cat.name}
                            <span className="text-slate-400 ml-2">({cat._count?.songs || 0} songs)</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Tag Searchable Dropdown */}
                <div ref={tagDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tag (optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value)
                        setShowTagDropdown(true)
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, tagId: '' }))
                        }
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800 pr-16"
                      placeholder="All Tags (leave empty)"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {formData.tagId && (
                        <button type="button" onClick={clearTag} className="p-1 text-slate-400 hover:text-slate-600">
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                      <FiChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  {showTagDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredTags.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No tags found</div>
                      ) : (
                        filteredTags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => selectTag(tag)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${formData.tagId === tag.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'}`}
                          >
                            {tag.name}
                            <span className="text-slate-400 ml-2">({tag._count?.songs || 0} songs)</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none bg-white text-slate-800"
                  placeholder="Write a description for this top list..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Title (SEO)</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800"
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description (SEO)</label>
                  <input
                    type="text"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white text-slate-800"
                    placeholder="Brief description for search engines"
                  />
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">Published</span>
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
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingId ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {editingId ? 'Update' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Top Lists Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500">Loading top lists...</p>
          </div>
        ) : filteredTopLists.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="bg-violet-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiList className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-slate-500">
              {searchTerm ? 'No top lists found matching your search.' : 'No top lists yet. Create your first one!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTopLists.map((topList) => (
              <div key={topList.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{topList.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">/{topList.slug}</p>
                    </div>
                    <span className="ml-2 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg flex-shrink-0">
                      {topList.count}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${topList.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {topList.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                      {topList.category?.name || 'All Categories'}
                    </span>
                    {topList.tag && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 font-medium">
                        {topList.tag.name}
                      </span>
                    )}
                  </div>

                  {topList.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{topList.description}</p>
                  )}

                  <div className="flex justify-end gap-1 pt-3 border-t border-slate-100">
                    <Link
                      href={`/list/${topList.slug}`}
                      target="_blank"
                      aria-label="View top list"
                      className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View top list page"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(topList)}
                      aria-label="Edit top list"
                      className="p-2 text-slate-500 hover:text-primary hover:bg-emerald-50 rounded-lg transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(topList.id)}
                      aria-label="Delete top list"
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

        <div className="mt-4 text-sm text-slate-500">
          Showing {filteredTopLists.length} of {topLists.length} top lists
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Delete Top List?</h3>
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
