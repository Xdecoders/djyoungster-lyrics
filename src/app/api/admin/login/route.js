import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
const bcrypt = require('bcryptjs')

export async function POST(request) {
  console.log('=== Login attempt started ===')

  try {
    
    const body = await request.json()
    console.log('Request body:', { email: body.email, hasPassword: !!body.password })
    
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // Find admin
    console.log('Searching for admin with email:', email)
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    console.log('Admin found:', admin ? 'Yes' : 'No')

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Verifying password...')
    const isValid = await bcrypt.compare(password, admin.password)
    console.log('Password valid:', isValid)

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create token
    const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')
    console.log('Login successful!')

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
    console.error('=== Login error ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Full error:', error)
    
    return NextResponse.json(
      { message: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}