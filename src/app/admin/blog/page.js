'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiStar, FiTag
} from 'react-icons/fi'

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const limit = 20

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [page, search, status, categoryId])

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/blog/categories', { headers: authHeaders() })
    if (res.ok) setCategories(await res.json())
  }

  const fetchPosts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (categoryId) params.set('categoryId', categoryId)
    const res = await fetch(`/api/admin/blog?${params}`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setPosts(data.posts)
      setTotal(data.total)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', headers: authHeaders() })
    fetchPosts()
    setDeleting(null)
  }

  const toggleFeatured = async (post) => {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ isFeatured: !post.isFeatured }),
    })
    fetchPosts()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-1">{total} posts total</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blog/categories"
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium"
          >
            <FiTag className="w-4 h-4" />
            Categories
          </Link>
          <Link
            href="/admin/blog/add"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No posts found.{' '}
            <Link href="/admin/blog/add" className="text-primary font-medium">Create one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Views</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden xl:table-cell">Published</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImage && (
                        <img src={post.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {post.blogCategory && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: post.blogCategory.color || '#6b7280' }}
                      >
                        {post.blogCategory.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                      post.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500">
                    <span className="flex items-center gap-1"><FiEye className="w-3 h-3" />{post.views}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-slate-500 text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleFeatured(post)}
                        title={post.isFeatured ? 'Remove featured' : 'Mark featured'}
                        className={`p-1.5 rounded-lg transition-colors ${post.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                      >
                        <FiStar className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/updates/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View post"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete post"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
