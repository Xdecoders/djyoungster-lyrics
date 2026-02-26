import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(redirects)
  } catch {
    return NextResponse.json({ message: 'Error fetching redirects' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    if (!data.oldUrl?.trim() || !data.newUrl?.trim()) {
      return NextResponse.json({ message: 'Old URL and New URL are required' }, { status: 400 })
    }

    const oldUrl = data.oldUrl.trim().startsWith('/')
      ? data.oldUrl.trim()
      : `/${data.oldUrl.trim()}`

    const redirect = await prisma.redirect.create({
      data: {
        oldUrl,
        newUrl: data.newUrl.trim(),
        type: data.type ? parseInt(data.type) : 301,
        isActive: data.isActive !== false,
        note: data.note?.trim() || null
      }
    })

    return NextResponse.json(redirect, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A redirect for this URL already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Error creating redirect' }, { status: 500 })
  }
}
