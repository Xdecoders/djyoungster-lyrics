import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Strip HTML tags and get clean text lines from lyrics
function cleanLyrics(html) {
  if (!html) return []
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 15) // only meaningful lines
}

// Pick a random item from array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Shuffle array
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Common words to avoid blanking out
const STOPWORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should',
  'may','might','must','shall','can','need','dare','ought','used',
  'i','me','my','myself','we','our','ours','ourselves','you','your',
  'yours','he','him','his','she','her','hers','it','its','they','them',
  'their','theirs','what','which','who','whom','this','that','these',
  'those','am','at','by','for','in','of','on','or','to','up','as',
  'and','but','if','or','so','yet','nor','not','no','yes','hai',
  'hain','mein','ka','ki','ke','ko','se','par','aur','na','nahi',
  'ho','hoga','tha','thi','the','kya','yeh','woh','main','tum','aap',
])

// Generate "complete the lyric" question
function makeCompleteLyricQ(song, allSongs, artistNames) {
  const lines = cleanLyrics(song.lyrics)
  if (lines.length < 2) return null

  // Try up to 10 lines to find one with a blankable word
  for (let attempt = 0; attempt < 10; attempt++) {
    const line = pick(lines)
    const words = line.split(/\s+/)
    const candidates = words.filter(w => {
      const clean = w.replace(/[^a-zA-Z\u0900-\u097F\u0A00-\u0A7F]/g, '').toLowerCase()
      return clean.length >= 4 && !STOPWORDS.has(clean)
    })
    if (candidates.length === 0) continue

    const blankWord = pick(candidates)
    const snippet = line.replace(blankWord, '_____')

    // Distractors: words from other songs' lyrics
    const distractorPool = []
    for (const other of allSongs) {
      if (other.id === song.id) continue
      const otherLines = cleanLyrics(other.lyrics)
      for (const ol of otherLines.slice(0, 20)) {
        for (const w of ol.split(/\s+/)) {
          const clean = w.replace(/[^a-zA-Z\u0900-\u097F\u0A00-\u0A7F]/g, '')
          if (clean.length >= 4 && !STOPWORDS.has(clean.toLowerCase()) && clean !== blankWord) {
            distractorPool.push(clean)
          }
        }
      }
      if (distractorPool.length > 20) break
    }

    if (distractorPool.length < 3) continue

    const wrongOptions = shuffle([...new Set(distractorPool)]).slice(0, 3)
    const allOptions = shuffle([blankWord, ...wrongOptions])
    const correctIndex = allOptions.indexOf(blankWord)

    return {
      type: 'complete_lyric',
      lyricSnippet: snippet,
      question: `Complete this lyric: "${snippet}"`,
      options: allOptions,
      correctIndex,
      explanation: `The complete line is: "${line}" — from "${song.title}" by ${artistNames}`,
      songId: song.id,
      songSlug: song.slug,
      songTitle: song.title,
    }
  }
  return null
}

// Generate "which song is this from" question
function makeWhichSongQ(song, allSongs, artistNames) {
  const lines = cleanLyrics(song.lyrics)
  if (lines.length < 2) return null

  const startIdx = Math.floor(Math.random() * Math.max(1, lines.length - 3))
  const snippet = lines.slice(startIdx, startIdx + 2).join('\n')

  const wrongTitles = shuffle(
    allSongs.filter(s => s.id !== song.id && s.title).map(s => s.title)
  ).slice(0, 3)

  if (wrongTitles.length < 3) return null

  const allOptions = shuffle([song.title, ...wrongTitles])
  const correctIndex = allOptions.indexOf(song.title)

  return {
    type: 'which_song',
    lyricSnippet: snippet,
    question: 'Which song are these lyrics from?',
    options: allOptions,
    correctIndex,
    explanation: `These lyrics are from "${song.title}" by ${artistNames}`,
    songId: song.id,
    songSlug: song.slug,
    songTitle: song.title,
  }
}

// Generate "which artist sang this" question
function makeWhichArtistQ(song, allSongs, artistNames) {
  const lines = cleanLyrics(song.lyrics)
  if (lines.length < 2) return null

  const startIdx = Math.floor(Math.random() * Math.max(1, lines.length - 3))
  const snippet = lines.slice(startIdx, startIdx + 2).join('\n')

  // Collect artist names from other songs
  const wrongArtists = []
  for (const other of allSongs) {
    if (other.id === song.id) continue
    const name = other.artists?.[0]?.artist?.name
    if (name && name !== artistNames && !wrongArtists.includes(name)) {
      wrongArtists.push(name)
    }
    if (wrongArtists.length >= 3) break
  }

  if (wrongArtists.length < 3) return null

  const allOptions = shuffle([artistNames, ...wrongArtists.slice(0, 3)])
  const correctIndex = allOptions.indexOf(artistNames)

  return {
    type: 'which_artist',
    lyricSnippet: snippet,
    question: 'Which artist sang these lyrics?',
    options: allOptions,
    correctIndex,
    explanation: `"${song.title}" was sung by ${artistNames}`,
    songId: song.id,
    songSlug: song.slug,
    songTitle: song.title,
  }
}

async function generateQuiz(language, date) {
  const categorySlug = language

  // Collect song IDs used in the last 7 days to avoid repeats
  const recentDates = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(date)
    d.setDate(d.getDate() - i)
    recentDates.push(d.toISOString().split('T')[0])
  }
  const recentQuizzes = await prisma.dailyQuiz.findMany({
    where: { language, date: { in: recentDates } },
    select: { songIds: true },
  })
  const recentlyUsedIds = new Set(
    recentQuizzes.flatMap(q => {
      try { return JSON.parse(q.songIds) } catch { return [] }
    })
  )

  const allSongs = await prisma.song.findMany({
    where: {
      status: 'published',
      lyrics: { not: '' },
      categories: { some: { category: { slug: categorySlug } } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      lyrics: true,
      coverImage: true,
      artists: {
        select: { artist: { select: { id: true, name: true, slug: true } } }
      },
    },
    orderBy: { views: 'desc' },
    take: 100,
  })

  if (allSongs.length < 5) return null

  // Prefer songs not used recently; fall back to all if fresh pool is too small
  const freshSongs = allSongs.filter(s => !recentlyUsedIds.has(s.id))
  const songs = freshSongs.length >= 5 ? freshSongs : allSongs

  const pool = shuffle(songs).slice(0, 10)
  const questionTypes = shuffle(['complete_lyric', 'which_song', 'which_artist', 'complete_lyric', 'which_song'])

  const rawQuestions = []
  const usedSongIds = new Set()

  for (let i = 0; i < 5; i++) {
    // Pick a song not yet used
    const availableSongs = pool.filter(s => !usedSongIds.has(s.id))
    if (availableSongs.length === 0) break

    const song = availableSongs[0]
    usedSongIds.add(song.id)
    const artistNames = song.artists?.map(sa => sa.artist.name).join(', ') || 'Unknown'

    let q = null
    const type = questionTypes[i]

    if (type === 'complete_lyric') {
      q = makeCompleteLyricQ(song, pool, artistNames)
      if (!q) q = makeWhichSongQ(song, pool, artistNames)
    } else if (type === 'which_song') {
      q = makeWhichSongQ(song, pool, artistNames)
      if (!q) q = makeWhichArtistQ(song, pool, artistNames)
    } else {
      q = makeWhichArtistQ(song, pool, artistNames)
      if (!q) q = makeWhichSongQ(song, pool, artistNames)
    }

    if (q) rawQuestions.push({ ...q, order: i })
  }

  if (rawQuestions.length < 3) return null

  // Save quiz to DB
  const quiz = await prisma.dailyQuiz.create({
    data: {
      language,
      date,
      songIds: JSON.stringify([...usedSongIds]),
      questions: {
        create: rawQuestions.map(q => ({
          order: q.order,
          type: q.type,
          lyricSnippet: q.lyricSnippet,
          question: q.question,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation || null,
          songId: q.songId || null,
          songSlug: q.songSlug || null,
          songTitle: q.songTitle || null,
        })),
      },
    },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  return quiz
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') || 'hindi').toLowerCase()

    const today = new Date().toISOString().split('T')[0]

    // Check if quiz exists for today
    let quiz = await prisma.dailyQuiz.findUnique({
      where: { language_date: { language, date: today } },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    if (!quiz) {
      quiz = await generateQuiz(language, today)
    }

    if (!quiz) {
      return NextResponse.json({ error: `Not enough songs to generate quiz for "${language}". Need at least 5 published songs with lyrics in this language category.` }, { status: 404 })
    }

    // Format questions (parse JSON fields)
    const questions = quiz.questions.map(q => ({
      id: q.id,
      order: q.order,
      type: q.type,
      lyricSnippet: q.lyricSnippet,
      question: q.question,
      options: JSON.parse(q.options),
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      songId: q.songId,
      songSlug: q.songSlug,
      songTitle: q.songTitle,
    }))

    // Get play count
    const playCount = await prisma.dailyQuizSubmission.count({
      where: { quizId: quiz.id },
    })

    return NextResponse.json({
      quizId: quiz.id,
      language: quiz.language,
      date: quiz.date,
      playCount,
      questions,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    })
  } catch (error) {
    console.error('Quiz GET error:', error)
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 })
  }
}
