'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiZap, FiRefreshCw, FiTrash2, FiUsers, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const LANGUAGES = ['hindi', 'punjabi', 'english', 'tamil', 'telugu']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function LanguageCard({ language, quiz, songCount, onDelete, deleting }) {
  const [expanded, setExpanded] = useState(false)
  const hasQuiz = !!quiz
  const canGenerate = songCount >= 5

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasQuiz ? 'bg-emerald-100' : canGenerate ? 'bg-amber-100' : 'bg-red-100'}`}>
            {hasQuiz
              ? <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              : <FiAlertCircle className={`w-5 h-5 ${canGenerate ? 'text-amber-500' : 'text-red-500'}`} />
            }
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 capitalize">{language}</h3>
            <p className="text-xs text-slate-500">
              {songCount} eligible songs
              {songCount < 5 && <span className="text-red-500 ml-1">(need at least 5)</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {hasQuiz && (
            <>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{quiz._count?.submissions ?? 0}</p>
                <p className="text-[10px] text-slate-400">played</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{quiz.questions?.length ?? 0}</p>
                <p className="text-[10px] text-slate-400">questions</p>
              </div>
              <button
                onClick={() => setExpanded(e => !e)}
                className="p-2 text-slate-400 hover:text-slate-600 transition"
                title="Toggle questions"
              >
                {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDelete(quiz.id)}
                disabled={deleting}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete quiz (allows regeneration)"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {!hasQuiz && canGenerate && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">
              Will auto-generate on first visit
            </span>
          )}
          {!hasQuiz && !canGenerate && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg font-medium">
              Not enough songs
            </span>
          )}
        </div>
      </div>

      {/* Expanded questions list */}
      {hasQuiz && expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Questions</p>
          <div className="space-y-3">
            {quiz.questions?.map((q, i) => (
              <div key={q.id} className="text-sm">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary mr-2">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-600">{q.question}</span>
                    {q.songTitle && (
                      <p className="text-xs text-slate-400 mt-0.5">Song: {q.songTitle}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminQuizPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg] = useState(null)

  const authHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin/login'); return }
    loadData()
  }, [date])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/quiz?date=${date}`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Failed to load quiz data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(quizId) {
    if (!confirm('Delete this quiz? It will be auto-regenerated on the next visit to /quiz.')) return
    setDeleting(quizId)
    try {
      const res = await fetch(`/api/admin/quiz?id=${quizId}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error()
      setMsg('Quiz deleted. It will regenerate automatically.')
      loadData()
    } catch {
      setMsg('Failed to delete quiz.')
    } finally {
      setDeleting(null)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  // Build map: language -> quiz
  const quizMap = {}
  data?.quizzes?.forEach(q => { quizMap[q.language] = q })

  const songCountMap = {}
  data?.songCounts?.forEach(s => { songCountMap[s.language] = s.songCount })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Quiz</h1>
            <p className="text-sm text-slate-500">Manage and monitor daily lyric quizzes</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-600">Date:</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <span className="text-xs text-slate-400">Quizzes are generated daily per language</span>
      </div>

      {/* Toast */}
      {msg && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          {msg}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-slate-500">{error}</div>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{data?.quizzes?.length ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Quizzes Generated</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">
                {data?.quizzes?.reduce((sum, q) => sum + (q._count?.submissions ?? 0), 0) ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total Plays Today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">
                {data?.songCounts?.filter(s => s.songCount >= 5).length ?? 0}
                <span className="text-lg text-slate-400">/{LANGUAGES.length}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Languages Ready</p>
            </div>
          </div>

          {/* Language cards */}
          <div className="space-y-4">
            {LANGUAGES.map(lang => (
              <LanguageCard
                key={lang}
                language={lang}
                quiz={quizMap[lang] ?? null}
                songCount={songCountMap[lang] ?? 0}
                onDelete={handleDelete}
                deleting={deleting === quizMap[lang]?.id}
              />
            ))}
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">How it works</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Quizzes are auto-generated when the first user visits <code className="bg-slate-200 px-1 rounded">/quiz</code> each day.</li>
              <li>Each language needs at least 5 published songs with lyrics in its category.</li>
              <li>Delete a quiz to force-regenerate it (e.g. after adding more songs).</li>
              <li>Submissions are preserved even if the quiz is regenerated (they reference the old quiz ID).</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
