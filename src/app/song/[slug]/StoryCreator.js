'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX, FiDownload, FiShare2, FiCamera, FiCheck, FiMail } from 'react-icons/fi'

// Story Templates
export const STORY_TEMPLATES = [
  {
    id: 'moody-bloom',
    label: 'Moody Bloom',
    emoji: '\u{1F338}',
    font: "'Playfair Display', Georgia, serif",
    fontGoogle: 'Playfair Display',
    fontWeight: 'normal',
    bgImage: '/templates/story-dark-1.png',
    fallbackColor: '#1a2e1a',
    accent: '#d4a574',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    emoji: '\u{1F342}',
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgImage: '/templates/story-dark-2.png',
    fallbackColor: '#3d2b1f',
    accent: '#c9a96e',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'deep-rose',
    label: 'Deep Rose',
    emoji: '\u{1F339}',
    font: "'Playfair Display', Georgia, serif",
    fontGoogle: 'Playfair Display',
    fontWeight: 'normal',
    bgImage: '/templates/story-dark-3.png',
    fallbackColor: '#3b1c2e',
    accent: '#e8a0a0',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'elegant-leaf',
    label: 'Elegant Leaf',
    emoji: '\u{1F33F}',
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgImage: '/templates/story-light-1.png',
    fallbackColor: '#f5f0e8',
    accent: '#6b7c5e',
    textColor: '#2c1810',
    textShadow: false,
    dark: false,
  },
  {
    id: 'soft-dream',
    label: 'Soft Dream',
    emoji: '\u{1F337}',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgImage: '/templates/story-light-2.png',
    fallbackColor: '#e8e0f0',
    accent: '#c47a8a',
    textColor: '#1e293b',
    textShadow: false,
    dark: false,
  },
  {
    id: 'blush',
    label: 'Blush',
    emoji: '\u{1F33A}',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgImage: '/templates/story-light-3.png',
    fallbackColor: '#f8e8f0',
    accent: '#c97b94',
    textColor: '#3b1c2e',
    textShadow: false,
    dark: false,
  },
]

export async function ensureGoogleFont(fontFamily) {
  const id = 'google-font-' + fontFamily.replace(/\s+/g, '-').toLowerCase()
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`
    document.head.appendChild(link)
  }
  try {
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 100))
  } catch {
    // Font load failed, will fall back to Georgia
  }
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export async function paintBackground(ctx, W, H, template) {
  let hasImage = false
  if (template.bgImage) {
    try {
      const img = await loadImage(template.bgImage)
      // Aspect-fill: scale to cover entire canvas
      const scale = Math.max(W / img.width, H / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
      hasImage = true
    } catch {
      // Image load failure — use solid color fallback
    }
  }

  if (!hasImage) {
    ctx.fillStyle = template.fallbackColor || '#1a1a2e'
    ctx.fillRect(0, 0, W, H)
  }

  // Subtle overlay for text readability
  if (template.dark) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
  }
  ctx.fillRect(0, 0, W, H)
}

export function paintTitleArea(ctx, W, H, template, songTitle, artistNames) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

  ctx.textAlign = 'center'
  ctx.globalAlpha = 0.85
  ctx.font = `80px ${fontSystem}`
  ctx.fillText(template.emoji, W / 2, 350)
  ctx.globalAlpha = 1

  ctx.font = `bold 34px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.fillText(songTitle, W / 2, 420)
  ctx.font = `28px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.7
  ctx.fillText('by ' + artistNames, W / 2, 463)
  ctx.globalAlpha = 1
}

export async function generateStoryImage({ selectedLines, songTitle, artistNames, template = STORY_TEMPLATES[0] }) {
  const W = 1080
  const H = 1920
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  await paintBackground(ctx, W, H, template)
  paintTitleArea(ctx, W, H, template, songTitle, artistNames)

  // Lyrics lines
  ctx.font = `${template.fontWeight} 52px ${template.font}`
  ctx.fillStyle = template.textColor
  ctx.textAlign = 'center'
  if (template.textShadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
  }

  const maxTextWidth = W - 160
  const lineHeight = 76
  const breakGap = 40
  const breakLineWidth = 40

  // Wrap each original line and tag with its source index
  const drawItems = []
  selectedLines.forEach((line, origIdx) => {
    const wrapped = wrapText(ctx, line, maxTextWidth)
    wrapped.forEach(w => drawItems.push({ text: w, origIdx }))
    if ((origIdx + 1) % 2 === 0 && origIdx < selectedLines.length - 1) {
      drawItems.push({ break: true })
    }
  })

  // Calculate total height
  let totalLyricsHeight = 0
  for (const item of drawItems) {
    totalLyricsHeight += item.break ? breakGap : lineHeight
  }
  // Center the entire block (lyrics + divider + watermark) in the zone below the title area
  const titleAreaBottom = 500
  const watermarkHeight = 140 // gap-to-divider(40) + divider-to-brand(55) + brand-to-tagline(45)
  const totalBlockHeight = totalLyricsHeight + watermarkHeight
  const lyricsStartY = Math.max(titleAreaBottom, (titleAreaBottom + H) / 2 - totalBlockHeight / 2)

  let cursorY = lyricsStartY
  for (const item of drawItems) {
    if (item.break) {
      const hrY = cursorY + breakGap / 2
      ctx.save()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.strokeStyle = template.accent
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.25
      ctx.beginPath()
      ctx.moveTo(W / 2 - breakLineWidth, hrY)
      ctx.lineTo(W / 2 + breakLineWidth, hrY)
      ctx.stroke()
      ctx.restore()
      cursorY += breakGap
    } else {
      ctx.fillText(item.text, W / 2, cursorY)
      cursorY += lineHeight
    }
  }

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Divider line
  const dividerY = cursorY + 40
  ctx.strokeStyle = template.accent
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(W / 2 - 60, dividerY)
  ctx.lineTo(W / 2 + 60, dividerY)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Watermark
  ctx.font = `bold 34px ${fontSystem}`
  ctx.fillStyle = template.accent
  ctx.globalAlpha = 1
  ctx.textAlign = 'center'
  ctx.fillText('DJYoungster', W / 2, dividerY + 55)
  ctx.font = `28px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5
  ctx.fillText('Created at djyoungster.com', W / 2, dividerY + 100)
  ctx.globalAlpha = 1

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

// ── Story Template Thumbnail Generator ────────────────────────────────────────

export async function generateStoryThumbnail(template, sampleLines) {
  const W = 270
  const H = 480
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  if (template.fontGoogle) {
    await ensureGoogleFont(template.fontGoogle)
  }

  await paintBackground(ctx, W, H, template)

  // Sample text
  const scale = W / 1080
  const fontSize = Math.round(52 * scale)
  const lineHeight = Math.round(76 * scale)
  const blockGap = Math.round(20 * scale)
  const maxTextWidth = W - Math.round(40 * scale)

  ctx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
  const wrappedBlocks = sampleLines.slice(0, 3).map(text => wrapText(ctx, text, maxTextWidth))
  const blockHeights = wrappedBlocks.map(lines => lines.length * lineHeight)

  let totalH = 0
  for (let i = 0; i < wrappedBlocks.length; i++) {
    totalH += blockHeights[i]
    if (i < wrappedBlocks.length - 1) totalH += blockGap
  }

  ctx.save()
  ctx.fillStyle = template.textColor
  ctx.textAlign = 'center'
  ctx.globalAlpha = 0.9

  if (template.textShadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 2
  }

  let curY = (H / 2) - (totalH / 2)
  for (let i = 0; i < wrappedBlocks.length; i++) {
    wrappedBlocks[i].forEach((wLine, wi) => {
      ctx.fillText(wLine, W / 2, curY + wi * lineHeight + lineHeight * 0.7)
    })
    curY += blockHeights[i] + blockGap
  }
  ctx.restore()

  return canvas.toDataURL('image/jpeg', 0.7)
}


// ── StoryTemplatePickerModal Component ───────────────────────────────────────

export function StoryTemplatePickerModal({ isOpen, onClose, onSelect, sampleLines }) {
  const [thumbnails, setThumbnails] = useState({})
  const [selectedId, setSelectedId] = useState(STORY_TEMPLATES[0].id)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setSelectedId(STORY_TEMPLATES[0].id)

    const lines = sampleLines?.length ? sampleLines : ['Sample lyrics line', 'Another line here']

    Promise.all(
      STORY_TEMPLATES.map(async (tmpl) => {
        const url = await generateStoryThumbnail(tmpl, lines)
        return [tmpl.id, url]
      })
    ).then((results) => {
      const map = {}
      for (const [id, url] of results) map[id] = url
      setThumbnails(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isOpen, sampleLines])

  if (!isOpen) return null

  const selected = STORY_TEMPLATES.find(t => t.id === selectedId) || STORY_TEMPLATES[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-5 animate-slideUp max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
          <FiCamera className="w-5 h-5 text-purple-500" />
          Choose a Style
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
            {STORY_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedId(tmpl.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[9/16] ${
                  selectedId === tmpl.id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {thumbnails[tmpl.id] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnails[tmpl.id]}
                    alt={tmpl.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <span>{tmpl.emoji}</span>
                    <span>{tmpl.label}</span>
                  </span>
                </div>
                {selectedId === tmpl.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onSelect(selected)}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <FiCamera className="w-4 h-4" />
          Generate Story
        </button>
      </div>
    </div>
  )
}


// Story Preview Modal Component
export function StoryPreviewModal({ isOpen, onClose, storyImageBlob, isGenerating, songTitle, onTemplateChange, selectedTemplate }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [gateEmail, setGateEmail] = useState('')
  const [gateLoading, setGateLoading] = useState(false)
  const [gateMsg, setGateMsg] = useState('')

  useEffect(() => {
    if (storyImageBlob) {
      const url = URL.createObjectURL(storyImageBlob)
      setBlobUrl(url)
      setIsRegenerating(false)
      return () => URL.revokeObjectURL(url)
    }
    setBlobUrl(null)
  }, [storyImageBlob])

  useEffect(() => {
    if (!isOpen) {
      setShowGate(false)
      setGateEmail('')
      setGateMsg('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${songTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'story'}-lyrics.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShare = async () => {
    if (!storyImageBlob) return
    const file = new File([storyImageBlob], `${songTitle || 'story'}-lyrics.png`, { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${songTitle} - Lyrics`,
          text: `Check out these lyrics from "${songTitle}" on DJYoungster!`
        })
      } catch (err) {
        if (err.name !== 'AbortError') handleDownload()
      }
    } else {
      handleDownload()
    }
  }

  const handleDownloadClick = () => {
    if (localStorage.getItem('dj_subscribed')) {
      handleDownload()
    } else {
      setShowGate(true)
    }
  }

  const handleGateSubmit = async (e) => {
    e.preventDefault()
    if (!gateEmail.includes('@')) {
      setGateMsg('Enter a valid email')
      return
    }
    setGateLoading(true)
    try {
      await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gateEmail }),
      })
    } catch {}
    localStorage.setItem('dj_subscribed', '1')
    setGateLoading(false)
    handleDownload()
    setShowGate(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-5 animate-slideUp max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
          <FiCamera className="w-5 h-5 text-purple-500" />
          Story Preview
        </h3>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Generating your story image...</p>
          </div>
        ) : blobUrl ? (
          <>
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-lg bg-slate-900 flex-1 min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={blobUrl} alt="Story preview" className="w-full h-full object-contain" />
              {isRegenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Template selector chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
              {STORY_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    if (tmpl.id !== selectedTemplate?.id) {
                      setIsRegenerating(true)
                      onTemplateChange?.(tmpl)
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedTemplate?.id === tmpl.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{tmpl.emoji}</span>
                  <span>{tmpl.label}</span>
                </button>
              ))}
            </div>

            {showGate ? (
              <form onSubmit={handleGateSubmit} className="flex-shrink-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <FiMail className="w-4 h-4 text-purple-500" />
                  Enter your email to download
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={gateEmail}
                    onChange={e => setGateEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={gateLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                  >
                    {gateLoading ? '...' : 'Get'}
                  </button>
                </div>
                {gateMsg && <p className="text-xs text-red-500 mb-1.5">{gateMsg}</p>}
                <button
                  type="button"
                  onClick={() => { localStorage.setItem('dj_subscribed', '1'); setShowGate(false); handleDownload() }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  Skip, just download
                </button>
              </form>
            ) : (
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleDownloadClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// Hook to manage story mode state and actions
export function useStoryMode({ initialSong }) {
  const [isStoryMode, setIsStoryMode] = useState(false)
  const [selectedLines, setSelectedLines] = useState([])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showStoryPreview, setShowStoryPreview] = useState(false)
  const [storyImageBlob, setStoryImageBlob] = useState(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [storyTemplate, setStoryTemplate] = useState(STORY_TEMPLATES[0])

  const handleLineToggle = useCallback((index, text) => {
    setSelectedLines(prev => {
      const exists = prev.find(l => l.index === index)
      if (exists) {
        return prev.filter(l => l.index !== index)
      }
      if (prev.length >= 8) return prev
      return [...prev, { index, text }].sort((a, b) => a.index - b.index)
    })
  }, [])

  // Opens template picker instead of generating immediately
  const handlePreviewStory = useCallback(() => {
    if (selectedLines.length < 2) return
    setShowTemplatePicker(true)
  }, [selectedLines])

  // Generates story after template is chosen
  const handleCreateStory = useCallback(async (template) => {
    const tmpl = template || storyTemplate
    setStoryTemplate(tmpl)
    setShowTemplatePicker(false)
    setShowStoryPreview(true)
    setIsGeneratingStory(true)
    try {
      if (tmpl.fontGoogle) {
        await ensureGoogleFont(tmpl.fontGoogle)
      }
      const blob = await generateStoryImage({
        selectedLines: selectedLines.map(l => l.text),
        songTitle: initialSong.title,
        artistNames: initialSong.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist',
        template: tmpl
      })
      setStoryImageBlob(blob)
    } catch (err) {
      console.error('Story generation error:', err)
    } finally {
      setIsGeneratingStory(false)
    }
  }, [selectedLines, initialSong, storyTemplate])

  const handleTemplateChange = useCallback(async (template) => {
    setStoryTemplate(template)
    try {
      if (template.fontGoogle) {
        await ensureGoogleFont(template.fontGoogle)
      }
      const blob = await generateStoryImage({
        selectedLines: selectedLines.map(l => l.text),
        songTitle: initialSong.title,
        artistNames: initialSong.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist',
        template
      })
      setStoryImageBlob(blob)
    } catch (err) {
      console.error('Story template change error:', err)
    }
  }, [selectedLines, initialSong])

  const exitStoryMode = useCallback(() => {
    setIsStoryMode(false)
    setSelectedLines([])
  }, [])

  return {
    isStoryMode,
    setIsStoryMode,
    selectedLines,
    setSelectedLines,
    showTemplatePicker,
    setShowTemplatePicker,
    showStoryPreview,
    setShowStoryPreview,
    storyImageBlob,
    setStoryImageBlob,
    isGeneratingStory,
    storyTemplate,
    handleLineToggle,
    handlePreviewStory,
    handleCreateStory,
    handleTemplateChange,
    exitStoryMode,
  }
}
