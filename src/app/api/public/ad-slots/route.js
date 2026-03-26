import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'ad-slots' }
    })

    if (settings?.metaKeywords) {
      try {
        return NextResponse.json(JSON.parse(settings.metaKeywords))
      } catch {}
    }

    return NextResponse.json({ afterFeaturedImage: '', beforeRating: '', sidebar: '' })
  } catch (error) {
    console.error('Error fetching ad slots:', error)
    return NextResponse.json({ afterFeaturedImage: '', beforeRating: '', sidebar: '' })
  }
}
