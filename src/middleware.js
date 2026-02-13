import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')

export async function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Redirect www to non-www for URL canonicalization
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '')
    url.host = newHost
    url.protocol = 'https'
    return NextResponse.redirect(url, 301)
  }

  // Protect admin API routes (except login)
  if (url.pathname.startsWith('/api/admin') && !url.pathname.startsWith('/api/admin/login')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    try {
      await jwtVerify(token, secret)
    } catch {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
