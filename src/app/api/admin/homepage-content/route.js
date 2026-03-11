import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_ABOUT = `<p>Welcome to <strong>DJYoungster</strong>, your ultimate destination for discovering and exploring song lyrics from around the world. Established as a trusted source for music enthusiasts, we bring together a vast collection of lyrics spanning multiple languages including Hindi, Punjabi, English, Tamil, Telugu, Bhojpuri, Haryanvi, and many more regional languages.</p>
<p>Whether you're looking for the latest Bollywood hits, trending Punjabi tracks, classic English songs, or regional favorites, DJYoungster has you covered. Our platform is designed to help music lovers find accurate lyrics quickly, understand song meanings, discover new artists, and connect with the stories behind every song.</p>
<p><strong>Create Instagram Stories &amp; Reels:</strong> Express yourself with our innovative Instagram Story creator and IG Reel Creator! Select your favorite lyrics (2-4 lines) from any song and transform them into stunning, shareable story images or animated video reels. Choose from beautiful templates including Sad, Happy, Romantic, and Neon themes – perfect for sharing your mood, expressing emotions, or connecting with friends through music on Instagram, WhatsApp, and other social platforms.</p>
<p>DJYoungster is more than just a lyrics website – it's a trusted community for music enthusiasts. We continuously update our database with verified lyrics from new releases, provide romanized versions for non-native speakers, offer English translations for better understanding, and deliver creative tools for social sharing. Trusted by over 35,000+ users monthly, join the DJYoungster family and discover why we're the go-to platform for accurate lyrics and creative expression.</p>`

const DEFAULT_FAQS = [
  {
    question: 'What is DJYoungster?',
    answer: 'DJYoungster is a comprehensive lyrics platform where you can find song lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more. We provide accurate lyrics, artist information, album details, music streaming links, and an innovative Instagram Story creator all in one place.'
  }
]

export async function GET() {
  try {
    const [aboutPage, faqPage] = await Promise.all([
      prisma.page.findUnique({ where: { slug: 'homepage-about' } }),
      prisma.page.findUnique({ where: { slug: 'homepage-faq' } }),
    ])

    let faqs = DEFAULT_FAQS
    if (faqPage?.content) {
      try {
        faqs = JSON.parse(faqPage.content)
      } catch {
        faqs = DEFAULT_FAQS
      }
    }

    return NextResponse.json({
      about: aboutPage?.content || DEFAULT_ABOUT,
      faqs,
    })
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { message: 'Error fetching homepage content' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const { about, faqs } = await request.json()

    const [aboutPage, faqPage] = await Promise.all([
      prisma.page.upsert({
        where: { slug: 'homepage-about' },
        update: { content: about, updatedAt: new Date() },
        create: {
          slug: 'homepage-about',
          title: 'Homepage About',
          content: about,
          isPublished: true,
        },
      }),
      prisma.page.upsert({
        where: { slug: 'homepage-faq' },
        update: { content: JSON.stringify(faqs), updatedAt: new Date() },
        create: {
          slug: 'homepage-faq',
          title: 'Homepage FAQ',
          content: JSON.stringify(faqs),
          isPublished: true,
        },
      }),
    ])

    return NextResponse.json({ about: aboutPage.content, faqs: JSON.parse(faqPage.content) })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    return NextResponse.json(
      { message: 'Error updating homepage content' },
      { status: 500 }
    )
  }
}
