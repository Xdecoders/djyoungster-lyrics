const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating songs with transliteration and translation...')

  // Update all songs with demo transliteration/translation
  const songs = await prisma.song.findMany()

  for (const song of songs) {
    await prisma.song.update({
      where: { id: song.id },
      data: {
        lyricsRomanized: generateRomanized(song.lyrics, song.title),
        lyricsTranslated: generateTranslation(song.lyrics, song.title)
      }
    })
    console.log(`✅ Updated: ${song.title}`)
  }

  console.log('🎉 All songs updated!')
}

function generateRomanized(lyrics, title) {
  // For demo purposes, we'll create a romanized version
  // In production, this would be actual transliteration
  const lines = lyrics.split('\n').slice(0, 20)
  return `[Romanized Lyrics - ${title}]

${lines.join('\n')}

...

(Transliteration: Original script converted to Roman/English letters
for easier reading and singing along)`
}

function generateTranslation(lyrics, title) {
  // For demo purposes, we'll create a placeholder translation
  // In production, this would be actual translation
  return `[English Translation - ${title}]

(Verse 1)
The meaning of love flows through these words
Every line carries deep emotions
The heart speaks what words cannot say
This song tells a beautiful story

(Chorus)
Love knows no boundaries
It transcends all languages
Feel the emotion in every beat
Let the music touch your soul

(Verse 2)
Through melodies and rhythms divine
The artist shares their deepest feelings
Every note is carefully crafted
To make you feel alive

(Bridge)
Sometimes words are not enough
Music becomes the universal language
Close your eyes and feel the vibe
Let this song take you on a journey

(Note: This is a demo translation.
Actual translations would provide
line-by-line meaning of the original lyrics.)`
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
