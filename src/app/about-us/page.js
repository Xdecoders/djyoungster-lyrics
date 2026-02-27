import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

const SLUG = 'about-us'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

export const revalidate = 60

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: SLUG, isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || 'Learn more about DJYoungster',
        alternates: { canonical: `${siteUrl}/${SLUG}` },
        openGraph: {
          title: page.metaTitle || page.title,
          description: page.metaDescription || 'Learn more about DJYoungster',
          url: `${siteUrl}/${SLUG}`,
          locale: 'en_IN',
          alternateLocale: ['hi_IN', 'pa_IN', 'ta_IN', 'te_IN'],
        },
        twitter: {
          card: 'summary',
          title: page.metaTitle || page.title,
          description: page.metaDescription || 'Learn more about DJYoungster',
          creator: '@djyoungstercom',
          site: '@djyoungstercom',
        },
        robots: { index: true, follow: true },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'About Us | DJYoungster',
    description: 'Learn more about DJYoungster',
    alternates: { canonical: `${siteUrl}/${SLUG}` },
  }
}

async function getPageData() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: SLUG, isPublished: true }
    })
    return page
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export default async function AboutUsPage() {
  const page = await getPageData()
  return <StaticPageContent slug={SLUG} page={page ? JSON.parse(JSON.stringify(page)) : null} />
}
