'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiGlobe, FiChevronRight, FiMusic } from 'react-icons/fi'

function LanguageCard({ category, index }) {
  // Light pastel colors for light mode, darker muted colors for dark mode
  const colors = [
    { light: 'bg-orange-100', dark: 'dark:bg-orange-900/40', accent: 'text-orange-600 dark:text-orange-400' },
    { light: 'bg-emerald-100', dark: 'dark:bg-emerald-900/40', accent: 'text-emerald-600 dark:text-emerald-400' },
    { light: 'bg-blue-100', dark: 'dark:bg-blue-900/40', accent: 'text-blue-600 dark:text-blue-400' },
    { light: 'bg-purple-100', dark: 'dark:bg-purple-900/40', accent: 'text-purple-600 dark:text-purple-400' },
    { light: 'bg-pink-100', dark: 'dark:bg-pink-900/40', accent: 'text-pink-600 dark:text-pink-400' },
    { light: 'bg-teal-100', dark: 'dark:bg-teal-900/40', accent: 'text-teal-600 dark:text-teal-400' },
    { light: 'bg-amber-100', dark: 'dark:bg-amber-900/40', accent: 'text-amber-600 dark:text-amber-400' },
    { light: 'bg-indigo-100', dark: 'dark:bg-indigo-900/40', accent: 'text-indigo-600 dark:text-indigo-400' },
  ]

  const color = colors[index % colors.length]

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl aspect-square ${color.light} ${color.dark} shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50`}
    >
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5">
        <div className={`w-10 h-10 rounded-xl bg-white/60 dark:bg-slate-800/60 flex items-center justify-center ${color.accent}`}>
          <FiGlobe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-slate-800 dark:text-white font-bold text-lg sm:text-xl mb-1">{category.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{category._count?.songs || 0} songs</p>
        </div>
      </div>
    </Link>
  )
}

export default function LanguagesPageClient() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/public/categories')
      const data = await res.json()
      // API returns array directly, not { categories: [...] }
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">Languages</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FiGlobe className="w-8 h-8 text-primary" />
            Browse by Language
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Explore songs in your favorite language</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <LanguageCard key={category.id} category={category} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiMusic className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No languages found</p>
          </div>
        )}
      </div>
    </div>
  )
}
