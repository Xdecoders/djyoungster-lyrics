import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()

    const updateData = {}
    if (data.oldUrl !== undefined) {
      updateData.oldUrl = data.oldUrl.trim().startsWith('/')
        ? data.oldUrl.trim()
        : `/${data.oldUrl.trim()}`
    }
    if (data.newUrl !== undefined) updateData.newUrl = data.newUrl.trim()
    if (data.type !== undefined) updateData.type = parseInt(data.type)
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.note !== undefined) updateData.note = data.note?.trim() || null

    const redirect = await prisma.redirect.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(redirect)
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A redirect for this URL already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Error updating redirect' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.redirect.delete({ where: { id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ message: 'Error deleting redirect' }, { status: 500 })
  }
}
