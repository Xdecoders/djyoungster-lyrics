'use client'

import { FiRefreshCw, FiX } from 'react-icons/fi'

function getRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function DraftRestorationBanner({ show, timestamp, onRestore, onDiscard }) {
  if (!show) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-amber-800 text-sm">
        You have an unsaved draft from <span className="font-medium">{getRelativeTime(timestamp)}</span>
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onRestore}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium flex items-center gap-1.5"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          Restore
        </button>
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 bg-white text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition text-sm font-medium flex items-center gap-1.5"
        >
          <FiX className="w-3.5 h-3.5" />
          Discard
        </button>
      </div>
    </div>
  )
}
