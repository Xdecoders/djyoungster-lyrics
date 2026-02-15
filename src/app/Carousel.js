'use client'

import { useRef, useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Carousel({ children }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative group/carousel">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 transition opacity-0 group-hover/carousel:opacity-100 -translate-x-1/2"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/20 transition opacity-0 group-hover/carousel:opacity-100 translate-x-1/2"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
