import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')

// In-memory redirect cache (persists across warm edge instances)
let redirectCache = null
let cacheExpiry = 0
const CACHE_TTL = 60 * 1000 // 1 minute

async function getRedirects(origin) {
  const now = Date.now()
  if (redirectCache !== null && now < cacheExpiry) {
    return redirectCache
  }
  try {
    const res = await fetch(`${origin}/api/redirects`)
    if (res.ok) {
      redirectCache = await res.json()
      cacheExpiry = now + CACHE_TTL
    }
  } catch {}
  return redirectCache || []
}

export async function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // 1. www → non-www
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '')
    url.host = newHost
    url.protocol = 'https'
    return NextResponse.redirect(url, 301)
  }

  // 2. Custom URL redirects (skip API and admin paths)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/admin')) {
    const origin = `${url.protocol}//${url.host}`
    const redirects = await getRedirects(origin)
    const match = redirects.find(
      r => r.oldUrl === pathname || r.oldUrl === pathname + '/'
    )
    if (match) {
      const target = match.newUrl.startsWith('http')
        ? match.newUrl
        : new URL(match.newUrl, origin).toString()
      return NextResponse.redirect(target, match.type)
    }
  }

  // 3. Protect admin API routes (except login)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
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
