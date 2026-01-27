import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletter } from '@/lib/email'

// Get all newsletters with stats
export async function GET() {
  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Get subscriber stats
    const [activeSubscribers, totalSent, totalNewsletters] = await Promise.all([
      prisma.newsletterSubscriber.count({ where: { status: 'active' } }),
      prisma.newsletter.aggregate({
        _sum: { sentTo: true }
      }),
      prisma.newsletter.count({ where: { status: 'sent' } })
    ])

    return NextResponse.json({
      newsletters,
      stats: {
        activeSubscribers,
        totalEmailsSent: totalSent._sum.sentTo || 0,
        totalNewsletters
      }
    })
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json(
      { message: 'Error fetching newsletters' },
      { status: 500 }
    )
  }
}

// Create new newsletter (draft or send)
export async function POST(request) {
  try {
    const data = await request.json()
    const { subject, content, sendNow } = data

    if (!subject || !content) {
      return NextResponse.json(
        { message: 'Subject and content are required' },
        { status: 400 }
      )
    }

    if (sendNow) {
      // Get active subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'active' },
        select: { email: true }
      })

      if (subscribers.length === 0) {
        return NextResponse.json(
          { message: 'No active subscribers to send to' },
          { status: 400 }
        )
      }

      // Send emails to all subscribers
      console.log(`Sending newsletter to ${subscribers.length} subscribers...`)
      const results = await sendNewsletter({
        subscribers,
        subject,
        html: content
      })
      console.log(`Newsletter sent: ${results.sent} successful, ${results.failed} failed`)

      // Create newsletter record with sent status
      const newsletter = await prisma.newsletter.create({
        data: {
          subject,
          content,
          status: 'sent',
          sentAt: new Date(),
          sentTo: results.sent
        }
      })

      return NextResponse.json({
        ...newsletter,
        emailResults: results
      }, { status: 201 })
    }

    // Create as draft
    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content,
        status: 'draft',
        sentAt: null,
        sentTo: 0
      }
    })

    return NextResponse.json(newsletter, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter:', error)
    return NextResponse.json(
      { message: 'Error creating newsletter: ' + error.message },
      { status: 500 }
    )
  }
}
