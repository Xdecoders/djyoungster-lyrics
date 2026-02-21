'use client'

import { useState, useEffect, useRef } from 'react'
import useTransliterate from '@/hooks/useTransliterate'

export default function TransliterateTextarea({ value, onChange, lang, className, ...props }) {
  const {
    enabled,
    toggle,
    suggestions,
    romanWord,
    textareaRef,
    handleKeyDown,
    applySuggestion,
    closeSuggestions,
    handlePaste,
  } = useTransliterate(lang)

  const [selectedIdx, setSelectedIdx] = useState(0)
  const containerRef = useRef(null)

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIdx(0)
  }, [suggestions])

  // Close dropdown on outside click
  useEffect(() => {
    if (suggestions.length === 0) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeSuggestions()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [suggestions, closeSuggestions])

  const onKeyDown = (e) => {
    // Handle dropdown navigation when suggestions are open
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx(i => (i + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx(i => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        applySuggestion(suggestions[selectedIdx], value, onChange)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSuggestions()
        return
      }
    }
    handleKeyDown(e, value, onChange)
  }

  // If no lang, render plain textarea
  if (!lang) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        {...props}
      />
    )
  }

  const toggleLabel = lang === 'pa' ? 'ਅ' : 'अ'

  return (
    <div ref={containerRef} className="relative">
      {/* Toggle button */}
      <button
        type="button"
        onClick={toggle}
        className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-xs font-bold transition-colors ${
          enabled
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-gray-100 text-gray-400 border border-gray-200'
        }`}
        title={`Transliteration ${enabled ? 'ON' : 'OFF'} (Ctrl+G)`}
      >
        {toggleLabel} {enabled ? 'ON' : 'OFF'}
      </button>

      {/* Suggestion dropdown - positioned above textarea */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-w-[300px] overflow-hidden">
          <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
            Alternatives for &quot;{romanWord}&quot;
          </div>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // prevent textarea blur
                applySuggestion(s, value, onChange)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                i === selectedIdx
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-gray-50 text-gray-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        className={className}
        {...props}
      />
    </div>
  )
}
