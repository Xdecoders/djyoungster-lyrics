import { NextResponse } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import path from 'path'

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

    // Determine file extension
    let extension = '.jpg'
    if (contentType.includes('png')) extension = '.png'
    else if (contentType.includes('webp')) extension = '.webp'
    else if (contentType.includes('gif')) extension = '.gif'
    else {
      // Try from URL
      const urlExt = path.extname(imageUrl.pathname).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt)) {
        extension = urlExt === '.jpeg' ? '.jpg' : urlExt
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-downloaded${extension}`

    // Use UPLOAD_DIR env variable if set, otherwise fall back to public/uploads
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

    console.log('[UploadFromURL] Upload directory:', uploadDir)

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      console.log('[UploadFromURL] mkdir result:', err?.code || 'created')
    }

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

    // Write file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    console.log('[UploadFromURL] File saved to:', filepath)

    // Return the public URL
    const localUrl = `/uploads/${filename}`

    return NextResponse.json({
      url: localUrl,
      filename,
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
