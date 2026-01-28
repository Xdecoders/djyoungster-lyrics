'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiFileText, FiExternalLink } from 'react-icons/fi'

export default function AdminPagesPage() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPage, setNewPage] = useState({ title: '', slug: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPage.title,
          slug: newPage.slug || newPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          content: ''
        })
      })

      if (res.ok) {
        const page = await res.json()
        setShowAddModal(false)
        setNewPage({ title: '', slug: '' })
        // Redirect to edit page
        window.location.href = `/admin/pages/${page.id}`
      } else {
        const error = await res.json()
        alert(error.message || 'Error creating page')
      }
    } catch (error) {
      console.error('Error creating page:', error)
      alert('Error creating page')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePage = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setPages(pages.filter(p => p.id !== id))
      } else {
        alert('Error deleting page')
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Error deleting page')
    }
  }

  const togglePublish = async (page) => {
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...page,
          isPublished: !page.isPublished
        })
      })

      if (res.ok) {
        setPages(pages.map(p =>
          p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
        ))
      }
    } catch (error) {
      console.error('Error updating page:', error)
    }
  }

  const defaultPages = [
    { slug: 'about-us', title: 'About Us' },
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-and-conditions', title: 'Terms and Conditions' },
    { slug: 'disclaimer', title: 'Disclaimer' },
    { slug: 'contact-us', title: 'Contact Us' }
  ]

  const createDefaultPage = async (pageInfo) => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageInfo.title,
          slug: pageInfo.slug,
          content: `<h1>${pageInfo.title}</h1>\n<p>Add your content here...</p>`
        })
      })

      if (res.ok) {
        const page = await res.json()
        window.location.href = `/admin/pages/${page.id}`
      } else {
        const error = await res.json()
        alert(error.message || 'Error creating page')
      }
    } catch (error) {
      console.error('Error creating page:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const existingSlugs = pages.map(p => p.slug)
  const missingDefaultPages = defaultPages.filter(dp => !existingSlugs.includes(dp.slug))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pages</h1>
          <p className="text-slate-500 mt-1">Manage static content pages</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Page
        </button>
      </div>

      {/* Quick Create Default Pages */}
      {missingDefaultPages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-800 mb-2">Quick Create Default Pages</h3>
          <p className="text-sm text-blue-600 mb-3">Click to create any missing default pages:</p>
          <div className="flex flex-wrap gap-2">
            {missingDefaultPages.map(dp => (
              <button
                key={dp.slug}
                onClick={() => createDefaultPage(dp)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                + {dp.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No pages yet</h3>
            <p className="text-slate-500 mb-4">Create your first page or use the quick create buttons above</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{page.title}</div>
                        <div className="text-sm text-slate-500">{page.metaTitle || 'No meta title'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublish(page)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        page.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {page.isPublished ? (
                        <>
                          <FiEye className="w-3.5 h-3.5" />
                          Published
                        </>
                      ) : (
                        <>
                          <FiEyeOff className="w-3.5 h-3.5" />
                          Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        title="View Page"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePage(page.id, page.title)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
        )}
      </div>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Page</h2>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="e.g., About Us"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug (optional)
                </label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  placeholder="e.g., about-us (auto-generated if empty)"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
