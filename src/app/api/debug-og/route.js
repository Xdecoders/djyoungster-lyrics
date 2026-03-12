import { existsSync } from 'fs'
import path from 'path'

export async function GET() {
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
  const slug = 'lagan-lagi'
  const webpPath = path.join(uploadDir, 'og', `${slug}-og.webp`)
  return Response.json({
    cwd: process.cwd(),
    uploadDir,
    webpPath,
    exists: existsSync(webpPath),
  })
}
