const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

export const metadata = {
  title: 'Unsubscribe | DJYoungster',
  description: 'Unsubscribe from DJYoungster newsletter.',
  openGraph: {
    title: 'Unsubscribe | DJYoungster',
    description: 'Unsubscribe from DJYoungster newsletter.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Unsubscribe | DJYoungster',
    creator: '@djyoungstercom',
    site: '@djyoungstercom',
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/unsubscribe`,
  },
}

export default function UnsubscribeLayout({ children }) {
  return children
}
