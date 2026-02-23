import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const topList = await prisma.topList.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        tag: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!topList) {
      return NextResponse.json(
        { message: 'Top list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(topList)
  } catch (error) {
    console.error('Error fetching top list:', error)
    return NextResponse.json(
      { message: 'Error fetching top list' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const topList = await prisma.topList.update({
      where: { id },
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

    return NextResponse.json(topList)
  } catch (error) {
    console.error('Error updating top list:', error)
    return NextResponse.json(
      { message: 'Error updating top list' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.topList.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Top list deleted successfully' })
  } catch (error) {
    console.error('Error deleting top list:', error)
    return NextResponse.json(
      { message: 'Error deleting top list' },
      { status: 500 }
    )
  }
}
