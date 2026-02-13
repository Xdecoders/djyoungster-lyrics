'use client'

export default function StarRating({ averageRating = 0, totalRatings = 0, size = 'sm', className = '' }) {
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

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${starSize} ${
              star <= Math.round(averageRating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className={`${textSize} text-slate-500 dark:text-slate-400`}>
        {totalRatings > 0
          ? `${averageRating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`
          : 'No ratings yet'}
      </span>
    </div>
  )
}
