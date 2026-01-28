import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = await params

    const page = await prisma.page.findUnique({
      where: {
        slug,
        isPublished: true
      }
    })

    if (!page) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { message: 'Error fetching page' },
      { status: 500 }
    )
  }
}
