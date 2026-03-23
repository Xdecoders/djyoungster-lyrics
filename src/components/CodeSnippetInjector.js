'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const PAGE_MATCHERS = {
  homepage: (p) => p === '/',
  song:     (p) => p.startsWith('/song/'),
  artist:   (p) => p.startsWith('/artist/'),
  album:    (p) => p.startsWith('/album/'),
  movie:    (p) => p.startsWith('/movie/'),
  category: (p) => p.startsWith('/category/'),
  genre:    (p) => p.startsWith('/genre/'),
  tag:      (p) => p.startsWith('/tag/'),
  search:   (p) => p.startsWith('/search'),
  songs:    (p) => p === '/songs',
  artists:  (p) => p === '/artists',
}

function shouldShow(pages, pathname) {
  if (!pages || pages.length === 0 || pages.includes('all')) return true
  return pages.some((page) => PAGE_MATCHERS[page]?.(pathname) ?? false)
}

function parseSnippetTags(code) {
  if (!code?.trim()) return []
  const results = []
  const regex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(code)) !== null) {
    const attrStr = match[1]
    const inline = match[2].trim()
    const srcM = attrStr.match(/src=["']([^"']+)["']/)
    if (srcM) {
      results.push({ type: 'external', src: srcM[1] })
    } else if (inline) {
      results.push({ type: 'inline', content: inline })
    }
  }
  if (results.length === 0 && code.trim() && !code.trim().startsWith('<')) {
    results.push({ type: 'inline', content: code.trim() })
  }
  return results
}

function injectSnippet(idPrefix, code, target) {
  parseSnippetTags(code).forEach((script, i) => {
    const id = `${idPrefix}-${i}`
    if (document.getElementById(id)) return
    const el = document.createElement('script')
    el.id = id
    if (script.type === 'external') {
      el.src = script.src
      el.async = true
    } else {
      el.textContent = script.content
    }
    target.appendChild(el)
  })
}

export default function CodeSnippetInjector({ headerCode, headerPages, footerCode, footerPages }) {
  const pathname = usePathname()
  const injectedHeader = useRef(false)
  const injectedFooter = useRef(false)

  useEffect(() => {
    if (headerCode && shouldShow(headerPages, pathname) && !injectedHeader.current) {
      injectSnippet('custom-header-snippet', headerCode, document.head)
      injectedHeader.current = true
    }

    if (footerCode && shouldShow(footerPages, pathname) && !injectedFooter.current) {
      injectSnippet('custom-footer-snippet', footerCode, document.body)
      injectedFooter.current = true
    }
  }, [pathname, headerCode, headerPages, footerCode, footerPages])

  return null
}
