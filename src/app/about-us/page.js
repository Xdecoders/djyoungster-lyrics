import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'about-us', isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || `Learn more about us`
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'About Us',
    description: 'Learn more about us'
  }
}

export default function AboutUsPage() {
  return <StaticPageContent slug="about-us" />
}
