import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const cacheHeaders = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
const defaultSettings = { favicon: null, heroHeading: null, heroDescription: null }

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
        }, { headers: cacheHeaders })
      } catch (e) {
        return NextResponse.json(defaultSettings, { headers: cacheHeaders })
      }
    }

    return NextResponse.json(defaultSettings, { headers: cacheHeaders })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(defaultSettings)
  }
}
