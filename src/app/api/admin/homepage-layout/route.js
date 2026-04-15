import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

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
      where: { pageKey: 'homepage-layout' }
    })

    if (settings?.metaKeywords) {
      try {
        return NextResponse.json(JSON.parse(settings.metaKeywords))
      } catch {}
    }

    return NextResponse.json({ activeHomepage: 'v1' })
  } catch (error) {
    console.error('Error fetching homepage layout:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminId = await getAdminId(request)
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { activeHomepage } = await request.json()
    if (!['v1', 'v2'].includes(activeHomepage)) {
      return NextResponse.json({ message: 'Invalid value' }, { status: 400 })
    }

    await prisma.siteSeoSettings.upsert({
      where: { pageKey: 'homepage-layout' },
      create: {
        id: 'homepage-layout',
        pageKey: 'homepage-layout',
        metaKeywords: JSON.stringify({ activeHomepage }),
        updatedAt: new Date(),
      },
      update: {
        metaKeywords: JSON.stringify({ activeHomepage }),
        updatedAt: new Date(),
      },
    })

    revalidateTag('homepage')

    return NextResponse.json({ activeHomepage })
  } catch (error) {
    console.error('Error saving homepage layout:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
