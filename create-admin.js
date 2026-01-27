const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Initialize Prisma with the new configuration for version 7+
const prisma = new PrismaClient({
  adapter: {
    provider: 'mysql',
    url: process.env.DATABASE_URL || 'mysql://root:root123@localhost:3306/lyrics_db'
  }
})

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@lyrics.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    })
    
    console.log('✅ Admin created successfully!')
    console.log('Email: admin@lyrics.com')
    console.log('Password: admin123')
    console.log('\nYou can now login to the admin panel')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin already exists!')
    } else {
      console.error('Error:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()