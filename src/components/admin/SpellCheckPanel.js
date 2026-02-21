'use client'

import { FiX, FiAlertCircle } from 'react-icons/fi'

export default function SpellCheckPanel({
  suggestions,
  checking,
  done,
  error,
  onApply,
  onDismiss,
  onClear
}) {
  if (checking) {
    return (
      <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
        <span className="text-sm text-amber-700 font-medium">Checking spelling...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-700">{error}</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-red-400 hover:text-red-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (done && suggestions.length === 0) {
    return (
      <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
        <span className="text-emerald-600 text-lg">&#10003;</span>
        <span className="text-sm text-emerald-700 font-medium">No spelling issues found!</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-emerald-400 hover:text-emerald-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
      <div className="bg-amber-50 px-4 py-2.5 flex items-center justify-between border-b border-amber-200">
        <span className="text-sm font-medium text-amber-800">
          {suggestions.length} potential spelling {suggestions.length === 1 ? 'issue' : 'issues'} found
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-amber-400 hover:text-amber-600 transition"
          title="Dismiss all"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-amber-100">
        {suggestions.map((item, idx) => (
          <div key={idx} className="px-4 py-3 bg-white hover:bg-amber-50/50 flex items-start gap-3">
            <span className="text-xs text-gray-400 font-mono mt-1 flex-shrink-0 w-6 text-right">
              L{item.line}
            </span>
            <span className="text-sm text-red-600 line-through font-medium mt-0.5 flex-shrink-0">
              {item.word}
            </span>
            <span className="text-gray-400 mt-0.5 flex-shrink-0">&rarr;</span>
            <div className="flex flex-wrap gap-1.5">
              {item.suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => onApply(item, sug)}
                  className="px-2.5 py-1 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md hover:bg-emerald-100 hover:border-emerald-300 transition font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(item)}
              className="ml-auto text-gray-300 hover:text-gray-500 transition flex-shrink-0 mt-0.5"
              title="Dismiss"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
