'use client'

import { useState, useCallback } from 'react'

export default function useSpellCheck(formData, setFormData) {
  const [spellSuggestions, setSpellSuggestions] = useState([])
  const [spellChecking, setSpellChecking] = useState(false)
  const [spellCheckDone, setSpellCheckDone] = useState(false)
  const [spellError, setSpellError] = useState('')
  const [spellCheckField, setSpellCheckField] = useState('')

  const handleSpellCheck = useCallback(async (field, language) => {
    const text = formData[field]
    if (!text || !text.trim()) return

    setSpellChecking(true)
    setSpellCheckDone(false)
    setSpellError('')
    setSpellSuggestions([])
    setSpellCheckField(field)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/spell-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lyrics: text, language })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Spell check failed')
      }

      const data = await res.json()
      setSpellSuggestions(data.suggestions || [])
      setSpellCheckDone(true)
    } catch (error) {
      setSpellError(error.message)
    } finally {
      setSpellChecking(false)
    }
  }, [formData])

  const handleApplySuggestion = useCallback((item, chosenWord) => {
    const field = spellCheckField
    if (!field) return

    const text = formData[field]
    const lines = text.split('\n')
    const lineIdx = item.line - 1

    if (lineIdx < 0 || lineIdx >= lines.length) return

    const line = lines[lineIdx]
    const start = item.charOffset
    const end = start + item.word.length

    // Verify the word at the expected position matches
    if (line.substring(start, end) === item.word) {
      lines[lineIdx] = line.substring(0, start) + chosenWord + line.substring(end)
    } else {
      // Fallback: replace first occurrence of the word in that line
      const wordIdx = line.indexOf(item.word)
      if (wordIdx !== -1) {
        lines[lineIdx] = line.substring(0, wordIdx) + chosenWord + line.substring(wordIdx + item.word.length)
      }
    }

    setFormData(prev => ({ ...prev, [field]: lines.join('\n') }))

    // Remove this suggestion from the list
    setSpellSuggestions(prev => prev.filter(s => s !== item))
  }, [formData, spellCheckField, setFormData])

  const dismissSuggestion = useCallback((item) => {
    setSpellSuggestions(prev => prev.filter(s => s !== item))
  }, [])

  const clearSpellCheck = useCallback(() => {
    setSpellSuggestions([])
    setSpellChecking(false)
    setSpellCheckDone(false)
    setSpellError('')
    setSpellCheckField('')
  }, [])

  return {
    spellSuggestions,
    spellChecking,
    spellCheckDone,
    spellError,
    spellCheckField,
    handleSpellCheck,
    handleApplySuggestion,
    dismissSuggestion,
    clearSpellCheck
  }
}
