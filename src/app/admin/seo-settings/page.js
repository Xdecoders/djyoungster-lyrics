'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiSave, FiCheck, FiHome, FiMusic, FiUser, FiDisc, FiFilm, FiTag } from 'react-icons/fi'

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

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/seo-settings')
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

  const handleSave = async (pageKey) => {
    setSaving(prev => ({ ...prev, [pageKey]: true }))

    try {
      const res = await fetch('/api/admin/seo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
