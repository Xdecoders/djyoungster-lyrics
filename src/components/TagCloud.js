'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiTag } from 'react-icons/fi'

export default function TagCloud({ limit = 20 }) {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch(`/api/public/tags?limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <FiTag className="w-5 h-5 text-primary" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
        <FiTag className="w-5 h-5 text-primary" />
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors capitalize"
          >
            #{tag.name}
            <span className="ml-1 text-xs text-slate-400 dark:text-slate-500 normal-case">({tag.count})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
