import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch AdSense settings
export async function GET() {
  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'adsense' }
    })

    if (settings?.metaKeywords) {
      try {
        return NextResponse.json(JSON.parse(settings.metaKeywords))
      } catch (e) {}
    }

    return NextResponse.json({
      enabled: false,
      publisherId: '',
      webStoryAdsEnabled: false,
      webStoryAdSlot: '',
    })
  } catch (error) {
    console.error('Error fetching AdSense settings:', error)
    return NextResponse.json({ enabled: false, publisherId: '' })
  }
}

// POST - Save AdSense settings
export async function POST(request) {
  try {
    const data = await request.json()
    const { enabled, publisherId, webStoryAdsEnabled, webStoryAdSlot } = data

    // Get existing settings first
    const existing = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'adsense' }
    })

    let existingData = {}
    if (existing?.metaKeywords) {
      try {
        existingData = JSON.parse(existing.metaKeywords)
      } catch (e) {}
    }

    const settingsJson = JSON.stringify({
      ...existingData,
      ...(enabled !== undefined && { enabled }),
      ...(publisherId !== undefined && { publisherId }),
      ...(webStoryAdsEnabled !== undefined && { webStoryAdsEnabled }),
      ...(webStoryAdSlot !== undefined && { webStoryAdSlot }),
    })

    await prisma.siteSeoSettings.upsert({
      where: { pageKey: 'adsense' },
      update: { metaKeywords: settingsJson },
      create: {
        pageKey: 'adsense',
        pageTitle: 'AdSense Settings',
        metaTitle: 'AdSense Settings',
        metaKeywords: settingsJson,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving AdSense settings:', error)
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 })
  }
}
