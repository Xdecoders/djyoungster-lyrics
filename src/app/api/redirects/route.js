import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      where: { isActive: true },
      select: { oldUrl: true, newUrl: true, type: true }
    })
    return NextResponse.json(redirects, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    })
  } catch {
    return NextResponse.json([])
  }
}
