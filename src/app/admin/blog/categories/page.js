'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

const COLORS = ['#e11d48', '#f59e0b', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316', '#6366f1', '#ec4899']

export default function AdminBlogCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: COLORS[0], sortOrder: 0 })
  const [slugManual, setSlugManual] = useState(false)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : ''
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/blog/categories', { headers: authHeaders() })
    if (res.ok) setCategories(await res.json())
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      setForm(f => ({ ...f, name: value, slug: slugManual ? f.slug : slugify(value) }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', color: COLORS[0], sortOrder: categories.length })
    setSlugManual(false)
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || COLORS[0], sortOrder: cat.sortOrder })
    setSlugManual(true)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) return
    setSaving(true)
    const url = editing ? `/api/admin/blog/categories/${editing.id}` : '/api/admin/blog/categories'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      fetchCategories()
    } else {
      const err = await res.json()
      alert(err.message || 'Save failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? All posts in it must be reassigned first.')) return
    const res = await fetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) fetchCategories()
    else { const err = await res.json(); alert(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Blog Categories</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:opacity-90 text-sm font-medium"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">{editing ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><FiX className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input type="text" name="slug" value={form.slug} onChange={e => { setSlugManual(true); handleChange(e) }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
              <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl text-sm hover:opacity-90 disabled:opacity-50">
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Posts</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Order</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: cat.color || '#6b7280' }}>
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">{cat._count?.posts ?? 0}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-lg transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
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
    </div>
  )
}
