import { NextResponse } from 'next/server'
import { mkdir, access } from 'fs/promises'
import path from 'path'
import { generateImageSizes } from '@/lib/imageProcessor'

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

    console.log('[UploadFromURL] Downloading image from:', url)

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

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
        { message: `Upload directory not writable: ${uploadDir}` },
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
      { message: 'Error downloading image: ' + error.message },
      { status: 500 }
    )
  }
}
