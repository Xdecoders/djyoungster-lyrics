'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX, FiDownload, FiShare2, FiVideo, FiCheck, FiMail } from 'react-icons/fi'
import { ensureGoogleFont, paintBackground, wrapText } from './StoryCreator'

// Clip/Reel Templates (separate from Story templates)
export const CLIP_TEMPLATES = [
  {
    id: 'wildflower',
    label: 'Wildflower',
    emoji: '\u{1F33B}',
    font: "'Playfair Display', Georgia, serif",
    fontGoogle: 'Playfair Display',
    fontWeight: 'normal',
    bgImage: '/templates/reel-dark-1.png',
    fallbackColor: '#0d2e2e',
    accent: '#e8a050',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'emerald',
    label: 'Emerald',
    emoji: '\u{1F48E}',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgImage: '/templates/reel-dark-2.png',
    fallbackColor: '#0a2e1a',
    accent: '#5eead4',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'moonlight',
    label: 'Moonlight',
    emoji: '\u{1F319}',
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgImage: '/templates/reel-dark-3.png',
    fallbackColor: '#1a1a2e',
    accent: '#c0c0c0',
    textColor: '#ffffff',
    textShadow: true,
    dark: true,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    emoji: '\u{1F343}',
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontGoogle: null,
    fontWeight: 'bold',
    bgImage: '/templates/reel-light-1.png',
    fallbackColor: '#e8e8f0',
    accent: '#64748b',
    textColor: '#1a2030',
    textShadow: false,
    dark: false,
  },
  {
    id: 'golden',
    label: 'Golden',
    emoji: '\u{2728}',
    font: "'Playfair Display', Georgia, serif",
    fontGoogle: 'Playfair Display',
    fontWeight: 'normal',
    bgImage: '/templates/reel-light-2.png',
    fallbackColor: '#f0e8d8',
    accent: '#8b6914',
    textColor: '#3d2b1f',
    textShadow: false,
    dark: false,
  },
  {
    id: 'rose',
    label: 'Ros\u00e9',
    emoji: '\u{1F33A}',
    font: "'Lora', Georgia, serif",
    fontGoogle: 'Lora',
    fontWeight: 'normal',
    bgImage: '/templates/reel-light-3.png',
    fallbackColor: '#f8e0e8',
    accent: '#c97b94',
    textColor: '#3b1c2e',
    textShadow: false,
    dark: false,
  },
]

// ── Particles ────────────────────────────────────────────────────────────────

function initParticles(count, W, H) {
  const particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.06 + 0.02,
    })
  }
  return particles
}

function paintParticles(ctx, W, H, particles, accentColor) {
  ctx.save()
  for (const p of particles) {
    // Update position
    p.x += p.vx
    p.y += p.vy
    // Wrap around edges
    if (p.y < -5) p.y = H + 5
    if (p.x < -5) p.x = W + 5
    if (p.x > W + 5) p.x = -5

    ctx.globalAlpha = p.alpha
    ctx.fillStyle = accentColor
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ── Video Generation ─────────────────────────────────────────────────────────

function paintWatermark(ctx, W, H, template, s = 1) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const divY = H - Math.round(500 * s)

  ctx.save()
  ctx.textAlign = 'center'

  // Divider line
  ctx.strokeStyle = template.accent
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(W / 2 - Math.round(60 * s), divY)
  ctx.lineTo(W / 2 + Math.round(60 * s), divY)
  ctx.stroke()

  // Brand name
  ctx.font = `bold ${Math.round(34 * s)}px ${fontSystem}`
  ctx.fillStyle = template.accent
  ctx.globalAlpha = 1
  ctx.fillText('DJYoungster', W / 2, divY + Math.round(55 * s))

  // Tagline
  ctx.font = `${Math.round(28 * s)}px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5
  ctx.fillText('Created at djyoungster.com', W / 2, divY + Math.round(100 * s))

  ctx.restore()
}

function paintEndCard(ctx, W, H, template, songTitle, artistNames, s = 1) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

  ctx.save()
  ctx.textAlign = 'center'

  // Song title
  ctx.font = `bold ${Math.round(56 * s)}px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 1
  if (template.textShadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3
  }
  ctx.fillText(songTitle, W / 2, H / 2 - Math.round(40 * s))

  // Artist names
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.font = `${Math.round(36 * s)}px ${fontSystem}`
  ctx.globalAlpha = 0.7
  ctx.fillText(artistNames, W / 2, H / 2 + Math.round(30 * s))

  // Divider
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = template.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - Math.round(60 * s), H / 2 + Math.round(80 * s))
  ctx.lineTo(W / 2 + Math.round(60 * s), H / 2 + Math.round(80 * s))
  ctx.stroke()

  // Brand
  ctx.font = `bold ${Math.round(32 * s)}px ${fontSystem}`
  ctx.fillStyle = template.accent
  ctx.globalAlpha = 1
  ctx.fillText('DJYoungster', W / 2, H / 2 + Math.round(135 * s))

  ctx.font = `${Math.round(26 * s)}px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5
  ctx.fillText('djyoungster.com', W / 2, H / 2 + Math.round(175 * s))

  ctx.restore()
}

export async function generateClipVideo({ selectedLines, songTitle, artistNames, template = CLIP_TEMPLATES[0], onProgress, onPreview }) {
  // Check WebCodecs support
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('WebCodecs API is not supported in this browser. Please use Chrome 94+ or Edge 94+.')
  }

  // Detect mobile and reduce resolution/FPS to prevent crashes
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const W = isMobile ? 720 : 1080
  const H = isMobile ? 1280 : 1920
  const FPS = isMobile ? 24 : 30

  const numLines = selectedLines.length
  const displayMs = 15000
  const fadeAllMs = 600
  const outroMs = 5000

  const totalMs = displayMs + outroMs
  const totalFrames = Math.ceil((totalMs / 1000) * FPS)

  // Prepare background canvas (cached, painted once)
  const bgCanvas = document.createElement('canvas')
  bgCanvas.width = W
  bgCanvas.height = H
  const bgCtx = bgCanvas.getContext('2d')

  if (template.fontGoogle) {
    await ensureGoogleFont(template.fontGoogle)
  }

  await paintBackground(bgCtx, W, H, template)

  // Frame canvas
  const frameCanvas = document.createElement('canvas')
  frameCanvas.width = W
  frameCanvas.height = H
  const frameCtx = frameCanvas.getContext('2d')

  // Scale factor for text sizes when rendering at lower resolution
  const scale = W / 1080

  // Pre-wrap all lines and compute total content height
  const maxTextWidth = W - Math.round(160 * scale)
  const wrapLineHeight = Math.round(76 * scale)
  const blockGap = Math.round(30 * scale)
  const fontSize = Math.round(52 * scale)

  frameCtx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
  const wrappedBlocks = selectedLines.map(text => wrapText(frameCtx, text, maxTextWidth))
  const blockHeights = wrappedBlocks.map(lines => lines.length * wrapLineHeight)

  // Total content height
  let totalContentH = 0
  for (let i = 0; i < numLines; i++) {
    totalContentH += blockHeights[i]
    if (i < numLines - 1) totalContentH += blockGap
  }

  // Initialize particles
  const particleCount = isMobile ? 60 : 120
  const particles = initParticles(particleCount, W, H)

  // ── Generate blurred preview image ───────────────────────────────────────
  if (onPreview) {
    frameCtx.drawImage(bgCanvas, 0, 0)
    paintParticles(frameCtx, W, H, particles, template.accent)
    paintWatermark(frameCtx, W, H, template, scale)

    // Draw all lines centered, dimmed
    frameCtx.save()
    frameCtx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
    frameCtx.fillStyle = template.textColor
    frameCtx.textAlign = 'center'
    frameCtx.globalAlpha = 0.5

    if (template.textShadow !== false) {
      frameCtx.shadowColor = 'rgba(0,0,0,0.5)'
      frameCtx.shadowBlur = 10
      frameCtx.shadowOffsetY = 4
    }

    const startY = (H / 2) - (totalContentH / 2)
    let curY = startY
    for (let i = 0; i < numLines; i++) {
      wrappedBlocks[i].forEach((wLine, wi) => {
        frameCtx.fillText(wLine, W / 2, curY + wi * wrapLineHeight + wrapLineHeight * 0.7)
      })
      curY += blockHeights[i] + blockGap
    }
    frameCtx.restore()

    const previewBlob = await new Promise(resolve => frameCanvas.toBlob(resolve, 'image/jpeg', 0.6))
    onPreview(previewBlob)
  }

  // mp4-muxer setup
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')
  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width: W,
      height: H,
    },
    fastStart: 'in-memory',
  })

  // VideoEncoder setup
  let encodedFrames = 0
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta)
    },
    error: (err) => {
      console.error('VideoEncoder error:', err)
    }
  })

  encoder.configure({
    codec: 'avc1.640028',
    width: W,
    height: H,
    bitrate: isMobile ? 2_000_000 : 4_000_000,
    framerate: FPS,
  })

  // Render loop
  for (let f = 0; f < totalFrames; f++) {
    const timeMs = (f / FPS) * 1000

    // Draw cached background
    frameCtx.drawImage(bgCanvas, 0, 0)

    // Animated particles
    paintParticles(frameCtx, W, H, particles, template.accent)

    if (timeMs >= displayMs) {
      // End card
      const outroT = timeMs - displayMs
      const fadeIn = Math.min(1, outroT / 600)

      frameCtx.save()
      frameCtx.globalAlpha = fadeIn
      paintEndCard(frameCtx, W, H, template, songTitle, artistNames, scale)
      frameCtx.restore()
    } else {
      // Watermark during lyrics section
      paintWatermark(frameCtx, W, H, template, scale)

      // All lines at once with single fade-in
      const alpha = Math.min(1, timeMs / fadeAllMs)

      frameCtx.save()
      frameCtx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
      frameCtx.fillStyle = template.textColor
      frameCtx.textAlign = 'center'
      frameCtx.globalAlpha = alpha

      if (template.textShadow !== false) {
        frameCtx.shadowColor = 'rgba(0,0,0,0.5)'
        frameCtx.shadowBlur = 10
        frameCtx.shadowOffsetX = 0
        frameCtx.shadowOffsetY = 4
      }

      const startY = (H / 2) - (totalContentH / 2)
      let curY = startY
      for (let i = 0; i < numLines; i++) {
        wrappedBlocks[i].forEach((wLine, wi) => {
          frameCtx.fillText(wLine, W / 2, curY + wi * wrapLineHeight + wrapLineHeight * 0.7)
        })
        curY += blockHeights[i] + blockGap
      }

      frameCtx.restore()
    }

    // Encode frame
    const frame = new VideoFrame(frameCanvas, {
      timestamp: f * (1_000_000 / FPS),
      duration: 1_000_000 / FPS,
    })

    const isKeyFrame = f % (FPS * 2) === 0
    encoder.encode(frame, { keyFrame: isKeyFrame })
    frame.close()

    encodedFrames++
    if (onProgress && f % 5 === 0) {
      onProgress(Math.round((encodedFrames / totalFrames) * 100))
    }

    // Yield to event loop — more frequently on mobile to prevent crashes
    const yieldInterval = isMobile ? 3 : 10
    if (f % yieldInterval === 0) {
      await new Promise(r => setTimeout(r, 0))
    }

    // Flush encoder periodically on mobile to free memory
    if (isMobile && f % (FPS * 2) === 0 && f > 0) {
      await encoder.flush()
    }
  }

  await encoder.flush()
  muxer.finalize()

  onProgress?.(100)

  const buffer = target.buffer
  return new Blob([buffer], { type: 'video/mp4' })
}


// ── Template Thumbnail Generator ─────────────────────────────────────────────

export async function generateTemplateThumbnail(template, sampleLines) {
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

  // Static particles
  const thumbParticles = initParticles(30, W, H)
  paintParticles(ctx, W, H, thumbParticles, template.accent)

  // Sample text
  const scale = W / 1080
  const fontSize = Math.round(52 * scale)
  const wrapLineHeight = Math.round(76 * scale)
  const blockGap = Math.round(20 * scale)
  const maxTextWidth = W - Math.round(40 * scale)

  ctx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
  const wrappedBlocks = sampleLines.slice(0, 3).map(text => wrapText(ctx, text, maxTextWidth))
  const blockHeights = wrappedBlocks.map(lines => lines.length * wrapLineHeight)

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
      ctx.fillText(wLine, W / 2, curY + wi * wrapLineHeight + wrapLineHeight * 0.7)
    })
    curY += blockHeights[i] + blockGap
  }
  ctx.restore()

  return canvas.toDataURL('image/jpeg', 0.7)
}


// ── useClipMode Hook ─────────────────────────────────────────────────────────

export function useClipMode({ initialSong }) {
  const [isClipMode, setIsClipMode] = useState(false)
  const [selectedLines, setSelectedLines] = useState([])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showClipPreview, setShowClipPreview] = useState(false)
  const [clipVideoBlob, setClipVideoBlob] = useState(null)
  const [clipPreviewImage, setClipPreviewImage] = useState(null)
  const [isGeneratingClip, setIsGeneratingClip] = useState(false)
  const [clipProgress, setClipProgress] = useState(0)
  const [clipTemplate, setClipTemplate] = useState(CLIP_TEMPLATES[0])

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
  const handlePreviewClip = useCallback(() => {
    if (selectedLines.length < 2) return
    setShowTemplatePicker(true)
  }, [selectedLines])

  // Generates clip after template is chosen
  const handleCreateClip = useCallback(async (template) => {
    const tmpl = template || clipTemplate
    setClipTemplate(tmpl)
    setShowTemplatePicker(false)
    setShowClipPreview(true)
    setIsGeneratingClip(true)
    setClipProgress(0)
    setClipVideoBlob(null)
    setClipPreviewImage(null)
    try {
      const blob = await generateClipVideo({
        selectedLines: selectedLines.map(l => l.text),
        songTitle: initialSong.title,
        artistNames: initialSong.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist',
        template: tmpl,
        onProgress: setClipProgress,
        onPreview: setClipPreviewImage,
      })
      setClipVideoBlob(blob)
    } catch (err) {
      console.error('Clip generation error:', err)
      alert(err.message || 'Failed to generate clip. Your browser may not support WebCodecs.')
    } finally {
      setIsGeneratingClip(false)
    }
  }, [selectedLines, initialSong, clipTemplate])

  const handleClipTemplateChange = useCallback(async (template) => {
    setClipTemplate(template)
    setClipVideoBlob(null)
    setClipPreviewImage(null)
    setIsGeneratingClip(true)
    setClipProgress(0)
    try {
      const blob = await generateClipVideo({
        selectedLines: selectedLines.map(l => l.text),
        songTitle: initialSong.title,
        artistNames: initialSong.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown Artist',
        template,
        onProgress: setClipProgress,
        onPreview: setClipPreviewImage,
      })
      setClipVideoBlob(blob)
    } catch (err) {
      console.error('Clip template change error:', err)
    } finally {
      setIsGeneratingClip(false)
    }
  }, [selectedLines, initialSong])

  const exitClipMode = useCallback(() => {
    setIsClipMode(false)
    setSelectedLines([])
  }, [])

  return {
    isClipMode,
    setIsClipMode,
    selectedLines,
    setSelectedLines,
    showTemplatePicker,
    setShowTemplatePicker,
    showClipPreview,
    setShowClipPreview,
    clipVideoBlob,
    setClipVideoBlob,
    clipPreviewImage,
    isGeneratingClip,
    clipProgress,
    clipTemplate,
    handleLineToggle,
    handlePreviewClip,
    handleCreateClip,
    handleClipTemplateChange,
    exitClipMode,
  }
}


// ── TemplatePickerModal Component ────────────────────────────────────────────

export function TemplatePickerModal({ isOpen, onClose, onSelect, sampleLines }) {
  const [thumbnails, setThumbnails] = useState({})
  const [selectedId, setSelectedId] = useState(CLIP_TEMPLATES[0].id)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setSelectedId(CLIP_TEMPLATES[0].id)

    const lines = sampleLines?.length ? sampleLines : ['Sample lyrics line', 'Another line here']

    Promise.all(
      CLIP_TEMPLATES.map(async (tmpl) => {
        const url = await generateTemplateThumbnail(tmpl, lines)
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

  const selected = CLIP_TEMPLATES.find(t => t.id === selectedId) || CLIP_TEMPLATES[0]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-5 animate-slideUp max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
          <FiVideo className="w-5 h-5 text-cyan-500" />
          Choose a Style
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
            {CLIP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedId(tmpl.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[9/16] ${
                  selectedId === tmpl.id
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
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
                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <span>{tmpl.emoji}</span>
                    <span>{tmpl.label}</span>
                  </span>
                </div>
                {/* Selected check */}
                {selectedId === tmpl.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
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
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
        >
          <FiVideo className="w-4 h-4" />
          Generate Clip
        </button>
      </div>
    </div>
  )
}


// ── ClipPreviewModal Component ───────────────────────────────────────────────

export function ClipPreviewModal({ isOpen, onClose, clipVideoBlob, clipPreviewImage, isGenerating, clipProgress, songTitle, songId, onTemplateChange, selectedTemplate }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [gateEmail, setGateEmail] = useState('')
  const [gateLoading, setGateLoading] = useState(false)
  const [gateMsg, setGateMsg] = useState('')

  useEffect(() => {
    if (clipVideoBlob) {
      const url = URL.createObjectURL(clipVideoBlob)
      setBlobUrl(url)
      setIsRegenerating(false)
      return () => URL.revokeObjectURL(url)
    }
    setBlobUrl(null)
  }, [clipVideoBlob])

  useEffect(() => {
    if (clipPreviewImage) {
      const url = URL.createObjectURL(clipPreviewImage)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [clipPreviewImage])

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
    fetch('/api/public/song-share-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, type: 'reel' }),
    }).catch(() => {})
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `${songTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'clip'}-lyrics-clip.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShare = async () => {
    if (!clipVideoBlob) return
    const file = new File([clipVideoBlob], `${songTitle || 'clip'}-lyrics-clip.mp4`, { type: 'video/mp4' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${songTitle} - Lyrics Clip`,
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-5 animate-slideUp max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
          <FiVideo className="w-5 h-5 text-cyan-500" />
          Clip Preview
        </h3>

        {isGenerating ? (
          <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-900 flex-1 min-h-0">
            {/* Blurred preview image behind spinner */}
            {previewUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-contain opacity-60"
                style={{ filter: 'blur(8px) brightness(0.5)', transform: 'scale(1.05)' }}
              />
            )}
            {/* Overlay with spinner + progress */}
            <div className={`${previewUrl ? 'absolute inset-0' : ''} flex flex-col items-center justify-center ${previewUrl ? '' : 'py-16'}`}>
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4" />
              <p className="text-white text-sm mb-3 drop-shadow">Generating your lyrics clip...</p>
              <div className="w-full max-w-[200px] bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${clipProgress}%` }}
                />
              </div>
              <p className="text-xs text-white/70 mt-2 drop-shadow">{clipProgress}%</p>
            </div>
          </div>
        ) : blobUrl ? (
          <>
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-lg bg-slate-900 flex-1 min-h-0">
              <video
                src={blobUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full max-h-full object-contain"
              />
              {isRegenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Template selector chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
              {CLIP_TEMPLATES.map((tmpl) => (
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
                      ? 'bg-cyan-600 text-white shadow-md'
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
                  <FiMail className="w-4 h-4 text-cyan-500" />
                  Enter your email to download
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={gateEmail}
                    onChange={e => setGateEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={gateLoading}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50"
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-700 hover:to-blue-700 transition"
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
