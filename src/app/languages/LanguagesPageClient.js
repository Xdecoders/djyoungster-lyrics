'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiGlobe, FiChevronRight, FiMusic } from 'react-icons/fi'

function LanguageCard({ category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
    >
      {category.imageUrl && (
        <Image src={category.imageUrl} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {!category.imageUrl && (
        <div className="absolute top-4 left-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <FiGlobe className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
          <h3 className="font-semibold text-white text-sm">{category.name}</h3>
          <p className="text-white/70 text-xs mt-0.5">{category._count?.songs || 0} songs</p>
        </div>
      </div>
    </Link>
  )
}

export default function LanguagesPageClient({ initialData }) {
  // Use initial data from server - no loading state needed
  const [categories] = useState(initialData?.categories || [])

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900">
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

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
