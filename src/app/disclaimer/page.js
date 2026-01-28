import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'disclaimer', isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || 'Disclaimer for our website'
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Disclaimer',
    description: 'Disclaimer for our website'
  }
}

export default function DisclaimerPage() {
  return <StaticPageContent slug="disclaimer" />
}
