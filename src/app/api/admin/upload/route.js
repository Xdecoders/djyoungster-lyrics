import { NextResponse } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const filename = `${timestamp}-${originalName}`

    // Use UPLOAD_DIR env variable if set, otherwise fall back to public/uploads
    // For production VPS, set UPLOAD_DIR to absolute path like /var/www/djyoungster/public/uploads
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

    console.log('[Upload] process.cwd():', process.cwd())
    console.log('[Upload] Upload directory:', uploadDir)

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      console.log('[Upload] mkdir result:', err?.code || 'created')
    }

    // Verify directory is writable
    try {
      await access(uploadDir, 2) // 2 = fs.constants.W_OK (write permission)
    } catch (err) {
      console.error('[Upload] Directory not writable:', uploadDir)
      return NextResponse.json(
        { message: `Upload directory not writable: ${uploadDir}` },
        { status: 500 }
      )
    }

    // Write file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    console.log('[Upload] File saved to:', filepath)

    // Return the public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      url,
      filename,
      savedTo: filepath, // Include for debugging
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { message: 'Error uploading file: ' + error.message },
      { status: 500 }
    )
  }
}
