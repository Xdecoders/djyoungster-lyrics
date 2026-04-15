import { Inter_Tight } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import VisitorTracker from '@/components/VisitorTracker'
import { ThemeProvider } from '@/context/ThemeContext'
import { getSiteSettings, getCodeSnippets } from '@/lib/seo'
import CodeSnippetInjector from '@/components/CodeSnippetInjector'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter-tight',
})

export async function generateMetadata() {
  const siteSettings = await getSiteSettings()
  const faviconUrl = siteSettings.favicon || '/favicon.svg'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  return {
    metadataBase: new URL(siteUrl),
    title: 'DJYoungster Lyrics - Find Your Favorite Song Lyrics',
    description: 'Discover thousands of song lyrics from Bollywood, Punjabi, English, Tamil, Telugu and more. Search, read, and sing along to your favorite songs.',
    openGraph: {
      siteName: 'DJYoungster',
      type: 'website',
      locale: 'en_IN',
      alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
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
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

// Parse a snippet string into an array of { type: 'external'|'inline', src?, content? }
function parseSnippetTags(code) {
  if (!code?.trim()) return []
  const results = []
  const regex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(code)) !== null) {
    const attrStr = match[1]
    const inline = match[2].trim()
    const srcM = attrStr.match(/src=["']([^"']+)["']/)
    if (srcM) {
      results.push({ type: 'external', src: srcM[1] })
    } else if (inline) {
      results.push({ type: 'inline', content: inline })
    }
  }
  // Raw JS with no wrapping <script> tags
  if (results.length === 0 && code.trim() && !code.trim().startsWith('<')) {
    results.push({ type: 'inline', content: code.trim() })
  }
  return results
}

function isAll(pages) {
  return !pages || pages.length === 0 || pages.includes('all')
}

export default async function RootLayout({ children }) {
  const [siteSettings, codeSnippets] = await Promise.all([
    getSiteSettings(),
    getCodeSnippets(),
  ])
  const faviconUrl = siteSettings.favicon || '/favicon.svg'

  // "Entire site" snippets are injected SSR. Specific-page snippets go to CodeSnippetInjector.
  const headerAll = isAll(codeSnippets.headerPages)
  const footerAll = isAll(codeSnippets.footerPages)

  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        {/* SSR: header snippet for "Entire site" — appears in initial HTML */}
        {headerAll && parseSnippetTags(codeSnippets.headerCode).map((s, i) =>
          s.type === 'external'
            ? <script key={`hs-${i}`} src={s.src} async />
            : <script key={`hs-${i}`} dangerouslySetInnerHTML={{ __html: s.content }} />
        )}
      </head>
      <body className={`${interTight.className} min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors`}>
        <GoogleAnalytics />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","hsvbmdjkxt");`,
          }}
        />
        {/* SSR: footer snippet for "Entire site" */}
        {footerAll && parseSnippetTags(codeSnippets.footerCode).map((s, i) =>
          s.type === 'external'
            ? <Script key={`fs-${i}`} id={`footer-snippet-ext-${i}`} src={s.src} strategy="afterInteractive" />
            : <Script key={`fs-${i}`} id={`footer-snippet-inline-${i}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: s.content }} />
        )}
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <VisitorTracker />
        </ThemeProvider>
        {/* Client-side: specific page targeting only */}
        {(!headerAll || !footerAll) && (
          <CodeSnippetInjector
            headerCode={!headerAll ? codeSnippets.headerCode : ''}
            headerPages={codeSnippets.headerPages}
            footerCode={!footerAll ? codeSnippets.footerCode : ''}
            footerPages={codeSnippets.footerPages}
          />
        )}
      </body>
    </html>
  )
}