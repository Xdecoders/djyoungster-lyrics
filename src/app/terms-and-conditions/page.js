import { prisma } from '@/lib/prisma'
import StaticPageContent from '@/components/StaticPageContent'

export async function generateMetadata() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'terms-and-conditions', isPublished: true }
    })

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || 'Terms and conditions for using our website'
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Terms and Conditions',
    description: 'Terms and conditions for using our website'
  }
}

export default function TermsAndConditionsPage() {
  return <StaticPageContent slug="terms-and-conditions" />
}
