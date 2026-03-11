'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiInfo, FiHelpCircle } from 'react-icons/fi'

export default function HomepageContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [about, setAbout] = useState('')
  const [faqs, setFaqs] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchContent()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/homepage-content', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(`${res.status}: ${body.message || 'Failed to fetch'}`)
      }
      const data = await res.json()
      setAbout(data.about || '')
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('fetchContent error:', error)
      showToast(`Failed to load homepage content: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ about, faqs }),
      })
      if (!res.ok) throw new Error('Failed to save')
      showToast('Homepage content saved successfully!')
    } catch (error) {
      showToast('Failed to save content', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }])
  }

  const removeFaq = (index) => {
    setFaqs(prev => prev.filter((_, i) => i !== index))
  }

  const updateFaq = (index, field, value) => {
    setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, [field]: value } : faq))
  }

  const moveFaq = (index, direction) => {
    const newFaqs = [...faqs]
    const target = index + direction
    if (target < 0 || target >= newFaqs.length) return
    ;[newFaqs[index], newFaqs[target]] = [newFaqs[target], newFaqs[index]]
    setFaqs(newFaqs)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Homepage Content</h1>
          <p className="text-slate-500 text-sm mt-1">Edit the About section and FAQ on the homepage</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: About Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-emerald-100">
              <FiInfo className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">About DJYoungster</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              HTML Content
            </label>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono resize-y"
              placeholder="Enter HTML content for the About section..."
            />
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">Preview</p>
            <div
              className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-700 border border-slate-100 rounded-lg p-4 bg-slate-50 text-sm"
              dangerouslySetInnerHTML={{ __html: about }}
            />
          </div>
        </div>

        {/* RIGHT: FAQ Manager */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-100">
              <FiHelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">FAQ Manager</h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-400 mt-1">#{index + 1}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => moveFaq(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-200 transition-colors"
                      title="Move up"
                    >
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFaq(index, 1)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-200 transition-colors"
                      title="Move down"
                    >
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFaq(index)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete FAQ"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={e => updateFaq(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Enter question..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Answer</label>
                  <textarea
                    value={faq.answer}
                    onChange={e => updateFaq(index, 'answer', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-y"
                    placeholder="Enter answer..."
                  />
                </div>
              </div>
            ))}

            {faqs.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No FAQs yet. Click "Add FAQ" to get started.</p>
            )}
          </div>

          <button
            onClick={addFaq}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>
    </div>
  )
}
