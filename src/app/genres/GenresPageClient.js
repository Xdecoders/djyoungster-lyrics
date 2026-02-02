'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiTag, FiChevronRight, FiMusic } from 'react-icons/fi'

function GenreCard({ genre, index }) {
  const colors = [
    'from-rose-500 to-pink-500',
    'from-primary to-emerald-600',
    'from-blue-500 to-cyan-500',
    'from-amber-500 to-orange-500',
    'from-purple-500 to-violet-500',
    'from-teal-500 to-emerald-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-blue-500',
  ]

  return (
    <Link
      href={`/genre/${genre.slug}`}
      className="group relative overflow-hidden rounded-xl aspect-[3/2] bg-gradient-to-br"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]} transition-transform duration-300 group-hover:scale-105`}></div>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
      <div className="relative h-full flex flex-col justify-end p-3 sm:p-4">
        <h3 className="text-white font-semibold text-sm sm:text-base">{genre.name}</h3>
      </div>
    </Link>
  )
}

export default function GenresPageClient({ initialData }) {
  // Use initial data from server - no loading state needed
  const [genres] = useState(initialData?.genres || [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li><Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-primary">Home</Link></li>
          <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          <li className="text-slate-800 dark:text-white font-medium">All Genres</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FiTag className="w-8 h-8 text-primary" />
            Browse by Genre
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Explore songs by your favorite genres</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {genres.map((genre, index) => (
            <GenreCard key={genre.id} genre={genre} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
