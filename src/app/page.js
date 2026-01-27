import HomePageClient from './HomePageClient'
import { getSeoSettings } from '@/lib/seo'

export async function generateMetadata() {
  const seo = await getSeoSettings('homepage')

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: 'https://djyoungster.com',
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    alternates: {
      canonical: 'https://djyoungster.com',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function Home() {
  return <HomePageClient />
}
