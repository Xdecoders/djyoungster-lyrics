import { NextResponse } from 'next/server'
import { mkdir, access } from 'fs/promises'
import path from 'path'
import { generateImageSizes } from '@/lib/imageProcessor'

// Block private/internal IP ranges to prevent SSRF
function isPrivateUrl(urlString) {
  try {
    const url = new URL(urlString)
    const hostname = url.hostname

    // Block non-HTTP protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return true
    }

    // Block localhost and loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
      return true
    }

    // Block private IP ranges
    const parts = hostname.split('.').map(Number)
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true
      // 169.254.0.0/16 (AWS IMDS, link-local)
      if (parts[0] === 169 && parts[1] === 254) return true
      // 0.0.0.0/8
      if (parts[0] === 0) return true
    }

    return false
  } catch {
    return true
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { message: 'No URL provided' },
        { status: 400 }
      )
    }

    // Validate URL format
    let imageUrl
    try {
      imageUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { message: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // SSRF protection: block private/internal URLs
    if (isPrivateUrl(url)) {
      return NextResponse.json(
        { message: 'URL not allowed: private or internal addresses are blocked' },
        { status: 400 }
      )
    }

    console.log('[UploadFromURL] Downloading image from:', url)

    // Fetch the image with timeout and redirect limit
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    let response
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal,
        redirect: 'follow',
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        return NextResponse.json(
          { message: 'Request timed out while fetching image' },
          { status: 408 }
        )
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }

    // Check if we were redirected to a private URL
    if (response.url && response.url !== url && isPrivateUrl(response.url)) {
      return NextResponse.json(
        { message: 'URL not allowed: redirected to a private address' },
        { status: 400 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: 400 }
      )
    }

    const contentType = response.headers.get('content-type') || ''

    // Validate content type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const isValidImage = validTypes.some(type => contentType.includes(type))

    if (!isValidImage) {
      // Try to detect from URL extension as fallback
      const ext = path.extname(imageUrl.pathname).toLowerCase()
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      if (!validExtensions.includes(ext)) {
        return NextResponse.json(
          { message: 'Invalid image type. Only JPEG, PNG, WebP, and GIF are allowed.' },
          { status: 400 }
        )
      }
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { message: 'Image too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique base name
    const timestamp = Date.now()
    const baseName = `${timestamp}-downloaded`

    // Use UPLOAD_DIR env variable if set, otherwise fall back to public/uploads
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

    console.log('[UploadFromURL] Upload directory:', uploadDir)

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true })

    // Verify directory is writable
    try {
      await access(uploadDir, 2)
    } catch (err) {
      console.error('[UploadFromURL] Directory not writable:', uploadDir)
      return NextResponse.json(
        { message: 'Upload directory not writable' },
        { status: 500 }
      )
    }

    // Generate all image sizes (returns main WebP path)
    const localUrl = await generateImageSizes(buffer, baseName, uploadDir)
    console.log('[UploadFromURL] Images generated:', localUrl)

    return NextResponse.json({
      url: localUrl,
      filename: `${baseName}.webp`,
      originalUrl: url,
      message: 'Image downloaded and saved successfully'
    })
  } catch (error) {
    console.error('[UploadFromURL] Error:', error)
    return NextResponse.json(
      { message: 'Error downloading image' },
      { status: 500 }
    )
  }
}
