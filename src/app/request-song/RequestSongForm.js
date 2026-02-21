'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMusic, FiUser, FiMail, FiYoutube, FiCheckCircle, FiArrowLeft, FiSend } from 'react-icons/fi'
import { FaWhatsapp, FaSpotify, FaXTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6'

export default function RequestSongForm() {
  const [formData, setFormData] = useState({
    songName: '',
    artistName: '',
    lyrics: '',
    youtubeUrl: '',
    spotifyUrl: '',
    email: '',
    newsletterOptIn: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.songName.trim()) {
      setError('Song name is required')
      return
    }
    if (!formData.artistName.trim()) {
      setError('Artist name is required')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/public/song-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      songName: '',
      artistName: '',
      lyrics: '',
      youtubeUrl: '',
      spotifyUrl: '',
      email: '',
      newsletterOptIn: true
    })
    setSuccess(false)
    setError('')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Request Submitted!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Thank you for your song request. We&apos;ll review it and try to add the lyrics as soon as possible.
            </p>

            {/* WhatsApp CTA */}
            <a
              href="https://whatsapp.com/channel/0029Vb7A52PEAKW8b0wxfV03"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-medium transition mb-6 shadow-md"
            >
              <FaWhatsapp className="w-5 h-5" />
              Follow our WhatsApp Channel for updates
            </a>

            {/* Social Media */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Follow us on social media</p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <a href="https://x.com/djyoungstercom" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition" aria-label="Follow on X">
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/djyoungster" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-[#1877F2] hover:text-white transition" aria-label="Follow on Facebook">
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/djyoungster_com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition" aria-label="Follow on Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/djyoungsterofficial" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-[#0A66C2] hover:text-white transition" aria-label="Follow on LinkedIn">
                <FaLinkedinIn className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@Djyoungstercom" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-[#FF0000] hover:text-white transition" aria-label="Subscribe on YouTube">
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>

            <div>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-3 text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl font-medium transition"
              >
                Submit Another Request
              </button>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMusic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Request Song Lyrics</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Can&apos;t find your favorite song? Let us know and we&apos;ll add it!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Song Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Song Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMusic className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="songName"
                value={formData.songName}
                onChange={handleChange}
                placeholder="Enter song name"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Artist Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Artist Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="artistName"
                value={formData.artistName}
                onChange={handleChange}
                placeholder="Enter artist name"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Main Lyrics <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="lyrics"
              value={formData.lyrics}
              onChange={handleChange}
              placeholder="Paste some lyrics if you have them..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            />
          </div>

          {/* URLs side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                YouTube URL <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiYoutube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Spotify URL <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FaSpotify className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  name="spotifyUrl"
                  value={formData.spotifyUrl}
                  onChange={handleChange}
                  placeholder="https://open.spotify.com/..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Newsletter Opt-in */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="newsletterOptIn"
              checked={formData.newsletterOptIn}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Subscribe to our newsletter for updates on new lyrics and features
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="w-5 h-5" />
                Request Song Lyrics
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          We review all requests and try to add lyrics within a few days.
        </p>
      </div>
    </div>
  )
}
