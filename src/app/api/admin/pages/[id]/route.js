import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get single page
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const page = await prisma.page.findUnique({
      where: { id }
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

// Update page
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      )
    }

    // If slug is being changed, check for duplicates
    if (data.slug && data.slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: data.slug }
      })
      if (slugExists) {
        return NextResponse.json(
          { message: 'A page with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isPublished: data.isPublished ?? true
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { message: 'Error updating page' },
      { status: 500 }
    )
  }
}

// Delete page
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.page.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { message: 'Error deleting page' },
      { status: 500 }
    )
  }
}
