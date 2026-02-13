'use client'

import { useState, useEffect } from 'react'

export default function InteractiveRating({ entityType, entitySlug, initialRating = 0, initialTotal = 0, size = 'sm', className = '' }) {
  const [averageRating, setAverageRating] = useState(initialRating)
  const [totalRatings, setTotalRatings] = useState(initialTotal)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textClasses = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const starSize = sizeClasses[size] || sizeClasses.sm
  const textSize = textClasses[size] || textClasses.sm

  useEffect(() => {
    // Fetch current rating state
    fetch(`/api/public/${entityType}s/${entitySlug}/rate`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setAverageRating(data.averageRating)
          setTotalRatings(data.totalRatings)
          setUserRating(data.userRating || 0)
        }
      })
      .catch(() => {})
  }, [entityType, entitySlug])

  const handleRate = async (rating) => {
    if (submitting) return
    setSubmitting(true)

    // Optimistic update
    const prevAvg = averageRating
    const prevTotal = totalRatings
    const prevUser = userRating
    setUserRating(rating)

    try {
      const res = await fetch(`/api/public/${entityType}s/${entitySlug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (res.ok) {
        const data = await res.json()
        setAverageRating(data.averageRating)
        setTotalRatings(data.totalRatings)
        setUserRating(data.userRating)
      } else {
        // Revert on error
        setAverageRating(prevAvg)
        setTotalRatings(prevTotal)
        setUserRating(prevUser)
      }
    } catch {
      setAverageRating(prevAvg)
      setTotalRatings(prevTotal)
      setUserRating(prevUser)
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoverRating || userRating || Math.round(averageRating)

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} cursor-pointer transition-colors ${
              star <= displayRating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600'
            } ${star <= (hoverRating || userRating) ? 'scale-110' : ''}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRate(star)}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className={`${textSize} text-slate-500 dark:text-slate-400`}>
        {totalRatings > 0
          ? `${averageRating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`
          : 'Rate this'}
      </span>
    </div>
  )
}
