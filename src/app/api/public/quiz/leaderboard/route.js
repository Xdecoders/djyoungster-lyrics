import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') || 'hindi').toLowerCase()
    const sessionId = searchParams.get('sessionId') || ''

    const today = new Date().toISOString().split('T')[0]

    const quiz = await prisma.dailyQuiz.findUnique({
      where: { language_date: { language, date: today } },
    })

    if (!quiz) {
      return NextResponse.json({ leaderboard: [], totalPlayers: 0, userEntry: null })
    }

    const allSubmissions = await prisma.dailyQuizSubmission.findMany({
      where: { quizId: quiz.id },
      orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }],
    })

    const totalPlayers = allSubmissions.length

    // Top 10 with names only (anonymous entries still count for rank)
    const leaderboard = allSubmissions.slice(0, 10).map((s, idx) => ({
      rank: idx + 1,
      name: s.displayName || 'Anonymous',
      score: s.score,
      timeTaken: s.timeTaken,
      streak: s.streak,
      isAnonymous: !s.displayName,
      sessionId: s.sessionId === sessionId ? s.sessionId : null, // only reveal if it's current user
    }))

    // Current user's entry (may be outside top 10)
    let userEntry = null
    if (sessionId) {
      const userSubmission = allSubmissions.find(s => s.sessionId === sessionId)
      if (userSubmission) {
        const rank = allSubmissions.indexOf(userSubmission) + 1
        userEntry = {
          rank,
          name: userSubmission.displayName || 'You',
          score: userSubmission.score,
          timeTaken: userSubmission.timeTaken,
          streak: userSubmission.streak,
        }
      }
    }

    return NextResponse.json({
      quizId: quiz.id,
      leaderboard,
      totalPlayers,
      userEntry,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}
