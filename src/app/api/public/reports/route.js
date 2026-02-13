import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'

// Submit a report (public)
export async function POST(request) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    const { success } = rateLimit(`report:${ip}`, 5, 60 * 1000)
    if (!success) return rateLimitResponse()

    const data = await request.json()

    if (!data.type) {
      return NextResponse.json(
        { message: 'Report type is required' },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        type: data.type,
        description: data.description || null,
        songId: data.songId || null,
        reporterIp: ip,
        reporterEmail: data.email || null
      }
    })

    return NextResponse.json({ message: 'Report submitted successfully', id: report.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { message: 'Error submitting report' },
      { status: 500 }
    )
  }
}
