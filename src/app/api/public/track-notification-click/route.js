import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ message: 'Missing notificationId' }, { status: 400 })
    }

    await prisma.pushNotification.update({
      where: { id: notificationId },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ tracked: true })
  } catch (error) {
    // Notification may have been deleted, that's fine
    return NextResponse.json({ tracked: false })
  }
}
