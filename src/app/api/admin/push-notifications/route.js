import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import webpush from '@/lib/webPush'

export async function GET() {
  try {
    const [
      notifications,
      activeSubscribers,
      totalSubscribers,
      unsubscribed,
      totalPwaInstalls,
      installsByPlatform,
    ] = await Promise.all([
      prisma.pushNotification.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pushSubscription.count({ where: { status: 'active' } }),
      prisma.pushSubscription.count(),
      prisma.pushSubscription.count({ where: { status: 'unsubscribed' } }),
      prisma.pwaInstall.count(),
      prisma.pwaInstall.groupBy({
        by: ['platform'],
        _count: { id: true },
      }),
    ])

    // Calculate aggregate stats from sent notifications
    const sentNotifications = notifications.filter(n => n.status === 'sent')
    const totalDelivered = sentNotifications.reduce((sum, n) => sum + n.sentTo, 0)
    const totalFailed = sentNotifications.reduce((sum, n) => sum + n.failedTo, 0)
    const totalClicks = sentNotifications.reduce((sum, n) => sum + n.clicks, 0)

    // Format platform breakdown
    const platformBreakdown = {}
    installsByPlatform.forEach(p => {
      platformBreakdown[p.platform || 'unknown'] = p._count.id
    })

    return NextResponse.json({
      notifications,
      activeSubscribers,
      analytics: {
        totalSubscribers,
        activeSubscribers,
        unsubscribed,
        totalPwaInstalls,
        platformBreakdown,
        totalSent: sentNotifications.length,
        totalDelivered,
        totalFailed,
        totalClicks,
        clickRate: totalDelivered > 0 ? ((totalClicks / totalDelivered) * 100).toFixed(1) : '0.0',
      },
    })
  } catch (error) {
    console.error('Push notifications GET error:', error)
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { title, body, url, icon, sendNow } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ message: 'Title and body are required' }, { status: 400 })
    }

    const notification = await prisma.pushNotification.create({
      data: {
        title,
        body,
        url: url || null,
        icon: icon || null,
        status: sendNow ? 'sent' : 'draft',
      },
    })

    if (sendNow) {
      const result = await sendToAllSubscribers(notification)
      await prisma.pushNotification.update({
        where: { id: notification.id },
        data: {
          sentTo: result.sent,
          failedTo: result.failed,
          sentAt: new Date(),
          status: 'sent',
        },
      })
      return NextResponse.json({ notification, sent: result.sent, failed: result.failed })
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Push notifications POST error:', error)
    return NextResponse.json({ message: 'Error creating notification' }, { status: 500 })
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
