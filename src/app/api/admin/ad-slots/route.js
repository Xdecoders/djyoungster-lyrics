import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function getAdminId(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const payload = await verifyToken(token)
  return payload?.adminId || null
}

export async function GET(request) {
  try {
    const adminId = await getAdminId(request)
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

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
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const adminId = await getAdminId(request)
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { afterFeaturedImage, beforeRating, sidebar } = await request.json()
    const data = JSON.stringify({
      afterFeaturedImage: afterFeaturedImage || '',
      beforeRating: beforeRating || '',
      sidebar: sidebar || '',
    })

    await prisma.siteSeoSettings.upsert({
      where: { pageKey: 'ad-slots' },
      update: { metaKeywords: data },
      create: { pageKey: 'ad-slots', metaKeywords: data }
    })

    return NextResponse.json({ message: 'Ad slots saved successfully' })
  } catch (error) {
    console.error('Error saving ad slots:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
