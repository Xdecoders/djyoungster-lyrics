import ArtistsPageClient from './ArtistsPageClient'
import { getSeoSettings } from '@/lib/seo'

export async function generateMetadata() {
  const seo = await getSeoSettings('artists')

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: 'https://djyoungster.com/artists',
      siteName: 'DJYoungster',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: 'https://djyoungster.com/artists',
    },
  }
}

export default function ArtistsPage() {
  return <ArtistsPageClient />
}
