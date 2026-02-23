import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

const SLUG = 'privacy-policy'
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
        description: page.metaDescription || 'Privacy Policy for DJYoungster',
        alternates: { canonical: `${siteUrl}/${SLUG}` },
        openGraph: {
          title: page.metaTitle || page.title,
          description: page.metaDescription || 'Privacy Policy for DJYoungster',
          url: `${siteUrl}/${SLUG}`,
          locale: 'en_US',
        },
        twitter: {
          card: 'summary',
          title: page.metaTitle || page.title,
          description: page.metaDescription || 'Privacy Policy for DJYoungster',
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
    title: 'Privacy Policy | DJYoungster',
    description: 'Privacy Policy for DJYoungster',
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

export default async function PrivacyPolicyPage() {
  const page = await getPageData()
  return <StaticPageContent slug={SLUG} page={page ? JSON.parse(JSON.stringify(page)) : null} />
}
