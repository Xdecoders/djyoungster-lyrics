import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { generateImageSizes } from '@/lib/imageProcessor'

export async function GET() {
  try {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

    let files
    try {
      files = await readdir(uploadDir)
    } catch {
      return NextResponse.json({ message: 'Upload directory not found', processed: 0 })
    }

    // Find image files that don't already have size suffixes
    const sizePattern = /-(md|sm|thumb)\.webp$/
    const imagePattern = /\.(jpg|jpeg|png|webp|gif)$/i
    const sourceFiles = files.filter(f => imagePattern.test(f) && !sizePattern.test(f))

    let processed = 0
    const errors = []

    for (const filename of sourceFiles) {
      const baseName = filename.replace(/\.[^.]+$/, '')

      // Skip if sized variants already exist
      const hasMd = files.includes(`${baseName}-md.webp`)
      const hasSm = files.includes(`${baseName}-sm.webp`)
      if (hasMd && hasSm) continue

      try {
        const filepath = path.join(uploadDir, filename)
        const buffer = await readFile(filepath)
        await generateImageSizes(buffer, baseName, uploadDir)
        processed++
      } catch (err) {
        errors.push({ file: filename, error: err.message })
      }
    }

    return NextResponse.json({
      message: `Migration complete. Processed ${processed} images.`,
      processed,
      skipped: sourceFiles.length - processed - errors.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('[MigrateImages] Error:', error)
    return NextResponse.json(
      { message: 'Migration error: ' + error.message },
      { status: 500 }
    )
  }
}
