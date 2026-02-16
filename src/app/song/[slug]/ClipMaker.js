'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX, FiDownload, FiShare2, FiVideo } from 'react-icons/fi'
import { STORY_TEMPLATES, ensureGoogleFont, paintBackground, wrapText } from './StoryCreator'

// ── Video Generation ─────────────────────────────────────────────────────────

function paintWatermark(ctx, W, H, template, s = 1) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const brandAlpha = template.brandingOpacity ?? 1
  const divY = H - Math.round(500 * s)

  ctx.save()
  ctx.textAlign = 'center'

  // Divider line
  ctx.strokeStyle = template.accent
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5 * brandAlpha
  ctx.beginPath()
  ctx.moveTo(W / 2 - Math.round(60 * s), divY)
  ctx.lineTo(W / 2 + Math.round(60 * s), divY)
  ctx.stroke()

  // Brand name
  ctx.font = `bold ${Math.round(34 * s)}px ${fontSystem}`
  ctx.fillStyle = template.brandColor || template.accent
  ctx.globalAlpha = brandAlpha
  ctx.fillText('DJYoungster', W / 2, divY + Math.round(55 * s))

  // Tagline
  ctx.font = `${Math.round(28 * s)}px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5 * brandAlpha
  ctx.fillText('Created at djyoungster.com', W / 2, divY + Math.round(100 * s))

  ctx.restore()
}

function paintEndCard(ctx, W, H, template, songTitle, artistNames, s = 1) {
  const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const brandAlpha = template.brandingOpacity ?? 1

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
  ctx.globalAlpha = 0.4 * brandAlpha
  ctx.strokeStyle = template.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - Math.round(60 * s), H / 2 + Math.round(80 * s))
  ctx.lineTo(W / 2 + Math.round(60 * s), H / 2 + Math.round(80 * s))
  ctx.stroke()

  // Brand
  ctx.font = `bold ${Math.round(32 * s)}px ${fontSystem}`
  ctx.fillStyle = template.brandColor || template.accent
  ctx.globalAlpha = brandAlpha
  ctx.fillText('DJYoungster', W / 2, H / 2 + Math.round(135 * s))

  ctx.font = `${Math.round(26 * s)}px ${fontSystem}`
  ctx.fillStyle = template.textColor
  ctx.globalAlpha = 0.5 * brandAlpha
  ctx.fillText('djyoungster.com', W / 2, H / 2 + Math.round(175 * s))

  ctx.restore()
}

export async function generateClipVideo({ selectedLines, songTitle, artistNames, coverImageUrl, template = STORY_TEMPLATES[0], onProgress, onPreview }) {
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
  const perLineDuration = Math.min(3500, Math.max(2500, (22000 - 1500) / numLines))
  const fadeInMs = 500
  const scrollMs = 600
  const outroMs = 5000 // 5 second end card with song title + artist + branding

  const totalMs = numLines * perLineDuration + outroMs
  const totalFrames = Math.ceil((totalMs / 1000) * FPS)

  // Prepare background canvas (cached, painted once) — no title/emoji
  const bgCanvas = document.createElement('canvas')
  bgCanvas.width = W
  bgCanvas.height = H
  const bgCtx = bgCanvas.getContext('2d')

  if (template.fontGoogle) {
    await ensureGoogleFont(template.fontGoogle)
  }

  await paintBackground(bgCtx, W, H, template, coverImageUrl)

  // Frame canvas
  const frameCanvas = document.createElement('canvas')
  frameCanvas.width = W
  frameCanvas.height = H
  const frameCtx = frameCanvas.getContext('2d')

  // Scale factor for text sizes when rendering at lower resolution
  const scale = W / 1080

  // Pre-wrap all lines and compute per-block heights
  const maxTextWidth = W - Math.round(160 * scale)
  const wrapLineHeight = Math.round(76 * scale)
  const blockGap = Math.round(30 * scale)
  const fontSize = Math.round(52 * scale)

  frameCtx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
  const wrappedBlocks = selectedLines.map(text => wrapText(frameCtx, text, maxTextWidth))
  const blockHeights = wrappedBlocks.map(lines => lines.length * wrapLineHeight)

  // Cumulative Y offsets for each block (in virtual scroll space)
  const blockY = []
  let cumY = 0
  for (let i = 0; i < numLines; i++) {
    blockY.push(cumY)
    cumY += blockHeights[i] + blockGap
  }

  // Center anchor
  const anchorY = H / 2 + Math.round(60 * scale)

  // ── Generate blurred preview image ───────────────────────────────────────
  if (onPreview) {
    // Draw a preview frame: background + watermark + first line dimly visible
    frameCtx.drawImage(bgCanvas, 0, 0)
    paintWatermark(frameCtx, W, H, template, scale)

    // Draw first line at center, dimmed
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

    const firstBlock = wrappedBlocks[0]
    const firstBlockH = blockHeights[0]
    const previewY = anchorY - firstBlockH / 2
    firstBlock.forEach((wLine, wi) => {
      frameCtx.fillText(wLine, W / 2, previewY + wi * wrapLineHeight + wrapLineHeight * 0.7)
    })
    frameCtx.restore()

    // Convert to blob and send preview
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

  // Easing function for smooth scroll
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

  // Render loop
  for (let f = 0; f < totalFrames; f++) {
    const timeMs = (f / FPS) * 1000

    // Draw cached background (includes watermark)
    frameCtx.drawImage(bgCanvas, 0, 0)

    // ── Lyrics scroll-up animation / End card ──────────────────────────────
    const lyricsEndMs = numLines * perLineDuration

    if (timeMs >= lyricsEndMs) {
      // End card only — no watermark
      // End card: song title + artist + branding
      const outroT = timeMs - lyricsEndMs
      const fadeIn = Math.min(1, outroT / 600)

      frameCtx.save()
      frameCtx.globalAlpha = fadeIn
      paintEndCard(frameCtx, W, H, template, songTitle, artistNames, scale)
      frameCtx.restore()
    } else {
      // Draw watermark only during lyrics section
      paintWatermark(frameCtx, W, H, template, scale)

      let activeIdx = 0
      for (let i = 0; i < numLines; i++) {
        if (timeMs >= i * perLineDuration) activeIdx = i
      }

      // Compute smooth scroll offset
      const activeBlockCenter = blockY[activeIdx] + blockHeights[activeIdx] / 2
      const targetScroll = activeBlockCenter

      let scrollOffset
      if (activeIdx === 0) {
        const entryProgress = easeOutCubic(Math.min(1, timeMs / scrollMs))
        scrollOffset = targetScroll * entryProgress
      } else {
        const lineLocalTime = timeMs - activeIdx * perLineDuration
        const prevBlockCenter = blockY[activeIdx - 1] + blockHeights[activeIdx - 1] / 2
        if (lineLocalTime < scrollMs) {
          const scrollProgress = easeOutCubic(lineLocalTime / scrollMs)
          scrollOffset = prevBlockCenter + (targetScroll - prevBlockCenter) * scrollProgress
        } else {
          scrollOffset = targetScroll
        }
      }

      // Draw each visible line
      frameCtx.save()
      frameCtx.font = `${template.fontWeight} ${fontSize}px ${template.font}`
      frameCtx.fillStyle = template.textColor
      frameCtx.textAlign = 'center'

      if (template.textShadow !== false) {
        frameCtx.shadowColor = 'rgba(0,0,0,0.5)'
        frameCtx.shadowBlur = 10
        frameCtx.shadowOffsetX = 0
        frameCtx.shadowOffsetY = 4
      }

      for (let i = 0; i <= activeIdx; i++) {
        const lineStartMs = i * perLineDuration
        const lineAge = timeMs - lineStartMs

        let fadeAlpha = Math.min(1, lineAge / fadeInMs)
        const alpha = fadeAlpha

        if (alpha <= 0) continue

        const visualY = anchorY + blockY[i] - scrollOffset
        const blockBottom = visualY + blockHeights[i]
        if (blockBottom < 150 || visualY > H - 100) continue

        frameCtx.globalAlpha = alpha
        wrappedBlocks[i].forEach((wLine, wi) => {
          frameCtx.fillText(wLine, W / 2, visualY + wi * wrapLineHeight + wrapLineHeight * 0.7)
        })
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


// ── useClipMode Hook ─────────────────────────────────────────────────────────

export function useClipMode({ initialSong }) {
  const [isClipMode, setIsClipMode] = useState(false)
  const [selectedLines, setSelectedLines] = useState([])
  const [showClipPreview, setShowClipPreview] = useState(false)
  const [clipVideoBlob, setClipVideoBlob] = useState(null)
  const [clipPreviewImage, setClipPreviewImage] = useState(null)
  const [isGeneratingClip, setIsGeneratingClip] = useState(false)
  const [clipProgress, setClipProgress] = useState(0)
  const [clipTemplate, setClipTemplate] = useState(STORY_TEMPLATES[0])

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

  const handleCreateClip = useCallback(async () => {
    if (selectedLines.length < 2) return
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
        coverImageUrl: initialSong.coverImage || null,
        template: clipTemplate,
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
        coverImageUrl: initialSong.coverImage || null,
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
    showClipPreview,
    setShowClipPreview,
    clipVideoBlob,
    setClipVideoBlob,
    clipPreviewImage,
    isGeneratingClip,
    clipProgress,
    clipTemplate,
    handleLineToggle,
    handleCreateClip,
    handleClipTemplateChange,
    exitClipMode,
  }
}


// ── ClipPreviewModal Component ───────────────────────────────────────────────

export function ClipPreviewModal({ isOpen, onClose, clipVideoBlob, clipPreviewImage, isGenerating, clipProgress, songTitle, onTemplateChange, selectedTemplate }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

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

  if (!isOpen) return null

  const handleDownload = () => {
    if (!blobUrl) return
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-5 animate-slideUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <FiVideo className="w-5 h-5 text-cyan-500" />
          Clip Preview
        </h3>

        {isGenerating ? (
          <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-900">
            {/* Blurred preview image behind spinner */}
            {previewUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt=""
                className="w-full h-auto opacity-60"
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
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-lg bg-slate-900">
              <video
                src={blobUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-auto max-h-[50vh] object-contain"
              />
              {isRegenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Template selector chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>{tmpl.emoji}</span>
                  <span>{tmpl.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
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
          </>
        ) : null}
      </div>
    </div>
  )
}
