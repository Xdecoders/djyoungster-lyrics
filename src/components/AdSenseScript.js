import Script from 'next/script'

export default function AdSenseScript() {
  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2128567572108655"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
