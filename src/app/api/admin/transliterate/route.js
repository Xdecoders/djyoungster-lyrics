import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')
  const lang = searchParams.get('lang') || 'pa'
  const num = searchParams.get('num') || '5'

  if (!text) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const itc = `${lang}-t-i0-und`
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=${num}`
    const res = await fetch(url)
    const data = await res.json()

    // Google returns [status, [[word, suggestions, ...]]]
    if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) {
      return NextResponse.json({ suggestions: data[1][0][1] })
    }

    return NextResponse.json({ suggestions: [] })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
