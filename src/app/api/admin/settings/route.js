import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Get admin profile
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [adminId] = decoded.split(':')

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PUT - Update admin settings (password, name, email)
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [adminId] = decoded.split(':')

    const body = await request.json()
    const { currentPassword, newPassword, name, email } = body

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    // If changing password
    if (currentPassword && newPassword) {
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, admin.password)
      if (!isValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      await prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword }
      })

      return NextResponse.json({ message: 'Password updated successfully' })
    }

    // If updating profile (name/email)
    const updateData = {}
    if (name) updateData.name = name
    if (email) {
      // Check if email already exists
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          email,
          NOT: { id: adminId }
        }
      })
      if (existingAdmin) {
        return NextResponse.json({ message: 'Email already in use' }, { status: 400 })
      }
      updateData.email = email
    }

    if (Object.keys(updateData).length > 0) {
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      return NextResponse.json({ message: 'Profile updated successfully', admin: updatedAdmin })
    }

    return NextResponse.json({ message: 'No changes made' })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 })
  }
}
