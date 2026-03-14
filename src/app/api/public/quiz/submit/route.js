import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { quizId, sessionId, displayName, score, timeTaken } = body

    if (!quizId || !sessionId || score === undefined || timeTaken === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check not already submitted
    const existing = await prisma.dailyQuizSubmission.findFirst({
      where: { quizId, sessionId },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already submitted', submission: existing }, { status: 409 })
    }

    // Sanitize display name
    let cleanName = null
    if (displayName && displayName.trim()) {
      cleanName = displayName
        .trim()
        .replace(/[<>&"']/g, '')  // strip HTML chars
        .replace(/https?:\/\/\S+/gi, '') // strip links
        .slice(0, 20)
      if (!cleanName) cleanName = null
    }

    // Calculate streak: count consecutive days this sessionId has submitted
    const quiz = await prisma.dailyQuiz.findUnique({ where: { id: quizId } })
    let streak = 1
    if (quiz) {
      const yesterday = new Date(quiz.date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const yesterdayQuiz = await prisma.dailyQuiz.findUnique({
        where: { language_date: { language: quiz.language, date: yesterdayStr } },
      })
      if (yesterdayQuiz) {
        const prevSubmission = await prisma.dailyQuizSubmission.findFirst({
          where: { quizId: yesterdayQuiz.id, sessionId },
        })
        if (prevSubmission) {
          streak = (prevSubmission.streak || 1) + 1
        }
      }
    }

    // Save submission
    const submission = await prisma.dailyQuizSubmission.create({
      data: {
        quizId,
        sessionId,
        displayName: cleanName,
        score: Math.min(5, Math.max(0, score)),
        timeTaken: Math.max(0, timeTaken),
        streak,
      },
    })

    // Get rank
    const rank = await prisma.dailyQuizSubmission.count({
      where: {
        quizId,
        OR: [
          { score: { gt: submission.score } },
          { score: submission.score, timeTaken: { lt: submission.timeTaken } },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      rank: rank + 1,
      streak: submission.streak,
    })
  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
