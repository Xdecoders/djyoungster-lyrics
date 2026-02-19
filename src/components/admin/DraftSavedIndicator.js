'use client'

import { FiCheck } from 'react-icons/fi'

export default function DraftSavedIndicator({ show }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-emerald-600 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <FiCheck className="w-3.5 h-3.5" />
      Draft saved
    </span>
  )
}
