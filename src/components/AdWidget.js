'use client'

import { useEffect, useRef } from 'react'

// Detect bare image URL (no HTML tags, just a URL ending in image extension)
function isPlainImageUrl(str) {
  return /^https?:\/\/\S+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$/i.test(str)
}

// Detect bare JS (no HTML tags — starts with common JS patterns)
function isPlainScript(str) {
  return !/<[a-z]/i.test(str)
}

// Inject all nodes from a source element into container,
// re-creating <script> elements so the browser actually executes them
function injectContent(container, html) {
  const temp = document.createElement('div')
  temp.innerHTML = html

  Array.from(temp.childNodes).forEach(node => {
    if (node.nodeName === 'SCRIPT') {
      const script = document.createElement('script')
      Array.from(node.attributes).forEach(attr => script.setAttribute(attr.name, attr.value))
      // For inline scripts copy the code; src scripts use the attribute set above
      if (!node.getAttribute('src')) {
        script.textContent = node.textContent
      }
      container.appendChild(script)
    } else {
      container.appendChild(node.cloneNode(true))
    }
  })
}

export default function AdWidget({ code, className = '' }) {
  const ref = useRef(null)
  const trimmed = code?.trim() || ''

  useEffect(() => {
    if (!ref.current || !trimmed) return

    // Plain image URL and plain JS are handled in render / separately below
    if (isPlainImageUrl(trimmed)) return

    ref.current.innerHTML = ''

    if (isPlainScript(trimmed)) {
      // Bare JS — wrap in a script tag and inject
      const script = document.createElement('script')
      script.textContent = trimmed
      ref.current.appendChild(script)
    } else {
      // HTML (possibly with embedded <script> tags — e.g. AdSense)
      injectContent(ref.current, trimmed)
    }
  }, [trimmed])

  if (!trimmed) return null

  // Plain image URL — render as <img> directly, no useEffect needed
  if (isPlainImageUrl(trimmed)) {
    return (
      <div className={`ad-widget text-center ${className}`}>
        <img
          src={trimmed}
          alt="Advertisement"
          style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }}
        />
      </div>
    )
  }

  // HTML / JS — container filled by useEffect
  return <div ref={ref} className={`ad-widget overflow-hidden ${className}`} />
}
