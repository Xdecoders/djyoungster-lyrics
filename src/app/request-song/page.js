import RequestSongForm from './RequestSongForm'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

export const metadata = {
  title: 'Request Song Lyrics - DJYoungster',
  description: 'Can\'t find your favorite song lyrics? Request any song lyrics and we\'ll add them to DJYoungster. Submit your request with song name, artist, and optional details.',
  openGraph: {
    title: 'Request Song Lyrics - DJYoungster',
    description: 'Can\'t find your favorite song lyrics? Request any song lyrics and we\'ll add them to DJYoungster.',
    url: `${siteUrl}/request-song`,
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
  },
  twitter: {
    card: 'summary',
    title: 'Request Song Lyrics - DJYoungster',
    description: 'Can\'t find your favorite song lyrics? Request any song lyrics and we\'ll add them to DJYoungster.',
    creator: '@djyoungstercom',
    site: '@djyoungstercom',
  },
  alternates: {
    canonical: `${siteUrl}/request-song`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RequestSongPage() {
  return <RequestSongForm />
}
