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

// GET - fetch code snippets
export async function GET(request) {
  try {
    const adminId = await getAdminId(request)
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.siteSeoSettings.findUnique({
      where: { pageKey: 'code-snippets' }
    })

    if (settings?.metaKeywords) {
      try {
        return NextResponse.json(JSON.parse(settings.metaKeywords))
      } catch {}
    }

    return NextResponse.json({ headerCode: '', footerCode: '' })
  } catch (error) {
    console.error('Error fetching code snippets:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PUT - save code snippets
export async function PUT(request) {
  try {
    const adminId = await getAdminId(request)
    if (!adminId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { headerCode, footerCode, headerPages, footerPages } = await request.json()
    const data = JSON.stringify({
      headerCode: headerCode || '',
      footerCode: footerCode || '',
      headerPages: headerPages || [],
      footerPages: footerPages || [],
    })

    await prisma.siteSeoSettings.upsert({
      where: { pageKey: 'code-snippets' },
      update: { metaKeywords: data },
      create: { pageKey: 'code-snippets', metaKeywords: data }
    })

    return NextResponse.json({ message: 'Code snippets saved successfully' })
  } catch (error) {
    console.error('Error saving code snippets:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
