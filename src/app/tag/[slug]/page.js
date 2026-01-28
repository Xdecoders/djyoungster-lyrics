import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import TagPageClient from './TagPageClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug }
  })

  if (!tag) {
    return { title: 'Tag Not Found' }
  }

  return {
    title: `${tag.name} Songs - Song Lyrics | DJYoungster`,
    description: `Browse all songs tagged with ${tag.name}. Find lyrics for songs in the ${tag.name} category.`,
  }
}

export default async function TagPage({ params }) {
  const { slug } = await params

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      songs: {
        include: {
          song: {
            include: {
              artists: {
                include: {
                  artist: true
                }
              },
              album: {
                select: {
                  coverImage: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!tag) {
    notFound()
  }

  const songs = tag.songs
    .map(st => st.song)
    .filter(song => song.status === 'published')

  return <TagPageClient initialTag={tag} initialSongs={songs} />
}
