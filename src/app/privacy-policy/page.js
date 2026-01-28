import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'privacy-policy', isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || 'Our privacy policy'
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Privacy Policy',
    description: 'Our privacy policy'
  }
}

export default function PrivacyPolicyPage() {
  return <StaticPageContent slug="privacy-policy" />
}
