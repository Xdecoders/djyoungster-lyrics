import SongsPageClient from './SongsPageClient'
import { getSeoSettings } from '@/lib/seo'

export async function generateMetadata() {
  const seo = await getSeoSettings('songs')

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: 'https://djyoungster.com/songs',
      siteName: 'DJYoungster',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: 'https://djyoungster.com/songs',
    },
  }
}

export default function SongsPage() {
  return <SongsPageClient />
}
