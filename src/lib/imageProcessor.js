import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const SIZES = [
  { suffix: '',       maxWidth: 1200 },                         // Large (main/original)
  { suffix: '-md',    maxWidth: 640 },                          // Medium (desktop cards)
  { suffix: '-sm',    maxWidth: 320 },                          // Small (mobile cards)
  { suffix: '-thumb', maxWidth: 96 },                           // Thumbnail (lists)
  { suffix: '-story', fixedWidth: 720, fixedHeight: 1280 },     // AMP Web Story portrait 9:16
]

/**
 * Generate multiple WebP sizes from an image buffer.
 * @param {Buffer} buffer - The original image buffer
 * @param {string} baseName - Base filename without extension (e.g. "1234567890-photo")
 * @param {string} uploadDir - Absolute path to upload directory
 * @returns {Promise<string>} The public URL path to the main image (/uploads/baseName.webp)
 */
export async function generateImageSizes(buffer, baseName, uploadDir) {
  await mkdir(uploadDir, { recursive: true })

  const image = sharp(buffer)
  const metadata = await image.metadata()
  const originalWidth = metadata.width || 1200

  for (const { suffix, maxWidth, fixedWidth, fixedHeight } of SIZES) {
    const filename = `${baseName}${suffix}.webp`
    const filepath = path.join(uploadDir, filename)

    let pipeline = sharp(buffer)

    if (fixedWidth && fixedHeight) {
      // Center-crop to exact portrait dimensions (e.g. AMP Web Story)
      pipeline = pipeline.resize({ width: fixedWidth, height: fixedHeight, fit: 'cover', position: 'centre' })
    } else if (originalWidth > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
    }

    const webpBuffer = await pipeline.webp({ quality: 85 }).toBuffer()
    await writeFile(filepath, webpBuffer)
  }

  return `/uploads/${baseName}.webp`
}
