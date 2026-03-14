'use client'

import { useState, useEffect } from 'react'
import DailyQuiz from '@/components/DailyQuiz'
import { FiZap } from 'react-icons/fi'
import { useRouter, useSearchParams } from 'next/navigation'

const LANGUAGES = [
  { label: 'Hindi', value: 'hindi' },
  { label: 'Punjabi', value: 'punjabi' },
  { label: 'English', value: 'english' },
  { label: 'Tamil', value: 'tamil' },
  { label: 'Telugu', value: 'telugu' },
]

const VALID_LANGS = new Set(LANGUAGES.map(l => l.value))

export default function QuizPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const langParam = searchParams.get('language')
  const [language, setLanguage] = useState(
    VALID_LANGS.has(langParam) ? langParam : 'hindi'
  )

  // Sync if param changes (e.g. browser back/forward)
  useEffect(() => {
    if (langParam && VALID_LANGS.has(langParam)) setLanguage(langParam)
  }, [langParam])

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
            <FiZap className="w-4 h-4" />
            Daily Challenge
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
            Lyrics Quiz
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Test your knowledge every day. New quiz at midnight.</p>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                language === lang.value
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary border border-slate-200 dark:border-slate-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Quiz card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 overflow-hidden border border-slate-200 dark:border-slate-700">
          <DailyQuiz
            key={language}
            language={language}
            onClose={() => router.back()}
          />
        </div>
      </div>
    </div>
  )
}
