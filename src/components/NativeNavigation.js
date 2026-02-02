'use client'

import { useEffect } from 'react'

// Forces native browser navigation for all internal links
// This shows the browser's loading indicator instead of Next.js client navigation
export default function NativeNavigation() {
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href) return

      // Skip external links, hash links, and special protocols
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank'
      ) {
        return
      }

      // Force native navigation for internal links
      e.preventDefault()
      window.location.href = href
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
