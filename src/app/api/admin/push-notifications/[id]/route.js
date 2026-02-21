import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import webpush from '@/lib/webPush'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { title, body, url, icon, action } = await request.json()

    const existing = await prisma.pushNotification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 })
    }

    // Send action
    if (action === 'send') {
      const result = await sendToAllSubscribers(existing)
      const updated = await prisma.pushNotification.update({
        where: { id },
        data: {
          sentTo: result.sent,
          failedTo: result.failed,
          sentAt: new Date(),
          status: 'sent',
        },
      })
      return NextResponse.json({ notification: updated, sent: result.sent, failed: result.failed })
    }

    // Update draft
    if (existing.status === 'sent') {
      return NextResponse.json({ message: 'Cannot edit sent notification' }, { status: 400 })
    }

    const updated = await prisma.pushNotification.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(body && { body }),
        url: url !== undefined ? url : existing.url,
        icon: icon !== undefined ? icon : existing.icon,
      },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Push notification PUT error:', error)
    return NextResponse.json({ message: 'Error updating notification' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await prisma.pushNotification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push notification DELETE error:', error)
    return NextResponse.json({ message: 'Error deleting notification' }, { status: 500 })
  }
}

async function sendToAllSubscribers(notification) {
  const subscribers = await prisma.pushSubscription.findMany({
    where: { status: 'active' },
  })

  let sent = 0
  let failed = 0

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    url: notification.url || '/',
    icon: notification.icon || '/icons/icon-192x192.png',
    notificationId: notification.id,
  })

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.authKey, p256dh: sub.p256dh },
          },
          payload
        )
        sent++
      } catch (err) {
        failed++
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { status: 'unsubscribed' },
          })
        }
      }
    })
  )

  return { sent, failed }
}
