import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
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

    // Map MIME type to correct extension
    const extMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    }
    const ext = extMap[file.type] || '.jpg'

    // Generate clean filename: strip existing extension and special chars, then add correct extension
    const baseName = file.name
      .replace(/\.[^.]+$/, '')        // Remove original extension
      .replace(/[^a-zA-Z0-9-]/g, '-') // Replace special chars with hyphens
      .replace(/-+/g, '-')            // Collapse multiple hyphens
      .replace(/^-|-$/g, '')          // Trim leading/trailing hyphens
      .substring(0, 80)               // Limit length
    const timestamp = Date.now()
    const filename = `${timestamp}-${baseName}${ext}`

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    // Write file
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      url,
      filename,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { message: 'Error uploading file: ' + error.message },
      { status: 500 }
    )
  }
}
