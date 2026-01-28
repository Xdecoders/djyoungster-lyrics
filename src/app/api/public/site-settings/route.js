import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'global' }
    })

    if (settings?.metaKeywords) {
      try {
        const parsed = JSON.parse(settings.metaKeywords)
        return NextResponse.json({
          favicon: parsed.favicon || null,
          heroHeading: parsed.heroHeading || null,
          heroDescription: parsed.heroDescription || null,
        })
      } catch (e) {
        return NextResponse.json({ favicon: null, heroHeading: null, heroDescription: null })
      }
    }

    return NextResponse.json({ favicon: null, heroHeading: null, heroDescription: null })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ favicon: null, heroHeading: null, heroDescription: null })
  }
}
