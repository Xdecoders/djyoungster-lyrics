import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/verifyAdmin'

export async function GET(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  const cat = await prisma.blogCategory.findUnique({
    where: { id: params.id },
    include: { _count: { select: { posts: true } } },
  })
  if (!cat) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(cat)
}

export async function PATCH(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const data = await request.json()
    const cat = await prisma.blogCategory.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })
    return NextResponse.json(cat)
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.blogCategory.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
