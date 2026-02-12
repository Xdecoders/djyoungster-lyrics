import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Approve or reject a comment
export async function PATCH(request, { params }) {
  try {
    // Auth check
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { approved } = body

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved must be a boolean' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { approved },
      include: {
        song: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Comment ${approved ? 'approved' : 'rejected'} successfully`,
      comment
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a single comment
export async function DELETE(request, { params }) {
  try {
    // Auth check
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
