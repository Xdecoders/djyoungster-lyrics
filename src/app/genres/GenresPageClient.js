'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiTag, FiChevronRight, FiMusic } from 'react-icons/fi'

function GenreCard({ genre }) {
  return (
    <Link
      href={`/genre/${genre.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
    >
      {genre.imageUrl && (
        <Image src={genre.imageUrl} alt={`${genre.name} songs and lyrics`} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {!genre.imageUrl && (
        <div className="absolute top-4 left-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <FiTag className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm">{genre.name}</h3>
        </div>
      </div>
    </Link>
  )
}

export default function GenresPageClient({ initialData }) {
  // Use initial data from server - no loading state needed
  const [genres] = useState(initialData?.genres || [])

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres.map((genre, index) => (
            <GenreCard key={genre.id} genre={genre} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
