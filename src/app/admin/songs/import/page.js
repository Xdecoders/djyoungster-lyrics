'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiUpload, FiArrowLeft, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi'

export default function ImportSongs() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [importResults, setImportResults] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setJsonData(event.target.result)
        setError('')
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setError('Please provide JSON data to import')
      return
    }

    let songs
    try {
      songs = JSON.parse(jsonData)
      if (!Array.isArray(songs)) {
        songs = [songs]
      }
    } catch (e) {
      setError('Invalid JSON format')
      return
    }

    setLoading(true)
    setImportResults(null)

    const results = { success: 0, failed: 0, errors: [] }

    for (const song of songs) {
      try {
        const res = await fetch('/api/admin/songs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(song)
        })

        if (res.ok) {
          results.success++
        } else {
          const data = await res.json()
          results.failed++
          results.errors.push(`${song.title || 'Unknown'}: ${data.message}`)
        }
      } catch (e) {
        results.failed++
        results.errors.push(`${song.title || 'Unknown'}: Network error`)
      }
    }

    setImportResults(results)
    setLoading(false)
  }

  const sampleJson = JSON.stringify([
    {
      title: "Sample Song",
      slug: "sample-song",
      lyrics: "Sample lyrics here...",
      language: "English",
      releaseYear: 2024,
      artistIds: [],
      genreIds: [],
      categoryIds: [],
      status: "published"
    }
  ], null, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin/songs" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiUpload className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Bulk Import Songs</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Upload JSON File</h2>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-slate-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FiFile className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-1 font-medium">Click to upload a JSON file</p>
                <p className="text-sm text-slate-400">or drag and drop</p>
              </label>
            </div>
          </div>

          {/* JSON Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Or Paste JSON Data</h2>

            <textarea
              value={jsonData}
              onChange={(e) => {
                setJsonData(e.target.value)
                setError('')
              }}
              rows={12}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono text-sm transition resize-none"
              placeholder={sampleJson}
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={loading || !jsonData.trim()}
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 font-medium"
            >
              <FiUpload className="w-5 h-5" />
              {loading ? 'Importing...' : 'Import Songs'}
            </button>
          </div>

          {/* Results */}
          {importResults && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Import Results</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <div className="bg-emerald-100 p-1.5 rounded-lg">
                      <FiCheck className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Successful</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{importResults.success}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <div className="bg-red-100 p-1.5 rounded-lg">
                      <FiAlertCircle className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{importResults.failed}</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="font-medium text-red-700 mb-2 text-sm">Errors:</h3>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResults.errors.map((err, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400">-</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sample Format */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Expected JSON Format</h2>
            <pre className="bg-slate-50 rounded-xl p-4 text-sm overflow-x-auto font-mono text-slate-600 border border-slate-100">
              {sampleJson}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}
