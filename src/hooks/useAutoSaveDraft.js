'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function useAutoSaveDraft({ storageKey, formData, selections, enabled = false, debounceMs = 2000 }) {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState(null)
  const [draftSavedIndicator, setDraftSavedIndicator] = useState(false)
  const isDirty = useRef(false)
  const isInitializedRef = useRef(false)
  const timerRef = useRef(null)
  const indicatorTimerRef = useRef(null)

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const draft = JSON.parse(raw)
        const age = Date.now() - draft.timestamp
        if (age > SEVEN_DAYS_MS) {
          localStorage.removeItem(storageKey)
        } else {
          setHasDraft(true)
          setDraftTimestamp(draft.timestamp)
        }
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // Auto-save on formData/selections change (debounced)
  useEffect(() => {
    if (!enabled) return
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      return
    }

    isDirty.current = true

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const draft = {
          formData,
          selections,
          timestamp: Date.now()
        }
        localStorage.setItem(storageKey, JSON.stringify(draft))
        setDraftSavedIndicator(true)
        if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current)
        indicatorTimerRef.current = setTimeout(() => setDraftSavedIndicator(false), 2000)
      } catch (e) {
        console.error('Failed to save draft:', e)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [formData, selections, enabled, storageKey, debounceMs])

  // Cleanup indicator timer on unmount
  useEffect(() => {
    return () => {
      if (indicatorTimerRef.current) clearTimeout(indicatorTimerRef.current)
    }
  }, [])

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const draft = JSON.parse(raw)
        setHasDraft(false)
        return draft
      }
    } catch {
      // ignore
    }
    return null
  }, [storageKey])

  const discardDraft = useCallback(() => {
    localStorage.removeItem(storageKey)
    setHasDraft(false)
    setDraftTimestamp(null)
  }, [storageKey])

  const saveDraft = useCallback(() => {
    try {
      if (timerRef.current) clearTimeout(timerRef.current)
      const draft = {
        formData,
        selections,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(draft))
    } catch (e) {
      console.error('Failed to save draft:', e)
    }
  }, [storageKey, formData, selections])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey)
    setHasDraft(false)
    setDraftTimestamp(null)
    isDirty.current = false
  }, [storageKey])

  return {
    hasDraft,
    draftTimestamp,
    restoreDraft,
    discardDraft,
    clearDraft,
    saveDraft,
    isDirty,
    draftSavedIndicator
  }
}
