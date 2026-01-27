const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const songMeanings = {
  'brown-munde': `"Brown Munde" is a powerful anthem celebrating Punjabi pride and identity. The song speaks about the journey of young Punjabi men (brown boys) who have achieved success through hard work and determination despite facing obstacles.

The lyrics emphasize themes of self-confidence, cultural pride, and the hustle mentality that defines the modern Punjabi youth. AP Dhillon and his collaborators use the track to represent a new generation that's proud of their roots while making waves globally.

The phrase "Brown Munde" itself has become a cultural statement, representing young South Asians who are breaking barriers and achieving success on their own terms in various fields including music, business, and entertainment.`,

  'excuses': `"Excuses" is a romantic track that explores the bittersweet nature of love and relationships. The song delves into the emotional complexity of making excuses to spend time with someone you love, even when circumstances don't allow it.

AP Dhillon's smooth vocals combined with the mellow beats create an atmosphere of longing and desire. The song resonates with anyone who has ever been in a situation where they had to find reasons to be near someone special.

The track became a massive hit for its relatable lyrics and catchy melody, becoming an anthem for young lovers navigating the complexities of modern relationships.`,

  'lover-diljit': `This romantic ballad by Diljit Dosanjh explores the depth of true love and devotion. The song portrays a lover who is completely devoted to their partner, expressing unconditional love and commitment.

The lyrics beautifully capture the essence of being so in love that your entire world revolves around one person. Diljit's soulful voice adds emotional depth to the already meaningful lyrics.

The song has become a favorite at weddings and romantic occasions, representing the purest form of love and dedication to one's partner.`,

  'satranga': `"Satranga" from the movie "Animal" is a deeply emotional love song that uses the metaphor of seven colors (satranga) to describe the various shades of love and emotions one experiences.

Arijit Singh's powerful vocals bring out the intensity of emotions - from the highs of being in love to the vulnerability of giving your heart to someone completely. The song explores how love colors our entire existence with different emotions.

The composition beautifully blends classical elements with modern music, creating a timeless piece that resonates with listeners who have experienced deep, transformative love.`,

  'chaleya': `"Chaleya" from "Jawan" is an energetic love song that captures the excitement and joy of falling in love. The song's upbeat tempo and catchy rhythm make it perfect for celebrating the euphoria of new love.

The lyrics describe the irresistible pull of attraction and how love makes one feel alive and adventurous. Arijit Singh and Shilpa Rao's duet brings a playful yet passionate energy to the track.

The song became hugely popular for its dance-worthy beats and romantic lyrics, becoming a favorite at parties and celebrations.`,

  'tere-vaaste': `"Tere Vaaste" is a heartfelt romantic song that expresses complete devotion and sacrifice for love. The title translates to "For You," capturing the essence of doing anything for the person you love.

The song beautifully portrays the depth of emotions when someone becomes the center of your universe. The lyrics speak of promises, dedication, and the willingness to go to any lengths for love.

With its melodious composition and touching lyrics, the song has become an anthem for couples expressing their commitment and love for each other.`
}

async function addDemoMeanings() {
  console.log('Adding demo meanings to songs...\n')

  for (const [slug, meaning] of Object.entries(songMeanings)) {
    try {
      const result = await prisma.song.update({
        where: { slug },
        data: { meaning }
      })
      console.log(`Updated: ${result.title}`)
    } catch (error) {
      console.log(`Song not found or error: ${slug}`)
    }
  }

  console.log('\nDone!')
}

addDemoMeanings()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
