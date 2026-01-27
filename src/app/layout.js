import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata = {
  title: 'DJYoungster Lyrics - Find Your Favorite Song Lyrics',
  description: 'Discover thousands of song lyrics from Bollywood, Punjabi, English, Tamil, Telugu and more. Search, read, and sing along to your favorite songs.',
  keywords: 'lyrics, song lyrics, Bollywood lyrics, Punjabi lyrics, Hindi songs, English songs',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}