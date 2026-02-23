import { Inter_Tight } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter-tight',
})
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import InstallPrompt from '@/components/InstallPrompt'
import PushNotificationManager from '@/components/PushNotificationManager'
import VisitorTracker from '@/components/VisitorTracker'
import { ThemeProvider } from '@/context/ThemeContext'
import { getSiteSettings } from '@/lib/seo'

export async function generateMetadata() {
  const siteSettings = await getSiteSettings()
  const faviconUrl = siteSettings.favicon || '/favicon.svg'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  return {
    metadataBase: new URL(siteUrl),
    title: 'DJYoungster Lyrics - Find Your Favorite Song Lyrics',
    description: 'Discover thousands of song lyrics from Bollywood, Punjabi, English, Tamil, Telugu and more. Search, read, and sing along to your favorite songs.',
    keywords: 'lyrics, song lyrics, Bollywood lyrics, Punjabi lyrics, Hindi songs, English songs',
    openGraph: {
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@djyoungstercom',
      site: '@djyoungstercom',
    },
    icons: {
      icon: faviconUrl,
      apple: faviconUrl,
    },
    verification: {
      google: 'vSWYZG98wKBoc199QiRIv2fEfUO_ghi4m2zmm45FkIQ',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }
}

export default async function RootLayout({ children }) {
  const siteSettings = await getSiteSettings()
  const faviconUrl = siteSettings.favicon || '/favicon.svg'

  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${interTight.className} min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors`}>
        <GoogleAnalytics />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <InstallPrompt />
          <PushNotificationManager />
          <VisitorTracker />
        </ThemeProvider>
      </body>
    </html>
  )
}