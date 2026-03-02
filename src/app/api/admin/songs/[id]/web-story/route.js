import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// POST - Enable web story for a song
export async function POST(request, { params }) {
  try {
    const { id } = await params

    const song = await prisma.song.update({
      where: { id },
      data: { hasWebStory: true },
      select: { id: true, slug: true, hasWebStory: true }
    })

    try {
      revalidatePath(`/song/${song.slug}`)
      revalidatePath(`/web-stories/${song.slug}`)
      revalidatePath('/web-stories')
      revalidatePath('/')
    } catch (e) {
      console.log('[WebStory] Revalidation note:', e.message)
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error enabling web story:', error)
    return NextResponse.json({ message: 'Error enabling web story' }, { status: 500 })
  }
}

// DELETE - Disable web story for a song
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const song = await prisma.song.update({
      where: { id },
      data: { hasWebStory: false },
      select: { id: true, slug: true, hasWebStory: true }
    })

    try {
      revalidatePath(`/song/${song.slug}`)
      revalidatePath(`/web-stories/${song.slug}`)
      revalidatePath('/web-stories')
      revalidatePath('/')
    } catch (e) {
      console.log('[WebStory] Revalidation note:', e.message)
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error disabling web story:', error)
    return NextResponse.json({ message: 'Error disabling web story' }, { status: 500 })
  }
}
