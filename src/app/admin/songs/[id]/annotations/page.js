'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiTrash2, FiEdit3, FiZap, FiX } from 'react-icons/fi'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")
}

export default function AnnotationsPage() {
  const router = useRouter()
  const params = useParams()
  const songId = params.id

  const [loading, setLoading] = useState(true)
  const [song, setSong] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [lines, setLines] = useState([])

  // Selection state
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)

  // Editor state
  const [editorContent, setEditorContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [router])

  // Fetch song and annotations
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('adminToken')
        const headers = { 'Authorization': `Bearer ${token}` }
        const [songRes, annRes] = await Promise.all([
          fetch(`/api/admin/songs/${songId}`, { headers }),
          fetch(`/api/admin/songs/${songId}/annotations`, { headers })
        ])

        if (!songRes.ok) throw new Error('Song not found')

        const songData = await songRes.json()
        const annData = await annRes.json()

        setSong(songData)
        setAnnotations(annData)
        setLines(stripHtml(songData.lyrics).split('\n'))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [songId])

  // Build annotation map for highlighting
  const lineAnnotationMap = {}
  annotations.forEach(ann => {
    for (let i = ann.startLine; i <= ann.endLine; i++) {
      lineAnnotationMap[i] = ann
    }
  })

  const handleLineClick = (idx) => {
    const trimmed = lines[idx]?.trim()
    if (!trimmed) return // skip empty lines

    // If clicking an annotated line, load it for editing
    if (lineAnnotationMap[idx]) {
      const ann = lineAnnotationMap[idx]
      setEditingId(ann.id)
      setSelectionStart(ann.startLine)
      setSelectionEnd(ann.endLine)
      setEditorContent(ann.content)
      return
    }

    if (selectionStart === null) {
      setSelectionStart(idx)
      setSelectionEnd(null)
    } else if (selectionEnd === null) {
      const start = Math.min(selectionStart, idx)
      const end = Math.max(selectionStart, idx)

      // Check if range overlaps existing annotations
      let overlaps = false
      for (let i = start; i <= end; i++) {
        if (lineAnnotationMap[i]) {
          overlaps = true
          break
        }
      }

      if (overlaps) {
        setError('Selected range overlaps with an existing annotation')
        setTimeout(() => setError(''), 3000)
        setSelectionStart(null)
        setSelectionEnd(null)
        return
      }

      setSelectionStart(start)
      setSelectionEnd(end)
    } else {
      // Third click — deselect
      clearSelection()
    }
  }

  const clearSelection = () => {
    setSelectionStart(null)
    setSelectionEnd(null)
    setEditorContent('')
    setEditingId(null)
  }

  const handleGenerate = async () => {
    const start = selectionStart
    const end = selectionEnd ?? selectionStart
    if (start === null) return

    const selectedLines = []
    for (let i = start; i <= end; i++) {
      if (lines[i]?.trim()) selectedLines.push(lines[i].trim())
    }

    if (!selectedLines.length) return

    setGenerating(true)
    setError('')

    try {
      const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || ''
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/generate-annotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          selectedLines,
          songTitle: song.title,
          artistNames,
          lyricist: song.lyricist,
          singers: song.singers,
          language: song.language,
          songMeaning: song.meaning
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setEditorContent(data.annotation)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    const start = selectionStart
    const end = selectionEnd ?? selectionStart
    if (start === null || !editorContent.trim()) return

    setSaving(true)
    setError('')

    try {
      const url = editingId
        ? `/api/admin/songs/${songId}/annotations/${editingId}`
        : `/api/admin/songs/${songId}/annotations`
      const method = editingId ? 'PUT' : 'POST'

      const token = localStorage.getItem('adminToken')
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          startLine: start,
          endLine: end,
          content: editorContent.trim()
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Save failed')
      }

      // Refresh annotations
      const annRes = await fetch(`/api/admin/songs/${songId}/annotations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAnnotations(await annRes.json())
      clearSelection()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (annotationId) => {
    if (!confirm('Delete this annotation?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/songs/${songId}/annotations/${annotationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Delete failed')

      const annRes = await fetch(`/api/admin/songs/${songId}/annotations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAnnotations(await annRes.json())

      if (editingId === annotationId) clearSelection()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditAnnotation = (ann) => {
    setEditingId(ann.id)
    setSelectionStart(ann.startLine)
    setSelectionEnd(ann.endLine)
    setEditorContent(ann.content)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-red-500">Song not found</p>
      </div>
    )
  }

  const selectedStart = selectionStart
  const selectedEnd = selectionEnd ?? selectionStart

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/songs/${songId}`}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Annotations</h1>
              <p className="text-sm text-slate-500">{song.title}</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lyrics Panel - Left */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Lyrics — Click lines to select range
              </h2>
              <div className="space-y-0">
                {lines.map((line, idx) => {
                  const trimmed = line.trim()
                  const isAnnotated = !!lineAnnotationMap[idx]
                  const isSelected = selectedStart !== null && idx >= selectedStart && idx <= selectedEnd && !isAnnotated

                  if (!trimmed) {
                    return <div key={idx} className="h-3" />
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleLineClick(idx)}
                      className={`flex items-start gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-all select-none ${
                        isAnnotated
                          ? 'bg-emerald-50 border-l-4 border-emerald-400 text-slate-800'
                          : isSelected
                          ? 'bg-amber-50 border-l-4 border-amber-400 text-slate-800'
                          : 'border-l-4 border-transparent hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs text-slate-400 font-mono w-6 text-right pt-0.5 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{trimmed}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Editor Panel - Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                {editingId ? 'Edit Annotation' : 'New Annotation'}
              </h2>

              {selectedStart !== null ? (
                <>
                  <div className="mb-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
                    Lines {selectedStart + 1}–{selectedEnd + 1}:
                    <span className="italic text-slate-700 ml-1">
                      "{lines.slice(selectedStart, selectedEnd + 1).filter(l => l.trim()).join(' / ')}"
                    </span>
                  </div>

                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-y"
                    placeholder="Write your annotation here..."
                  />

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiZap className="w-4 h-4" />
                      {generating ? 'Generating...' : 'Generate with AI'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !editorContent.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition font-medium text-sm flex items-center gap-2"
                    >
                      <FiX className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  Click a lyrics line to start selecting. Click a second line to set the range end.
                </p>
              )}
            </div>

            {/* Existing Annotations */}
            {annotations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Annotations ({annotations.length})
                </h2>
                <div className="space-y-3">
                  {annotations.map((ann) => {
                    const quoted = lines
                      .slice(ann.startLine, ann.endLine + 1)
                      .filter(l => l.trim())
                      .join(' / ')

                    return (
                      <div key={ann.id} className="border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">
                          Lines {ann.startLine + 1}–{ann.endLine + 1}
                        </p>
                        <p className="text-sm italic text-slate-600 mb-2">"{quoted}"</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{ann.content}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditAnnotation(ann)}
                            className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <FiEdit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                          >
                            <FiTrash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
