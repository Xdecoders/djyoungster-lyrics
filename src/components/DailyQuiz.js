'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FiPlay, FiClock, FiUsers, FiChevronRight, FiCheck, FiX,
  FiShare2, FiArrowLeft, FiAward, FiMusic, FiZap, FiMic,
  FiEdit2, FiInfo, FiMoon, FiAlertCircle, FiTarget, FiTrendingUp
} from 'react-icons/fi'

// ─── Helpers ───────────────────────────────────────────────────────────────

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('quizSessionId')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('quizSessionId', id)
  }
  return id
}

function getPlayedKey(language) {
  const today = new Date().toISOString().split('T')[0]
  return `quiz_played_${language}_${today}`
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function msToMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}

function CountdownToMidnight() {
  const [left, setLeft] = useState(msToMidnight())
  useEffect(() => {
    const t = setInterval(() => setLeft(msToMidnight()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return <span className="tabular-nums">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
}

function motivationalMsg(score) {
  if (score === 5) return { msg: 'Perfect score', sub: 'You are a true lyrics legend',   accent: 'text-emerald-600' }
  if (score === 4) return { msg: 'Outstanding',   sub: 'You really know your music',      accent: 'text-emerald-500' }
  if (score === 3) return { msg: 'Good effort',   sub: 'Keep listening, keep improving',  accent: 'text-amber-500'   }
  if (score === 2) return { msg: 'Not bad',       sub: 'Come back stronger tomorrow',     accent: 'text-orange-500'  }
  return               { msg: 'Keep going',    sub: 'Every great fan starts somewhere', accent: 'text-slate-500'   }
}

function buildScoreLine(answers) {
  return answers.map(a => a.isCorrect ? '[+]' : '[-]').join(' ')
}

function CountUp({ target, duration = 900 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val}</>
}

// Small flame icon via path
function FlameIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1c-3.5 4-5 7-5 10a5 5 0 0010 0c0-3-1.5-6-5-10zm-3 13.5a3 3 0 006 0c0-1.5-.8-2.8-3-5-2.2 2.2-3 3.5-3 5z"/>
    </svg>
  )
}

// Answer dot: solid square style
function Dot({ correct, size = 'md' }) {
  const sz = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
  return (
    <div className={`${sz} rounded-lg flex items-center justify-center ${correct ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      {correct
        ? <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        : <FiX    className="w-3 h-3 text-white/70" strokeWidth={3} />
      }
    </div>
  )
}

// Rank number badge
function RankBadge({ rank }) {
  const cls =
    rank === 1 ? 'bg-amber-400 text-white' :
    rank === 2 ? 'bg-slate-400 text-white' :
    rank === 3 ? 'bg-amber-700/80 text-white' :
                 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${cls}`}>
      {rank}
    </span>
  )
}

// ─── Screen 1: Teaser ──────────────────────────────────────────────────────

const QUESTION_TYPES = [
  { label: 'Complete the Lyric', Icon: FiEdit2 },
  { label: 'Which Song?',        Icon: FiMusic },
  { label: 'Which Artist?',      Icon: FiMic   },
]

function TeaserScreen({ language, playCount, onStart }) {
  const label = language.charAt(0).toUpperCase() + language.slice(1)

  return (
    <div className="p-6 sm:p-8 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
          <FiZap className="w-3 h-3" />
          Daily Challenge
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight mb-2">
          {label}<br />
          <span className="text-primary">Lyrics</span> Quiz
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-3">
          5 questions · 30 seconds each
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{playCount}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <FiUsers className="w-3 h-3" /> Played today
          </p>
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            <CountdownToMidnight />
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <FiMoon className="w-3 h-3" /> Until reset
          </p>
        </div>
      </div>

      {/* Question types */}
      <div className="flex flex-col gap-2 mb-8">
        {QUESTION_TYPES.map(({ label: l, Icon }, i) => (
          <div key={l} className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{l}</span>
            <span className="ml-auto text-xs text-slate-300 dark:text-slate-600 font-medium">Q{[1,3,5][i] || i+1}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base shadow-lg"
      >
        <FiPlay className="w-4 h-4" />
        Start Quiz
      </button>
    </div>
  )
}

// ─── Screen 2: Question ────────────────────────────────────────────────────

const TYPE_LABELS = {
  complete_lyric: 'Complete the Lyric',
  which_song:     'Which Song?',
  which_artist:   'Which Artist?',
}

// No purple — using slate, emerald, amber
const TYPE_ACCENT = {
  complete_lyric: { bar: 'bg-slate-800 dark:bg-slate-700', border: 'border-slate-400 dark:border-slate-500', lyricBg: 'bg-slate-50 dark:bg-slate-800/50',   dot: 'bg-slate-700',  Icon: FiEdit2 },
  which_song:     { bar: 'bg-emerald-500',                 border: 'border-emerald-400',                      lyricBg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500', Icon: FiMusic },
  which_artist:   { bar: 'bg-amber-500',                   border: 'border-amber-400',                        lyricBg: 'bg-amber-50 dark:bg-amber-900/20',     dot: 'bg-amber-500',   Icon: FiMic   },
}

function QuestionScreen({ question, questionNum, total, onAnswer, timeLeft, answers }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function handleSelect(idx) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    setTimeout(() => onAnswer(idx), 1100)
  }

  useEffect(() => {
    if (timeLeft === 0 && !revealed) {
      setRevealed(true)
      setTimeout(() => onAnswer(-1), 1100)
    }
  }, [timeLeft])

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [question.id])

  const timerPct = (timeLeft / 30) * 100
  const isUrgent = timeLeft <= 8
  const accent = TYPE_ACCENT[question.type] || TYPE_ACCENT.which_song
  const TypeIcon = accent.Icon

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700/50">
        {/* Progress + timer */}
        <div className="flex items-center gap-3 mb-4">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 flex-1">
            {Array.from({ length: total }).map((_, i) => {
              const past = answers[i]
              const isCurrent = i === questionNum - 1
              return (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < answers.length
                      ? past?.isCorrect
                        ? 'bg-emerald-500 flex-1'
                        : 'bg-slate-300 dark:bg-slate-600 flex-1'
                      : isCurrent
                        ? `${accent.dot} flex-1`
                        : 'bg-slate-200 dark:bg-slate-700 w-4'
                  }`}
                />
              )
            })}
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums">{questionNum}/{total}</span>
          {/* Timer */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="2.5" className="dark:stroke-slate-700" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={isUrgent ? '#ef4444' : '#10b981'}
                strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - timerPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-black ${isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Type label */}
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${accent.bar}`} />
          <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{TYPE_LABELS[question.type]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        {/* Lyric */}
        <div className={`mb-5 pl-4 border-l-2 rounded-r-xl py-3 pr-3 ${accent.border} ${accent.lyricBg}`}>
          <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg font-semibold italic leading-relaxed whitespace-pre-line">
            {question.lyricSnippet}
          </p>
        </div>

        {/* Question */}
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          {question.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {question.options.map((opt, idx) => {
            const isCorrectOpt   = idx === question.correctIndex
            const isSelectedWrong = idx === selected && selected !== question.correctIndex

            let base = 'w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 '

            if (!revealed) {
              base += 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            } else if (isCorrectOpt) {
              base += 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
            } else if (isSelectedWrong) {
              base += 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
            } else {
              base += 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 opacity-40'
            }

            const letterCls = revealed
              ? isCorrectOpt   ? 'bg-emerald-500 text-white border-emerald-500'
              : isSelectedWrong ? 'bg-red-400 text-white border-red-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-slate-400'

            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed} className={`group ${base}`}>
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black flex-shrink-0 transition-all duration-200 ${letterCls}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`flex-1 text-sm font-medium ${
                  revealed && isCorrectOpt    ? 'text-emerald-700 dark:text-emerald-300' :
                  revealed && isSelectedWrong ? 'text-red-600 dark:text-red-400' :
                  'text-slate-700 dark:text-slate-200'
                }`}>
                  {opt}
                </span>
                {revealed && isCorrectOpt    && <FiCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={3} />}
                {revealed && isSelectedWrong && <FiX    className="w-4 h-4 text-red-400   flex-shrink-0" strokeWidth={3} />}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {revealed && question.explanation && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
            <span className="leading-relaxed">{question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen 3: Name Entry ──────────────────────────────────────────────────

function NameEntryScreen({ score, total, answers, onSubmit, onSkip, loading }) {
  const [name, setName] = useState('')
  const { msg, sub, accent } = motivationalMsg(score)
  const pct = Math.round((score / total) * 100)

  return (
    <div className="p-6 sm:p-8 flex flex-col items-center">
      {/* Score ring */}
      <div className="relative w-32 h-32 mb-6">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" className="dark:stroke-slate-700" />
          <circle
            cx="64" cy="64" r="54" fill="none"
            stroke="#10b981" strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
            <CountUp target={score} />
          </span>
          <span className="text-sm text-slate-400 font-medium">/{total}</span>
        </div>
      </div>

      {/* Message */}
      <p className={`text-2xl font-black mb-1 ${accent}`}>{msg}</p>
      <p className="text-sm text-slate-400 mb-5">{sub}</p>

      {/* Answer dots */}
      <div className="flex gap-2 mb-8">
        {answers.map((a, i) => <Dot key={i} correct={a.isCorrect} />)}
      </div>

      {/* Name input */}
      <div className="w-full max-w-xs">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Your name for the leaderboard
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 20))}
          placeholder="Enter your name..."
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white text-sm transition-colors mb-3"
          maxLength={20}
        />
        <button
          onClick={() => onSubmit(name.trim())}
          disabled={loading}
          className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mb-2 flex items-center justify-center gap-2"
        >
          <FiAward className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Submit to Leaderboard'}
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          Skip — stay anonymous
        </button>
      </div>
    </div>
  )
}

// ─── Screen 4: Results ─────────────────────────────────────────────────────

function ResultsScreen({ score, total, timeTaken, streak, rank, displayName, language, leaderboard, totalPlayers, quizSongs, answers, onBack }) {
  const [rows, setRows] = useState([])
  const [copied, setCopied] = useState(false)
  const label = language.charAt(0).toUpperCase() + language.slice(1)
  const { msg, sub, accent } = motivationalMsg(score)
  const pct = Math.round((score / total) * 100)

  useEffect(() => {
    leaderboard.forEach((_, i) => {
      setTimeout(() => setRows(prev => [...prev, i]), i * 60 + 200)
    })
  }, [leaderboard])

  function shareScore() {
    const scoreLine = answers?.length ? buildScoreLine(answers) : Array.from({ length: total }, (_, i) => i < score ? '[+]' : '[-]').join(' ')
    const streakLine = streak > 1 ? `  |  Streak: ${streak} days` : ''
    const text = [
      `${label} Lyrics Quiz — DJYoungster`,
      ``,
      scoreLine,
      `Score: ${score}/${total}  |  Time: ${formatTime(timeTaken)}${streakLine}`,
      ``,
      `Think you know your lyrics better?`,
      `djyoungster.com/quiz`,
    ].join('\n')

    if (navigator.share) {
      navigator.share({ title: `${label} Lyrics Quiz`, text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col">
      {/* Score summary */}
      <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-6">
          {/* Score ring */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-700" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                <CountUp target={score} />
              </span>
              <span className="text-xs text-slate-400">/{total}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`text-xl font-black ${accent} mb-0.5`}>{msg}</p>
            <p className="text-sm text-slate-400 mb-3">{sub}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
              {displayName && (
                <span className="font-semibold text-slate-700 dark:text-slate-200">{displayName}</span>
              )}
              <span className="flex items-center gap-1">
                <FiTarget className="w-3 h-3" /> Rank #{rank}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="w-3 h-3" /> {formatTime(timeTaken)}
              </span>
              {streak > 1 && (
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <FlameIcon className="w-3 h-3" /> {streak} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Answer dots */}
        {answers?.length > 0 && (
          <div className="flex gap-1.5 mt-5">
            {answers.map((a, i) => <Dot key={i} correct={a.isCorrect} size="sm" />)}
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">
        {/* Share */}
        <button
          onClick={shareScore}
          className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        >
          <FiShare2 className="w-4 h-4" />
          {copied ? 'Copied to clipboard' : 'Share your score'}
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Score',   value: `${score}/${total}`, Icon: FiTarget      },
            { label: 'Time',    value: formatTime(timeTaken), Icon: FiClock      },
            { label: 'Players', value: totalPlayers,          Icon: FiTrendingUp },
          ].map(({ label: l, value, Icon }) => (
            <div key={l} className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <Icon className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-base font-black text-slate-800 dark:text-white">{value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiAward className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Leaderboard</h3>
            <span className="text-xs text-slate-400 ml-1">Today · Top {Math.min(10, leaderboard.length)}</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No entries yet — be the first</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaderboard.map((entry, i) => {
                  const isUser  = entry.sessionId !== null
                  const visible = rows.includes(i)
                  return (
                    <div
                      key={i}
                      style={{
                        opacity:    visible ? 1 : 0,
                        transform:  visible ? 'translateY(0)' : 'translateY(6px)',
                        transition: `opacity 0.25s ease ${i * 35}ms, transform 0.25s ease ${i * 35}ms`,
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 ${isUser ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-800/20'}`}
                    >
                      <RankBadge rank={entry.rank} />
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-medium truncate">
                        {entry.name}
                        {isUser && <span className="ml-2 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold align-middle">YOU</span>}
                      </span>
                      <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{entry.score}/{total}</span>
                      <span className="text-xs text-slate-400 tabular-nums w-12 text-right">{formatTime(entry.timeTaken)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Songs from quiz */}
        {quizSongs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiMusic className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Songs in today's quiz</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              {quizSongs.map(song => (
                <Link
                  key={song.slug}
                  href={`/song/${song.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition group border border-slate-100 dark:border-slate-700/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {song.coverImage
                      ? <img src={song.coverImage} alt={song.title} className="w-8 h-8 rounded-lg object-cover" />
                      : <FiMusic className="w-3.5 h-3.5 text-slate-400" />
                    }
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition truncate flex-1">
                    {song.title}
                  </span>
                  <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Next quiz */}
        <div className="flex items-center justify-between py-3.5 px-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40 text-sm">
          <span className="text-slate-400 flex items-center gap-1.5">
            <FiMoon className="w-3.5 h-3.5" /> Next quiz
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            <CountdownToMidnight />
          </span>
        </div>

        <button onClick={onBack} className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition py-1">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    </div>
  )
}

// ─── Screen 5: Already Played ──────────────────────────────────────────────

function AlreadyPlayedScreen(props) {
  return <ResultsScreen {...props} answers={[]} />
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function DailyQuiz({ language = 'hindi', onClose }) {
  const [screen, setScreen]           = useState('loading')
  const [quiz, setQuiz]               = useState(null)
  const [currentQ, setCurrentQ]       = useState(0)
  const [answers, setAnswers]         = useState([])
  const [timeLeft, setTimeLeft]       = useState(30)
  const [totalTime, setTotalTime]     = useState(0)
  const [qStartTime, setQStartTime]   = useState(Date.now())
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submission, setSubmission]   = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [quizSongs, setQuizSongs]     = useState([])
  const [error, setError]             = useState(null)
  const sessionId = useRef(typeof window !== 'undefined' ? getOrCreateSessionId() : '').current
  const timerRef  = useRef(null)

  useEffect(() => { loadQuiz() }, [language])

  async function loadQuiz() {
    setScreen('loading')
    setError(null)
    try {
      const played = typeof window !== 'undefined' ? localStorage.getItem(getPlayedKey(language)) : null
      const res  = await fetch(`/api/public/quiz?language=${language}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load quiz')
      setQuiz(data)

      if (played) {
        const saved = JSON.parse(played)
        setSubmission(saved)
        await loadLeaderboard(data.quizId, saved)
        setScreen('already-played')
      } else {
        setScreen('teaser')
      }
    } catch (e) {
      setError(e.message || "Could not load today's quiz.")
      setScreen('error')
    }
  }

  async function loadLeaderboard(quizId) {
    try {
      const res  = await fetch(`/api/public/quiz/leaderboard?language=${language}&sessionId=${sessionId}`)
      if (!res.ok) return
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setTotalPlayers(data.totalPlayers || 0)
      const songs = quiz?.questions
        ?.filter((q, i, arr) => arr.findIndex(x => x.songSlug === q.songSlug) === i && q.songSlug)
        .map(q => ({ slug: q.songSlug, title: q.songTitle, coverImage: null }))
        .slice(0, 5) || []
      setQuizSongs(songs)
    } catch {}
  }

  function startTimer() {
    clearInterval(timerRef.current)
    setTimeLeft(30)
    setQStartTime(Date.now())
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  function startQuiz() {
    setCurrentQ(0); setAnswers([]); setTotalTime(0)
    setScreen('question'); startTimer()
  }

  function handleAnswer(selectedIdx) {
    clearInterval(timerRef.current)
    const elapsed    = Math.round((Date.now() - qStartTime) / 1000)
    setTotalTime(t => t + elapsed)
    const q          = quiz.questions[currentQ]
    const isCorrect  = selectedIdx === q.correctIndex
    const newAnswers = [...answers, { questionId: q.id, selectedIndex: selectedIdx, isCorrect }]
    setAnswers(newAnswers)

    if (currentQ + 1 >= quiz.questions.length) {
      setTimeout(() => setScreen('name-entry'), 500)
    } else {
      setTimeout(() => { setCurrentQ(q => q + 1); startTimer() }, 500)
    }
  }

  async function handleSubmit(displayName) {
    setSubmitLoading(true)
    const score = answers.filter(a => a.isCorrect).length
    try {
      const res  = await fetch('/api/public/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.quizId, sessionId, displayName: displayName || null, score, timeTaken: totalTime }),
      })
      const data = await res.json()
      const result = { score, timeTaken: totalTime, rank: data.rank || 1, streak: data.streak || 1, displayName: displayName || null }
      setSubmission(result)
      if (typeof window !== 'undefined') localStorage.setItem(getPlayedKey(language), JSON.stringify(result))
      await loadLeaderboard(quiz.quizId, result)
      setScreen('results')
    } catch {
      const score = answers.filter(a => a.isCorrect).length
      setSubmission({ score, timeTaken: totalTime, rank: '?', streak: 1, displayName: displayName || null })
      setScreen('results')
    } finally {
      setSubmitLoading(false)
    }
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  if (screen === 'loading') return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Loading...</p>
    </div>
  )

  if (screen === 'error') return (
    <div className="text-center py-14 px-6">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <FiAlertCircle className="w-6 h-6 text-slate-400" />
      </div>
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Quiz unavailable</p>
      <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">{error}</p>
      <button onClick={loadQuiz} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition">
        Try again
      </button>
    </div>
  )

  if (screen === 'teaser')
    return <TeaserScreen language={language} playCount={quiz?.playCount || 0} onStart={startQuiz} />

  if (screen === 'question' && quiz) {
    const q = quiz.questions[currentQ]
    return <QuestionScreen key={q.id} question={q} questionNum={currentQ + 1} total={quiz.questions.length} onAnswer={handleAnswer} timeLeft={timeLeft} answers={answers} />
  }

  if (screen === 'name-entry') {
    const score = answers.filter(a => a.isCorrect).length
    return <NameEntryScreen score={score} total={quiz.questions.length} answers={answers} onSubmit={handleSubmit} onSkip={() => handleSubmit(null)} loading={submitLoading} />
  }

  if (screen === 'results' && submission)
    return <ResultsScreen score={submission.score} total={quiz?.questions?.length || 5} timeTaken={submission.timeTaken} streak={submission.streak} rank={submission.rank} displayName={submission.displayName} language={language} leaderboard={leaderboard} totalPlayers={totalPlayers} quizSongs={quizSongs} answers={answers} onBack={onClose || (() => {})} />

  if (screen === 'already-played' && submission)
    return <AlreadyPlayedScreen score={submission.score} total={quiz?.questions?.length || 5} timeTaken={submission.timeTaken} streak={submission.streak} rank={submission.rank} displayName={submission.displayName} language={language} leaderboard={leaderboard} totalPlayers={totalPlayers} quizSongs={quizSongs} onBack={onClose || (() => {})} />

  return null
}
