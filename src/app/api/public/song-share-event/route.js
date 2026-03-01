import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { songId, type } = await request.json()
    if (!songId || !['story', 'reel'].includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await prisma.songShareEvent.create({ data: { songId, type } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
