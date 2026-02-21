import { useState, useRef, useCallback, useEffect } from 'react'

export default function useTransliterate(lang) {
  const [enabled, setEnabled] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionPos, setSuggestionPos] = useState(null) // { start, end } in text
  const [romanWord, setRomanWord] = useState('')
  const textareaRef = useRef(null)
  const abortRef = useRef(null)
  const lastConversion = useRef(null) // { start, end, roman }
  const isPasting = useRef(false)

  // Load toggle state from localStorage
  useEffect(() => {
    if (!lang) return
    const saved = localStorage.getItem(`transliterate_${lang}`)
    if (saved !== null) setEnabled(saved === 'true')
    else setEnabled(true) // default ON
  }, [lang])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      if (lang) localStorage.setItem(`transliterate_${lang}`, String(next))
      return next
    })
    setSuggestions([])
    lastConversion.current = null
  }, [lang])

  const closeSuggestions = useCallback(() => {
    setSuggestions([])
    setSuggestionPos(null)
    setRomanWord('')
  }, [])

  const fetchSuggestions = useCallback(async (word) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(
        `/api/admin/transliterate?text=${encodeURIComponent(word)}&lang=${lang}&num=5`,
        { signal: controller.signal, headers: { 'Authorization': `Bearer ${token}` } }
      )
      const data = await res.json()
      return data.suggestions || []
    } catch {
      return []
    }
  }, [lang])

  // Replace a range in the value and restore cursor
  const replaceRange = useCallback((value, start, end, replacement, onChange) => {
    const newValue = value.slice(0, start) + replacement + value.slice(end)
    onChange(newValue)
    // Restore cursor after React re-render
    const cursorPos = start + replacement.length
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (ta) {
        ta.selectionStart = cursorPos
        ta.selectionEnd = cursorPos
      }
    })
    return newValue
  }, [])

  const handleKeyDown = useCallback((e, value, onChange) => {
    if (!lang || !enabled) return

    // Ctrl+G toggles transliteration
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault()
      toggle()
      return
    }

    // If suggestions dropdown is open, handle navigation
    if (suggestions.length > 0) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSuggestions()
        return
      }
      // Let TransliterateTextarea handle ArrowUp/ArrowDown/Enter
      return
    }

    // Space: transliterate the word before cursor
    if (e.key === ' ') {
      const pos = e.target.selectionStart
      if (pos === 0) return

      // Extract word before cursor (Roman letters only)
      const before = value.slice(0, pos)
      const match = before.match(/([a-zA-Z]+)$/)
      if (!match) return

      const word = match[1]
      const wordStart = pos - word.length

      e.preventDefault()

      fetchSuggestions(word).then(results => {
        // Verify the word is still in place
        const currentVal = textareaRef.current?.value || value
        if (currentVal.slice(wordStart, wordStart + word.length) !== word) return

        if (results.length > 0) {
          const replacement = results[0] + ' '
          replaceRange(currentVal, wordStart, wordStart + word.length, replacement, onChange)
          lastConversion.current = {
            start: wordStart,
            end: wordStart + replacement.length,
            roman: word,
            allSuggestions: results
          }
        } else {
          // No results - just insert space
          replaceRange(currentVal, pos, pos, ' ', onChange)
          lastConversion.current = null
        }
      })
      return
    }

    // Enter: transliterate the word before cursor (same as Space but with newline)
    if (e.key === 'Enter') {
      const pos = e.target.selectionStart
      if (pos === 0) return

      const before = value.slice(0, pos)
      const match = before.match(/([a-zA-Z]+)$/)
      if (!match) return

      const word = match[1]
      const wordStart = pos - word.length

      e.preventDefault()

      fetchSuggestions(word).then(results => {
        const currentVal = textareaRef.current?.value || value
        if (currentVal.slice(wordStart, wordStart + word.length) !== word) return

        if (results.length > 0) {
          const replacement = results[0] + '\n'
          replaceRange(currentVal, wordStart, wordStart + word.length, replacement, onChange)
          lastConversion.current = null // don't offer alternatives after Enter
        } else {
          replaceRange(currentVal, pos, pos, '\n', onChange)
          lastConversion.current = null
        }
      })
      return
    }

    // Backspace: if right after a conversion, show alternatives
    if (e.key === 'Backspace' && lastConversion.current) {
      const pos = e.target.selectionStart
      const conv = lastConversion.current
      // Check cursor is right at end of converted word (after the trailing space)
      if (pos === conv.end) {
        e.preventDefault()
        // Remove the converted word + trailing space
        replaceRange(value, conv.start, conv.end, '', onChange)
        // Show dropdown
        setSuggestions([...conv.allSuggestions, conv.roman])
        setSuggestionPos({ start: conv.start, end: conv.start })
        setRomanWord(conv.roman)
        lastConversion.current = null
        return
      }
      // If cursor moved away, clear last conversion
      lastConversion.current = null
    }
  }, [lang, enabled, suggestions, toggle, closeSuggestions, fetchSuggestions, replaceRange])

  const applySuggestion = useCallback((word, value, onChange) => {
    if (!suggestionPos) return
    const replacement = word + ' '
    replaceRange(value, suggestionPos.start, suggestionPos.end, replacement, onChange)
    lastConversion.current = null
    closeSuggestions()
  }, [suggestionPos, replaceRange, closeSuggestions])

  const handlePaste = useCallback(() => {
    isPasting.current = true
    setTimeout(() => { isPasting.current = false }, 100)
  }, [])

  return {
    enabled,
    toggle,
    suggestions,
    romanWord,
    textareaRef,
    handleKeyDown,
    applySuggestion,
    closeSuggestions,
    handlePaste,
  }
}
