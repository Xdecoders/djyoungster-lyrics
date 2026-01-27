import MoviesPageClient from './MoviesPageClient'
import { getSeoSettings } from '@/lib/seo'

export async function generateMetadata() {
  const seo = await getSeoSettings('movies')

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: 'https://djyoungster.com/movies',
      siteName: 'DJYoungster',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: 'https://djyoungster.com/movies',
    },
  }
}

export default function MoviesPage() {
  return <MoviesPageClient />
}
