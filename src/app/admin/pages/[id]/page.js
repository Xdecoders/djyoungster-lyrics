'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiExternalLink } from 'react-icons/fi'

export default function EditPagePage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  })

  useEffect(() => {
    fetchPage()
  }, [id])

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPage({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          isPublished: data.isPublished ?? true
        })
      } else {
        alert('Page not found')
        router.push('/admin/pages')
      }
    } catch (error) {
      console.error('Error fetching page:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      })

      if (res.ok) {
        alert('Page saved successfully!')
      } else {
        const error = await res.json()
        alert(error.message || 'Error saving page')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = () => {
    setPage({ ...page, isPublished: !page.isPublished })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Page</h1>
            <p className="text-slate-500 mt-1">{page.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FiExternalLink className="w-4 h-4" />
            Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Page Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Page Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content (HTML supported)
                </label>
                <textarea
                  value={page.content}
                  onChange={(e) => setPage({ ...page, content: e.target.value })}
                  rows={20}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  placeholder="<h2>Welcome</h2>
<p>Your content here...</p>"
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  You can use HTML tags for formatting. Common tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Content Preview</h2>
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
            {!page.content && (
              <p className="text-slate-400 italic">No content to preview</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Publish Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 text-sm">
                    /
                  </span>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) => setPage({ ...page, slug: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <button
                  type="button"
                  onClick={togglePublish}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    page.isPublished
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {page.isPublished ? (
                    <>
                      <FiEye className="w-4 h-4" />
                      Published
                    </>
                  ) : (
                    <>
                      <FiEyeOff className="w-4 h-4" />
                      Draft
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={page.metaTitle}
                  onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
                  placeholder={page.title}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={page.metaDescription}
                  onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                  rows={3}
                  placeholder="Brief description for search engines..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-medium text-blue-800 mb-2">Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1.5">
              <li>• Use HTML for rich formatting</li>
              <li>• Keep meta description under 160 characters</li>
              <li>• URL slug affects SEO - use keywords</li>
              <li>• Draft pages are not visible to visitors</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}
