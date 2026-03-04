import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletter } from '@/lib/email'

// Get single newsletter
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const newsletter = await prisma.newsletter.findUnique({
      where: { id }
    })

    if (!newsletter) {
      return NextResponse.json(
        { message: 'Newsletter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(newsletter)
  } catch (error) {
    console.error('Error fetching newsletter:', error)
    return NextResponse.json(
      { message: 'Error fetching newsletter' },
      { status: 500 }
    )
  }
}

// Update newsletter (edit draft or send)
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    const { subject, content, action } = data

    const existing = await prisma.newsletter.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { message: 'Newsletter not found' },
        { status: 404 }
      )
    }

    // If action is 'send', send the first batch (450) and mark as sending/sent
    if (action === 'send') {
      if (existing.status === 'sent') {
        return NextResponse.json(
          { message: 'Newsletter already sent' },
          { status: 400 }
        )
      }

      const BATCH_SIZE = 450
      const emailSubject = subject || existing.subject
      const emailContent = content || existing.content

      const totalActive = await prisma.newsletterSubscriber.count({ where: { status: 'active' } })

      if (totalActive === 0) {
        return NextResponse.json(
          { message: 'No active subscribers to send to' },
          { status: 400 }
        )
      }

      // Send first batch
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'active' },
        orderBy: { subscribedAt: 'asc' },
        skip: existing.sentTo,
        take: BATCH_SIZE,
        select: { email: true, name: true }
      })

      console.log(`Sending batch to ${subscribers.length} of ${totalActive} subscribers...`)
      const results = await sendNewsletter({ subscribers, subject: emailSubject, html: emailContent })
      console.log(`Batch sent: ${results.sent} successful, ${results.failed} failed`)

      const newSentTo = existing.sentTo + results.sent
      const isComplete = newSentTo >= totalActive

      const newsletter = await prisma.newsletter.update({
        where: { id },
        data: {
          subject: emailSubject,
          content: emailContent,
          status: isComplete ? 'sent' : 'sending',
          sentAt: new Date(),
          sentTo: newSentTo
        }
      })

      return NextResponse.json({
        ...newsletter,
        emailResults: results,
        totalSubscribers: totalActive,
        isComplete
      })
    }

    // Otherwise just update the draft
    const newsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        subject: subject !== undefined ? subject : existing.subject,
        content: content !== undefined ? content : existing.content
      }
    })

    return NextResponse.json(newsletter)
  } catch (error) {
    console.error('Error updating newsletter:', error)
    return NextResponse.json(
      { message: 'Error updating newsletter' },
      { status: 500 }
    )
  }
}

// Delete newsletter
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.newsletter.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Newsletter deleted successfully' })
  } catch (error) {
    console.error('Error deleting newsletter:', error)
    return NextResponse.json(
      { message: 'Error deleting newsletter' },
      { status: 500 }
    )
  }
}
