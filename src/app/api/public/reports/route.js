import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// Submit a report (public)
export async function POST(request) {
  try {
    const data = await request.json()
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

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
