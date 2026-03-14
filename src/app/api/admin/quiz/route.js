import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function authCheck(request) {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  return auth.replace('Bearer ', '').length > 0
}

// GET /api/admin/quiz?date=2026-03-14
export async function GET(request) {
  if (!authCheck(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const quizzes = await prisma.dailyQuiz.findMany({
      where: { date },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { submissions: true } },
      },
      orderBy: { language: 'asc' },
    })

    // Count songs per language
    const LANGUAGES = ['hindi', 'punjabi', 'english', 'tamil', 'telugu']
    const songCounts = await Promise.all(
      LANGUAGES.map(async (lang) => {
        const slug = lang === 'telugu' ? 'telgu' : lang
        const count = await prisma.song.count({
          where: {
            status: 'published',
            lyrics: { not: '' },
            categories: { some: { category: { slug } } },
          },
        })
        return { language: lang, songCount: count }
      })
    )

    return NextResponse.json({ date, quizzes, songCounts })
  } catch (error) {
    console.error('Admin quiz GET error:', error)
    return NextResponse.json({ error: 'Failed to load quizzes' }, { status: 500 })
  }
}

// DELETE /api/admin/quiz?id=xxx  — deletes a quiz so it can be regenerated
export async function DELETE(request) {
  if (!authCheck(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.dailyQuiz.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin quiz DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
  }
}
