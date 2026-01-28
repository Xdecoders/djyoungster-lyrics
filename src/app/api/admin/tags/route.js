import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all tags
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where = search
      ? { name: { contains: search } }
      : {}

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: { songs: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST - Create a new tag
export async function POST(request) {
  try {
    const data = await request.json()
    const { name } = data

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // Check if tag already exists
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name } },
          { slug: { equals: slug } }
        ]
      }
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const tag = await prisma.tag.create({
      data: { name, slug }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
