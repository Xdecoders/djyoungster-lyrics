import { verifyToken } from './auth'
import { prisma } from './prisma'
import { NextResponse } from 'next/server'

export async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const token = authHeader.split(' ')[1]
  const payload = await verifyToken(token)

  if (!payload || !payload.adminId) {
    return { error: NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 }) }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    select: { id: true, email: true, name: true, role: true }
  })

  if (!admin) {
    return { error: NextResponse.json({ message: 'Admin not found' }, { status: 401 }) }
  }

  return { admin }
}
