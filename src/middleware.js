import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null

// In-memory redirect cache (persists across warm instances)
let redirectCache = null
let cacheExpiry = 0
const CACHE_TTL = 60 * 1000 // 1 minute

async function getRedirects(requestOrigin) {
  const now = Date.now()
  if (redirectCache !== null && now < cacheExpiry) {
    return redirectCache
  }

  // Prefer the configured SITE_URL (avoids SSL/proxy overhead on VPS).
  // Fall back to the origin derived from the incoming request.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    requestOrigin

  try {
    const res = await fetch(`${base}/api/redirects`, { cache: 'no-store' })
    if (res.ok) {
      redirectCache = await res.json()
      cacheExpiry = now + CACHE_TTL
    }
  } catch {
    // Fetch failed — keep stale cache if available, otherwise return []
  }

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
    // Exact match first
    let match = redirects.find(
      r => r.oldUrl === pathname || r.oldUrl === pathname + '/'
    )

    // Wildcard match (e.g. /blog/* matches /blog/anything)
    if (!match) {
      match = redirects.find(r => {
        if (!r.oldUrl.endsWith('/*')) return false
        const prefix = r.oldUrl.slice(0, -2) // strip /*
        return pathname === prefix || pathname.startsWith(prefix + '/')
      })
    }
    if (match) {
      const target = match.newUrl.startsWith('http')
        ? match.newUrl
        : new URL(match.newUrl, origin).toString()
      return NextResponse.redirect(target, match.type)
    }
  }

  // 3. Protect admin API routes (except login)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    if (!secret) {
      return NextResponse.json({ message: 'Server misconfiguration: JWT_SECRET is not set' }, { status: 500 })
    }

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
