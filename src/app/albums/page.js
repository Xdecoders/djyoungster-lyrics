import AlbumsPageClient from './AlbumsPageClient'
import { getSeoSettings } from '@/lib/seo'

export async function generateMetadata() {
  const seo = await getSeoSettings('albums')

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: 'https://djyoungster.com/albums',
      siteName: 'DJYoungster',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: 'https://djyoungster.com/albums',
    },
  }
}

export default function AlbumsPage() {
  return <AlbumsPageClient />
}
