import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { headers } from 'next/headers'
const bcrypt = require('bcryptjs')

export async function POST(request) {
  try {
    // Rate limit: 5 attempts per minute per IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || '127.0.0.1'
    const { success } = rateLimit(`login:${ip}`, 5, 60 * 1000)
    if (!success) return rateLimitResponse()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signToken(admin.id)

    return NextResponse.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)
    return NextResponse.json(
      { message: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}