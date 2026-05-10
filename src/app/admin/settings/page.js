'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiLock, FiUser, FiMail, FiSave, FiEye, FiEyeOff, FiShield, FiImage, FiRefreshCw, FiCheck, FiCode, FiLayout } from 'react-icons/fi'

export default function AdminSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [ogStats, setOgStats] = useState(null)
  const [ogGenerating, setOgGenerating] = useState(false)
  const [ogResult, setOgResult] = useState(null)

  // Code snippets state
  const [snippets, setSnippets] = useState({
    headerCode: '', headerPages: ['all'],
    footerCode: '', footerPages: ['all'],
  })
  const [snippetSaving, setSnippetSaving] = useState(false)
  const [snippetMessage, setSnippetMessage] = useState({ type: '', text: '' })

  // Homepage layout state
  const [activeHomepage, setActiveHomepage] = useState('v1')
  const [layoutSaving, setLayoutSaving] = useState(false)
  const [layoutMessage, setLayoutMessage] = useState({ type: '', text: '' })

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  })

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchProfile()
    fetchOgStats()
    fetchSnippets()
    fetchHomepageLayout()
  }, [])

  const togglePage = (field, value) => {
    setSnippets(prev => {
      const current = prev[field] || []
      if (value === 'all') return { ...prev, [field]: ['all'] }
      const without = current.filter(p => p !== 'all' && p !== value)
      const next = current.includes(value) ? without : [...without, value]
      return { ...prev, [field]: next.length === 0 ? ['all'] : next }
    })
  }

  const fetchSnippets = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/code-snippets', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setSnippets(await res.json())
    } catch {}
  }

  const fetchHomepageLayout = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/homepage-layout', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setActiveHomepage(data.activeHomepage || 'v1')
      }
    } catch {}
  }

  const handleSaveLayout = async (value) => {
    setLayoutSaving(true)
    setLayoutMessage({ type: '', text: '' })
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/homepage-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activeHomepage: value })
      })
      const data = await res.json()
      if (res.ok) {
        setActiveHomepage(value)
        setLayoutMessage({ type: 'success', text: 'Homepage layout updated! Changes will appear within 5 minutes.' })
      } else {
        setLayoutMessage({ type: 'error', text: data.message || 'Failed to save' })
      }
    } catch {
      setLayoutMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLayoutSaving(false)
      setTimeout(() => setLayoutMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleSaveSnippets = async (e) => {
    e.preventDefault()
    setSnippetSaving(true)
    setSnippetMessage({ type: '', text: '' })
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/code-snippets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(snippets)
      })
      const data = await res.json()
      setSnippetMessage({ type: res.ok ? 'success' : 'error', text: data.message })
    } catch {
      setSnippetMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setSnippetSaving(false)
    }
  }

  const fetchOgStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/regenerate-og', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setOgStats(await res.json())
    } catch {}
  }

  const handleGenerateOg = async (force) => {
    setOgGenerating(true)
    setOgResult(null)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/regenerate-og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ force })
      })
      const data = await res.json()
      setOgResult(data)
      fetchOgStats()
    } catch {
      setOgResult({ message: 'Request failed' })
    } finally {
      setOgGenerating(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile({
          name: data.name || '',
          email: data.email || '',
          role: data.role || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' })
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your admin account settings</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
              <p className="text-sm text-slate-500">Update your account details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <div className="relative">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 font-medium"
            >
              <FiSave className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <FiLock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
              <p className="text-sm text-slate-500">Update your login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50 font-medium"
            >
              <FiLock className="w-5 h-5" />
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
        {/* OG Image Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <FiImage className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">OG Image Generator</h2>
              <p className="text-sm text-slate-500">Generate 1200×630 featured images for Google Discover</p>
            </div>
          </div>

          {ogStats && (
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-800">{ogStats.total}</p>
                <p className="text-xs text-slate-500">Total songs</p>
              </div>
              <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{ogStats.withOg}</p>
                <p className="text-xs text-slate-500">Have OG image</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{ogStats.withoutOg}</p>
                <p className="text-xs text-slate-500">Missing</p>
              </div>
            </div>
          )}

          {ogResult && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${ogResult.failed > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {ogResult.message} {ogResult.generated !== undefined && `— ${ogResult.generated} generated, ${ogResult.failed} failed`}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleGenerateOg(false)}
              disabled={ogGenerating || ogStats?.withoutOg === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 font-medium text-sm"
            >
              <FiRefreshCw className={`w-4 h-4 ${ogGenerating ? 'animate-spin' : ''}`} />
              {ogGenerating ? 'Generating...' : `Generate Missing (${ogStats?.withoutOg ?? '…'})`}
            </button>
            <button
              onClick={() => handleGenerateOg(true)}
              disabled={ogGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition disabled:opacity-50 font-medium text-sm"
            >
              <FiRefreshCw className="w-4 h-4" />
              Regenerate All
            </button>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <FiCode className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Code Snippets</h2>
              <p className="text-sm text-slate-500">Inject scripts into the header or footer — choose which pages to apply them on</p>
            </div>
          </div>

          {snippetMessage.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              snippetMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {snippetMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveSnippets} className="space-y-6">

            {/* Header Code */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Header Code <span className="font-normal text-slate-400 text-xs">— injected inside &lt;head&gt;</span></p>
                <p className="text-xs text-slate-400 mt-0.5">Good for analytics, tag managers, verification scripts. Paste with or without &lt;script&gt; tags.</p>
              </div>
              <textarea
                value={snippets.headerCode}
                onChange={(e) => setSnippets({ ...snippets, headerCode: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition font-mono text-sm resize-y"
                placeholder={'<script>\n  // Your code here\n</script>'}
              />
              <PageSelector
                label="Show on"
                selected={snippets.headerPages || ['all']}
                onToggle={(val) => togglePage('headerPages', val)}
              />
            </div>

            {/* Footer Code */}
            <div className="border border-slate-100 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Footer Code <span className="font-normal text-slate-400 text-xs">— injected before &lt;/body&gt;</span></p>
                <p className="text-xs text-slate-400 mt-0.5">Runs after the page loads. Good for chat widgets, pixels, or deferred scripts.</p>
              </div>
              <textarea
                value={snippets.footerCode}
                onChange={(e) => setSnippets({ ...snippets, footerCode: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition font-mono text-sm resize-y"
                placeholder={'<script>\n  // Your code here\n</script>'}
              />
              <PageSelector
                label="Show on"
                selected={snippets.footerPages || ['all']}
                onToggle={(val) => togglePage('footerPages', val)}
              />
            </div>

            <button
              type="submit"
              disabled={snippetSaving}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition disabled:opacity-50 font-medium"
            >
              <FiSave className="w-5 h-5" />
              {snippetSaving ? 'Saving...' : 'Save Snippets'}
            </button>
          </form>
        </div>


        {/* Homepage Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <FiLayout className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Homepage Layout</h2>
              <p className="text-sm text-slate-500">Choose which homepage visitors see</p>
            </div>
          </div>

          {layoutMessage.text && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              layoutMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {layoutMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* V1 card */}
            <button
              type="button"
              disabled={layoutSaving}
              onClick={() => handleSaveLayout('v1')}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                activeHomepage === 'v1'
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              {activeHomepage === 'v1' && (
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wide">
                  <FiCheck className="w-3 h-3" /> Active
                </span>
              )}
              <div className="w-full aspect-[16/9] rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 flex flex-col gap-1.5 p-3 overflow-hidden">
                <div className="h-3 bg-white/40 rounded w-3/4" />
                <div className="h-2 bg-white/30 rounded w-1/2" />
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 h-8 bg-white/20 rounded" />
                  ))}
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 h-6 bg-white/20 rounded" />
                  ))}
                </div>
              </div>
              <p className="font-bold text-slate-800 text-sm">Lyrics Homepage (V1)</p>
              <p className="text-xs text-slate-500 mt-0.5">Songs, charts, language tabs, blog updates — full lyrics platform</p>
            </button>

            {/* V2 card */}
            <button
              type="button"
              disabled={layoutSaving}
              onClick={() => handleSaveLayout('v2')}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                activeHomepage === 'v2'
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              {activeHomepage === 'v2' && (
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wide">
                  <FiCheck className="w-3 h-3" /> Active
                </span>
              )}
              <div className="w-full aspect-[16/9] rounded-lg bg-slate-800 mb-4 flex flex-col gap-1.5 p-3 overflow-hidden">
                <div className="h-1.5 bg-emerald-400/60 rounded w-full mb-1" />
                <div className="flex gap-1 flex-1">
                  <div className="flex-[2] bg-slate-600/60 rounded" />
                  <div className="flex-1 flex flex-col gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 bg-slate-600/40 rounded" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 h-5 bg-slate-600/40 rounded" />
                  ))}
                </div>
              </div>
              <p className="font-bold text-slate-800 text-sm">Entertainment Blog (V2)</p>
              <p className="text-xs text-slate-500 mt-0.5">Blog posts only — entertainment news &amp; updates magazine style</p>
            </button>
          </div>

          {layoutSaving && (
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <FiRefreshCw className="w-3 h-3 animate-spin" /> Saving and revalidating cache...
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

const PAGE_OPTIONS = [
  { value: 'all',      label: 'Entire site' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'song',     label: 'Song lyrics pages' },
  { value: 'artist',   label: 'Artist pages' },
  { value: 'album',    label: 'Album pages' },
  { value: 'movie',    label: 'Movie pages' },
  { value: 'category', label: 'Category pages' },
  { value: 'genre',    label: 'Genre pages' },
  { value: 'tag',      label: 'Tag pages' },
  { value: 'search',   label: 'Search page' },
  { value: 'songs',    label: 'All songs listing' },
  { value: 'artists',  label: 'All artists listing' },
]

function PageSelector({ label, selected, onToggle }) {
  const isAll = selected.includes('all')
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {PAGE_OPTIONS.map(({ value, label: optLabel }) => {
          const active = value === 'all' ? isAll : (!isAll && selected.includes(value))
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                active
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600'
              }`}
            >
              {optLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
