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

function extractScriptContent(code) {
  if (!code) return ''
  const match = code.trim().match(/^<script[^>]*>([\s\S]*?)<\/script>$/i)
  return match ? match[1].trim() : code.trim()
}

function injectScript(id, content, target) {
  if (!content || document.getElementById(id)) return
  const el = document.createElement('script')
  el.id = id
  el.textContent = content
  target.appendChild(el)
}

export default function CodeSnippetInjector({ headerCode, headerPages, footerCode, footerPages }) {
  const pathname = usePathname()
  const injectedHeader = useRef(false)
  const injectedFooter = useRef(false)

  useEffect(() => {
    const showHeader = headerCode && shouldShow(headerPages, pathname)
    if (showHeader && !injectedHeader.current) {
      injectScript('custom-header-snippet', extractScriptContent(headerCode), document.head)
      injectedHeader.current = true
    }

    const showFooter = footerCode && shouldShow(footerPages, pathname)
    if (showFooter && !injectedFooter.current) {
      injectScript('custom-footer-snippet', extractScriptContent(footerCode), document.body)
      injectedFooter.current = true
    }
  }, [pathname, headerCode, headerPages, footerCode, footerPages])

  return null
}
