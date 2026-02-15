'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const cities = [
  // India
  'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai',
  'Kolkata', 'Jaipur', 'Chandigarh', 'Indore', 'Lucknow', 'Amritsar',
  'Ahmedabad', 'Surat', 'Nagpur', 'Patna', 'Bhopal', 'Ludhiana',
  'Kochi', 'Coimbatore', 'Guwahati', 'Vizag', 'Dehradun', 'Ranchi',
  'Thiruvananthapuram', 'Mysore', 'Noida', 'Gurgaon', 'Vadodara', 'Jalandhar',
  // International
  'London', 'New York', 'Toronto', 'Dubai', 'Sydney', 'Singapore',
  'Los Angeles', 'San Francisco', 'Chicago', 'Houston', 'Vancouver',
  'Melbourne', 'Auckland', 'Kuala Lumpur', 'Doha', 'Abu Dhabi',
  'Birmingham', 'Manchester', 'Brampton', 'Surrey',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateMessage(song) {
  const city = pick(cities)
  const type = Math.floor(Math.random() * 5)

  switch (type) {
    case 0:
      return { text: `Someone from ${city} just read "${song.title}" lyrics`, emoji: '👀' }
    case 1: {
      const views = song.views || 0
      const rounded = views >= 1000 ? `${Math.round(views / 1000) * 1000}+` : `${views}+`
      return { text: `"${song.title}" just crossed ${rounded} reads!`, emoji: '🔥' }
    }
    case 2:
      return { text: `Someone from ${city} rated "${song.title}" ⭐⭐⭐⭐`, emoji: '' }
    case 3: {
      const readsLastHour = 20 + Math.floor(Math.random() * 80)
      return { text: `"${song.title}" is trending — ${readsLastHour} reads in last hour`, emoji: '📈' }
    }
    case 4:
      return { text: `"${song.title}" lyrics just added — check it out!`, emoji: '✨' }
    default:
      return { text: `Someone from ${city} just read "${song.title}" lyrics`, emoji: '👀' }
  }
}

// Deterministic initial message for SSR — no randomness
function getInitialMessage(songs) {
  if (!songs?.length) return null
  const song = songs[0]
  const views = song.views || 0
  const rounded = views >= 1000 ? `${Math.round(views / 1000) * 1000}+` : `${views}+`
  return {
    text: `"${song.title}" just crossed ${rounded} reads!`,
    emoji: '🔥',
    slug: song.slug,
  }
}

export default function LiveTicker({ songs }) {
  const initial = getInitialMessage(songs)
  const [current, setCurrent] = useState(initial)
  const [visible, setVisible] = useState(true)

  const nextMessage = useCallback(() => {
    if (!songs || songs.length === 0) return null
    const song = pick(songs)
    const msg = generateMessage(song)
    return { ...msg, slug: song.slug }
  }, [songs])

  useEffect(() => {
    if (!songs?.length) return

    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(nextMessage())
        setVisible(true)
      }, 300)
    }, 3500)

    return () => clearInterval(interval)
  }, [songs, nextMessage])

  if (!current) return null

  return (
    <div className="flex items-center justify-center -mt-6 mb-8 px-4 min-h-[3.5rem] sm:min-h-0">
      <Link
        href={`/song/${current.slug}`}
        className={`ticker-message flex items-center gap-2 px-4 py-1.5 rounded-xl sm:rounded-full bg-gradient-to-r from-primary to-emerald-600 shadow-md hover:shadow-lg transition-shadow text-sm max-w-[92vw] sm:max-w-xl ${visible ? 'ticker-visible' : 'ticker-hidden'}`}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span className="font-semibold text-white text-xs uppercase tracking-wide shrink-0">Live</span>
        <span className="text-white/90 min-w-0 line-clamp-2 sm:line-clamp-1">
          {current.text}
        </span>
        {current.emoji && <span className="shrink-0">{current.emoji}</span>}
      </Link>
    </div>
  )
}
