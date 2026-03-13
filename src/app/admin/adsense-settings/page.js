'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiCheck, FiDollarSign, FiToggleLeft, FiToggleRight, FiInfo } from 'react-icons/fi'

export default function AdsenseSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [enabled, setEnabled] = useState(false)
  const [publisherId, setPublisherId] = useState('')
  const [webStoryAdsEnabled, setWebStoryAdsEnabled] = useState(false)
  const [webStoryAdSlot, setWebStoryAdSlot] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchSettings(token)
  }, [])

  const fetchSettings = async (token) => {
    try {
      const res = await fetch('/api/admin/adsense-settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEnabled(data.enabled || false)
        setPublisherId(data.publisherId || '')
        setWebStoryAdsEnabled(data.webStoryAdsEnabled || false)
        setWebStoryAdSlot(data.webStoryAdSlot || '')
      }
    } catch (error) {
      console.error('Error fetching AdSense settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/adsense-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled, publisherId, webStoryAdsEnabled, webStoryAdSlot }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Failed to save: ${errData.error || errData.message || res.status}`)
      }
    } catch (error) {
      console.error('Error saving AdSense settings:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const scriptPreview = publisherId
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`
    : ''

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-primary" />
            </div>
            AdSense Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage Google AdSense code for all pages and Web Stories</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
            saved
              ? 'bg-green-100 text-green-600'
              : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:opacity-90'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <FiCheck className="w-4 h-4" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Main AdSense Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Google AdSense</h2>
            <p className="text-xs text-slate-400">Inject AdSense script into all pages</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-700">Enable AdSense</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Adds the AdSense script tag to the &lt;head&gt; of all pages
              </p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`text-3xl transition-colors ${enabled ? 'text-primary' : 'text-slate-300'}`}
            >
              {enabled ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>

          {/* Publisher ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Publisher ID (ca-pub-XXXXXXXXXX)
            </label>
            <input
              type="text"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value.trim())}
              placeholder="ca-pub-1234567890123456"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Found in your AdSense dashboard under Account → Account information
            </p>
          </div>

          {/* Script Preview */}
          {scriptPreview && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <FiInfo className="w-3.5 h-3.5" />
                Script that will be injected in &lt;head&gt;
              </label>
              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                <code className="text-emerald-400 text-xs font-mono whitespace-pre-wrap break-all">
                  {scriptPreview}
                </code>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="flex gap-3 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">AdSense Application</p>
              <p className="text-blue-600 text-xs leading-relaxed">
                During the AdSense application review, Google requires the script to be present on all pages even before approval.
                Enable this and add your Publisher ID to pass the review.
                After approval, place individual ad units on your pages using the Ad Unit code.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Web Stories AdSense */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Web Stories AdSense</h2>
            <p className="text-xs text-slate-400">Auto ads for Google Web Stories (AMP)</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Enable Web Story Ads */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-700">Enable Web Story Ads</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Adds <code className="bg-slate-200 px-1 rounded">amp-story-auto-ads</code> to all Web Stories
              </p>
            </div>
            <button
              onClick={() => setWebStoryAdsEnabled(!webStoryAdsEnabled)}
              className={`text-3xl transition-colors ${webStoryAdsEnabled ? 'text-primary' : 'text-slate-300'}`}
            >
              {webStoryAdsEnabled ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>

          {/* Ad Slot */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ad Slot ID
            </label>
            <input
              type="text"
              value={webStoryAdSlot}
              onChange={(e) => setWebStoryAdSlot(e.target.value.trim())}
              placeholder="1234567890"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition font-mono text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Create a new ad unit in AdSense → Ads → By ad unit → Display ads. Copy the data-ad-slot value.
            </p>
          </div>

          {/* Requirements notice */}
          <div className="flex gap-3 p-4 bg-amber-50 rounded-xl text-sm text-amber-700">
            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed text-amber-600">
              <p className="font-medium text-amber-700 mb-1">Requirements</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>AdSense account must be approved first</li>
                <li>Publisher ID (above) must be set and AdSense must be enabled</li>
                <li>Only takes effect when both this and the main AdSense toggle are ON</li>
                <li>Web Story ads show automatically between lyric slides</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
