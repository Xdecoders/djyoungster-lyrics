import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch site settings
export async function GET() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'global' }
    })

    if (settings) {
      // Parse the stored JSON in metaKeywords field (we use it for extra settings)
      let extraSettings = {}
      try {
        if (settings.metaKeywords) {
          extraSettings = JSON.parse(settings.metaKeywords)
        }
      } catch (e) {
        // Invalid JSON, ignore
      }

      return NextResponse.json({
        favicon: extraSettings.favicon || null,
        ogImage: extraSettings.ogImage || null,
        heroHeading: extraSettings.heroHeading || null,
        heroDescription: extraSettings.heroDescription || null,
        ...extraSettings
      })
    }

    return NextResponse.json({ favicon: null, ogImage: null, heroHeading: null, heroDescription: null })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ favicon: null, heroHeading: null, heroDescription: null })
  }
}

// POST - Save site settings
export async function POST(request) {
  try {
    const data = await request.json()
    const { favicon, ogImage, heroHeading, heroDescription } = data

    // Get existing settings first
    const existing = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'global' }
    })

    let existingData = {}
    if (existing?.metaKeywords) {
      try {
        existingData = JSON.parse(existing.metaKeywords)
      } catch (e) {}
    }

    // Merge new settings with existing
    const settingsJson = JSON.stringify({
      ...existingData,
      ...(favicon !== undefined && { favicon }),
      ...(ogImage !== undefined && { ogImage }),
      ...(heroHeading !== undefined && { heroHeading }),
      ...(heroDescription !== undefined && { heroDescription }),
    })

    await prisma.siteSeoSettings.upsert({
      where: { pageKey: 'global' },
      update: {
        metaKeywords: settingsJson,
        metaTitle: 'Global Site Settings',
      },
      create: {
        pageKey: 'global',
        pageTitle: 'Global Settings',
        metaTitle: 'Global Site Settings',
        metaKeywords: settingsJson,
      }
    })

    return NextResponse.json({ success: true, favicon, ogImage, heroHeading, heroDescription })
  } catch (error) {
    console.error('Error saving site settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
