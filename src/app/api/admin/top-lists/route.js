import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const topLists = await prisma.topList.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        tag: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json(topLists)
  } catch (error) {
    console.error('Error fetching top lists:', error)
    return NextResponse.json(
      { message: 'Error fetching top lists' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const topList = await prisma.topList.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        count: parseInt(data.count) || 50,
        categoryId: data.categoryId || null,
        tagId: data.tagId || null,
        description: data.description || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isPublished: data.isPublished !== undefined ? data.isPublished : true
      }
    })

    return NextResponse.json(topList, { status: 201 })
  } catch (error) {
    console.error('Error creating top list:', error)
    return NextResponse.json(
      { message: 'Error creating top list' },
      { status: 500 }
    )
  }
}
