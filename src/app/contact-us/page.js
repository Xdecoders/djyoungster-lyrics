import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'contact-us', isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || 'Contact us'
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Contact Us',
    description: 'Contact us'
  }
}

export default function ContactUsPage() {
  return <StaticPageContent slug="contact-us" />
}
