'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX, FiDownload, FiShare2, FiCamera, FiCheck } from 'react-icons/fi'

// Story Templates
export const STORY_TEMPLATES = [
  {
    id: 'midnight-sad',
    label: 'Sad',
    emoji: '\u{1F494}',
    emojiOpacity: 1.0,
    font: "'Playfair Display', Georgia, serif",
    fontGoogle: 'Playfair Display',
    fontWeight: 'normal',
    bgGradient: ['#0f172a', '#1e293b', '#0f172a'],
    overlayOpacity: [0.3, 0.5, 0.4],
    accent: '#8b5cf6',
    brandColor: '#1DB954',
    textColor: '#ffffff',
    textShadow: true,
    skipCoverImage: false,
  },
  {
    id: 'late-night-drive',
    label: 'Night Drive',
    emoji: '\u{1F303}',
    emojiOpacity: 0.9,
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgGradient: ['#022c22', '#064e3b', '#065f46'],
    overlayOpacity: [0.1, 0.15, 0.1],
    accent: '#6ee7b7',
    textColor: 'rgba(255,255,255,0.9)',
    textShadow: true,
    skipCoverImage: true,
    brandingOpacity: 0.6,
  },
  {
    id: 'soft-love',
    label: 'Love',
    emoji: '\u{2764}\uFE0F',
    emojiOpacity: 0.85,
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgGradient: ['#fef2f2', '#fff1f2', '#fef2f2'],
    overlayOpacity: [0.0, 0.0, 0.0],
    accent: '#e11d48',
    textColor: '#1c1917',
    textShadow: false,
    skipCoverImage: true,
  },
  {
    id: 'neon-glow',
    label: 'Neon',
    emoji: '\u{1F4A0}',
    emojiOpacity: 0.8,
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgGradient: ['#0a0a0f', '#111118', '#0a0a0f'],
    overlayOpacity: [0.0, 0.0, 0.0],
    accent: '#22d3ee',
    textColor: '#ffffff',
    textShadow: true,
    skipCoverImage: true,
    neonGlow: true,
  },
  {
    id: 'golden-sunset',
    label: 'Sunset',
    emoji: '\u{1F305}',
    emojiOpacity: 0.9,
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgGradient: ['#78350f', '#c2410c', '#d97706'],
    overlayOpacity: [0.15, 0.1, 0.15],
    accent: '#fbbf24',
    textColor: '#fffbeb',
    textShadow: true,
    skipCoverImage: true,
  },
  {
    id: 'deep-ocean',
    label: 'Ocean',
    emoji: '\u{1F30A}',
    emojiOpacity: 0.85,
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgGradient: ['#0c1445', '#134e4a', '#0f766e'],
    overlayOpacity: [0.1, 0.15, 0.1],
    accent: '#06b6d4',
    textColor: 'rgba(255,255,255,0.95)',
    textShadow: true,
    skipCoverImage: true,
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

export async function paintBackground(ctx, W, H, template, coverImageUrl) {
  let hasCoverBg = false
  if (coverImageUrl && !template.skipCoverImage) {
    try {
      const img = await loadImage(coverImageUrl)
      ctx.filter = 'blur(40px) brightness(0.4)'
      const scale = Math.max(W / img.width, H / img.height) * 1.2
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)
      ctx.filter = 'none'
      hasCoverBg = true
    } catch {
      // CORS or load failure — use gradient fallback
    }
  }

  if (!hasCoverBg) {
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, template.bgGradient[0])
    grad.addColorStop(0.5, template.bgGradient[1])
    grad.addColorStop(1, template.bgGradient[2])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    if (template.skipCoverImage) {
      ctx.globalAlpha = 0.04
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const r = Math.random() * 2 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = template.accent
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, H)
  overlay.addColorStop(0, `rgba(0,0,0,${template.overlayOpacity[0]})`)
  overlay.addColorStop(0.5, `rgba(0,0,0,${template.overlayOpacity[1]})`)
  overlay.addColorStop(1, `rgba(0,0,0,${template.overlayOpacity[2]})`)
  ctx.fillStyle = overlay
  ctx.fillRect(0, 0, W, H)
}

export function paintTitleArea(ctx, W, H, template, songTitle, artistNames) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

  ctx.textAlign = 'center'
  ctx.globalAlpha = template.emojiOpacity ?? 0.18
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

export async function generateStoryImage({ selectedLines, songTitle, artistNames, coverImageUrl, template = STORY_TEMPLATES[0] }) {
  const W = 1080
  const H = 1920
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  await paintBackground(ctx, W, H, template, coverImageUrl)
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
  const lyricsStartY = (H / 2) - (totalLyricsHeight / 2) + 60

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
  const brandAlpha = template.brandingOpacity ?? 1
  ctx.font = `bold 34px ${fontSystem}`
  ctx.fillStyle = template.brandColor || template.accent
  ctx.globalAlpha = brandAlpha
  ctx.textAlign = 'center'
  ctx.fillText('DJYoungster', W / 2, dividerY + 55)
  ctx.font = `28px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5 * brandAlpha
  ctx.fillText('Created at djyoungster.com', W / 2, dividerY + 100)
  ctx.globalAlpha = 1

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

// ── Story Template Thumbnail Generator ────────────────────────────────────────

export async function generateStoryThumbnail(template, sampleLines, coverImageUrl) {
  const W = 270
  const H = 480
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  if (template.fontGoogle) {
    await ensureGoogleFont(template.fontGoogle)
  }

  await paintBackground(ctx, W, H, template, coverImageUrl)

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

  if (template.neonGlow) {
    ctx.shadowColor = template.accent
    ctx.shadowBlur = 12
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

export function StoryTemplatePickerModal({ isOpen, onClose, onSelect, sampleLines, coverImageUrl }) {
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
        const url = await generateStoryThumbnail(tmpl, lines, tmpl.skipCoverImage ? null : coverImageUrl)
        return [tmpl.id, url]
      })
    ).then((results) => {
      const map = {}
      for (const [id, url] of results) map[id] = url
      setThumbnails(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [isOpen, sampleLines, coverImageUrl])

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
          <div className="grid grid-cols-3 gap-3 mb-5 overflow-y-auto flex-1 min-h-0">
            {STORY_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedId(tmpl.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[9/16] ${
                  selectedId === tmpl.id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/30 scale-[1.02]'
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

  useEffect(() => {
    if (storyImageBlob) {
      const url = URL.createObjectURL(storyImageBlob)
      setBlobUrl(url)
      setIsRegenerating(false)
      return () => URL.revokeObjectURL(url)
    }
    setBlobUrl(null)
  }, [storyImageBlob])

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

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleDownload}
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
      if (prev.length >= 4) return prev
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
        coverImageUrl: initialSong.coverImage || null,
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
        coverImageUrl: initialSong.coverImage || null,
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
