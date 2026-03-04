import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletter } from '@/lib/email'

const BATCH_SIZE = 300

export async function POST(request, { params }) {
  try {
    const { id } = await params

    const newsletter = await prisma.newsletter.findUnique({ where: { id } })
    if (!newsletter) {
      return NextResponse.json({ message: 'Newsletter not found' }, { status: 404 })
    }
    if (newsletter.status === 'sent') {
      return NextResponse.json({ message: 'Newsletter already fully sent' }, { status: 400 })
    }

    const totalActive = await prisma.newsletterSubscriber.count({ where: { status: 'active' } })

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'active' },
      orderBy: { subscribedAt: 'asc' },
      skip: newsletter.sentTo,
      take: BATCH_SIZE,
      select: { email: true, name: true }
    })

    if (subscribers.length === 0) {
      await prisma.newsletter.update({ where: { id }, data: { status: 'sent' } })
      return NextResponse.json({ sent: 0, failed: 0, sentTo: newsletter.sentTo, totalSubscribers: totalActive, isComplete: true })
    }

    const results = await sendNewsletter({
      subscribers,
      subject: newsletter.subject,
      html: newsletter.content
    })

    const newSentTo = newsletter.sentTo + results.sent
    const isComplete = newSentTo >= totalActive

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        sentTo: newSentTo,
        status: isComplete ? 'sent' : 'sending',
        sentAt: newsletter.sentAt || new Date()
      }
    })

    return NextResponse.json({
      sent: results.sent,
      failed: results.failed,
      sentTo: newSentTo,
      totalSubscribers: totalActive,
      isComplete,
      newsletter: updated
    })
  } catch (error) {
    console.error('Error sending batch:', error)
    return NextResponse.json({ message: 'Error sending batch: ' + error.message }, { status: 500 })
  }
}
