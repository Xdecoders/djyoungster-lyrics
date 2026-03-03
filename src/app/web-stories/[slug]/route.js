import { prisma } from '@/lib/prisma'

const SITE_URL = 'https://djyoungster.com'
const PUBLISHER = 'DJYoungster'
const LOGO_URL = `${SITE_URL}/logo.png`
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

function getLyricChunks(rawLyrics) {
  const text = rawLyrics
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const chunks = []
  for (let i = 0; i < lines.length; i += 4) {
    chunks.push(lines.slice(i, i + 4))
  }
  return chunks
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET(request, { params }) {
  const { slug } = await params

  const song = await prisma.song.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      lyrics: true,
      coverImage: true,
      hasWebStory: true,
      createdAt: true,
      updatedAt: true,
      artists: {
        select: { artist: { select: { name: true } } }
      }
    }
  })

  if (!song || !song.hasWebStory) {
    return new Response('Not Found', { status: 404 })
  }

  const artistNames = song.artists.map(sa => sa.artist.name).join(', ') || PUBLISHER
  const chunks = getLyricChunks(song.lyrics || '')
  const coverImg = song.coverImage || `${SITE_URL}/og-default.jpg`
  // Use portrait-cropped story variant for AMP images if available (720×1280)
  const coverStoryImg = coverImg.startsWith('/uploads/') && coverImg.endsWith('.webp')
    ? coverImg.replace(/\.webp$/, '-story.webp')
    : coverImg
  const songUrl = `${SITE_URL}/song/${song.slug}`
  const storyUrl = `${SITE_URL}/web-stories/${song.slug}`
  const titleEsc = escapeHtml(song.title)
  const artistEsc = escapeHtml(artistNames)

  const lyricSlides = chunks.map((chunk, i) => `
    <amp-story-page id="lyrics-${i}">
      <amp-story-grid-layer template="fill">
        <amp-img src="${escapeHtml(coverStoryImg)}" width="720" height="1280" layout="fill" class="lyrics-bg"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill">
        <div class="lyrics-overlay"></div>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill">
        <div class="lyrics-center-wrap">
          <div class="lyrics-card">
            <p class="lyric-text">${escapeHtml(chunk.join('\n'))}</p>
          </div>
          <p class="slide-watermark">DJYoungster</p>
        </div>
      </amp-story-grid-layer>
    </amp-story-page>`).join('')

  const ampHtml = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story"
    src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <script async custom-element="amp-analytics"
    src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <title>${titleEsc} - Lyric Story | ${PUBLISHER}</title>
  <link rel="canonical" href="${storyUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    amp-story { font-family: 'Google Sans', sans-serif; }
    /* Cover slide — blurred bg */
    .cover-bg {
      filter: blur(12px);
      transform: scale(1.15);
    }
    .cover-overlay {
      background: rgba(0,0,0,0.55);
    }
    .cover-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 100%;
      height: 100%;
      padding: 40px 28px;
      box-sizing: border-box;
    }
    .song-title {
      font-size: 28px;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 2px 12px rgba(0,0,0,0.7);
      margin: 0 0 10px;
      line-height: 1.25;
      text-align: center;
    }
    .artist-name {
      font-size: 16px;
      font-weight: 400;
      color: rgba(255,255,255,0.9);
      margin: 0 0 16px;
      text-shadow: 0 1px 6px rgba(0,0,0,0.6);
      text-align: center;
    }
    .watermark {
      font-size: 11px;
      font-weight: 400;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.5px;
      margin: 0;
      text-align: center;
    }
    /* Lyric slides */
    .lyrics-bg {
      filter: blur(6px);
      transform: scale(1.08);
    }
    .lyrics-overlay {
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.65);
    }
    .lyrics-center-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 24px;
      box-sizing: border-box;
    }
    .slide-watermark {
      position: absolute;
      bottom: 14px;
      right: 18px;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.55);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      margin: 0;
    }
    .lyrics-card {
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 28px 24px;
      width: 100%;
    }
    .lyric-text {
      font-size: 22px;
      font-weight: 600;
      color: #fff;
      line-height: 1.7;
      text-align: center;
      white-space: pre-line;
      text-shadow: 0 1px 6px rgba(0,0,0,0.4);
      margin: 0;
    }
    .end-overlay {
      background: rgba(0,0,0,0.72);
    }
    .end-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 48px 28px 80px;
      box-sizing: border-box;
      text-align: center;
    }
    .end-pill {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin: 0 0 20px;
    }
    .end-title {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
      line-height: 1.25;
      text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    .end-artist {
      font-size: 15px;
      font-weight: 400;
      color: rgba(255,255,255,0.75);
      margin: 0 0 24px;
    }
    .end-divider {
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 2px;
      margin: 0 0 20px;
    }
    .end-sub {
      font-size: 14px;
      font-weight: 400;
      color: rgba(255,255,255,0.6);
      margin: 0 0 4px;
    }
    .end-brand {
      font-size: 13px;
      font-weight: 600;
      color: #10b981;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .cta-btn {
      display: inline-block;
      padding: 14px 36px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      border-radius: 50px;
      text-decoration: none;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 20px rgba(16,185,129,0.4);
    }
  </style>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${song.title} Lyrics Story`,
    "image": coverImg,
    "url": storyUrl,
    "datePublished": song.createdAt,
    "dateModified": song.updatedAt,
    "author": {
      "@type": "Organization",
      "name": PUBLISHER,
      "url": SITE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": PUBLISHER,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": storyUrl
    }
  })}</script>
</head>
<body>
  <amp-story standalone
    title="${titleEsc}"
    publisher="${PUBLISHER}"
    publisher-logo-src="${LOGO_URL}"
    poster-portrait-src="${escapeHtml(coverStoryImg)}">

    ${GA_ID ? `<amp-analytics type="gtag" data-credentials="include">
      <script type="application/json">
        {
          "vars": {
            "gtag_id": "${GA_ID}",
            "config": { "${GA_ID}": { "groups": "default" } }
          }
        }
      </script>
    </amp-analytics>` : ''}

    <!-- Cover slide -->
    <amp-story-page id="cover">
      <amp-story-grid-layer template="fill">
        <amp-img src="${escapeHtml(coverStoryImg)}" width="720" height="1280" layout="fill" class="cover-bg"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill" class="cover-overlay">
        <div class="cover-content">
          <h1 class="song-title">${titleEsc} Lyrics</h1>
          <p class="artist-name">${artistEsc}</p>
          <p class="watermark">Lyrics Story by DJYoungster</p>
        </div>
      </amp-story-grid-layer>
    </amp-story-page>

    ${lyricSlides}

    <!-- CTA slide -->
    <amp-story-page id="end">
      <amp-story-grid-layer template="fill">
        <amp-img src="${escapeHtml(coverStoryImg)}" width="720" height="1280" layout="fill" class="cover-bg"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill" class="end-overlay">
        <div class="end-content">
          <p class="end-pill">Lyrics Story</p>
          <p class="end-title">${titleEsc}</p>
          <p class="end-artist">${artistEsc}</p>
          <div class="end-divider"></div>
          <p class="end-sub">Create Instagram Story / Reel</p>
          <p class="end-brand">with these lyrics on DJYoungster</p>
        </div>
      </amp-story-grid-layer>
      <amp-story-cta-layer>
        <a href="${songUrl}" class="cta-btn">Create Story / Reel →</a>
      </amp-story-cta-layer>
    </amp-story-page>

  </amp-story>
</body>
</html>`

  return new Response(ampHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    }
  })
}
