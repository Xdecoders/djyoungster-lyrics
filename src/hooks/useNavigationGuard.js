'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function useNavigationGuard(isDirty) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [pendingUrl, setPendingUrl] = useState(null)

  // Browser beforeunload (tab close, refresh, browser back)
  useEffect(() => {
    const handler = (e) => {
      if (isDirty.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const guardedNavigate = useCallback((url) => {
    if (isDirty.current) {
      setPendingUrl(url)
      setShowModal(true)
    } else {
      router.push(url)
    }
  }, [isDirty, router])

  const confirmLeave = useCallback(() => {
    isDirty.current = false
    setShowModal(false)
    if (pendingUrl) {
      router.push(pendingUrl)
      setPendingUrl(null)
    }
  }, [pendingUrl, router, isDirty])

  const cancelNavigation = useCallback(() => {
    setShowModal(false)
    setPendingUrl(null)
  }, [])

  return {
    showModal,
    guardedNavigate,
    confirmLeave,
    cancelNavigation,
    pendingUrl
  }
}
