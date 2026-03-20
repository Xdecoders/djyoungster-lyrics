import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/verifyAdmin'

export async function GET(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  const categories = await prisma.blogCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { posts: true } } },
  })

  return NextResponse.json(categories)
}

export async function POST(request) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const data = await request.json()
    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        color: data.color || null,
        icon: data.icon || null,
        sortOrder: data.sortOrder || 0,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
