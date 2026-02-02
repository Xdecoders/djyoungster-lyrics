import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { ThemeProvider } from '@/context/ThemeContext'
import { getSiteSettings } from '@/lib/seo'

export async function generateMetadata() {
  const siteSettings = await getSiteSettings()
  const faviconUrl = siteSettings.favicon || '/favicon.svg'

  return {
    title: 'DJYoungster Lyrics - Find Your Favorite Song Lyrics',
    description: 'Discover thousands of song lyrics from Bollywood, Punjabi, English, Tamil, Telugu and more. Search, read, and sing along to your favorite songs.',
    keywords: 'lyrics, song lyrics, Bollywood lyrics, Punjabi lyrics, Hindi songs, English songs',
    icons: {
      icon: faviconUrl,
      apple: faviconUrl,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <GoogleAnalytics />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}