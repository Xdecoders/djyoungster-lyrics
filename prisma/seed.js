const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Categories (Languages)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'hindi' },
      update: {},
      create: { name: 'Hindi', slug: 'hindi' }
    }),
    prisma.category.upsert({
      where: { slug: 'punjabi' },
      update: {},
      create: { name: 'Punjabi', slug: 'punjabi' }
    }),
    prisma.category.upsert({
      where: { slug: 'english' },
      update: {},
      create: { name: 'English', slug: 'english' }
    }),
  ])
  console.log('✅ Categories created')

  // Create Genres
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { slug: 'romantic' },
      update: {},
      create: { name: 'Romantic', slug: 'romantic', description: 'Love and romantic songs' }
    }),
    prisma.genre.upsert({
      where: { slug: 'sad' },
      update: {},
      create: { name: 'Sad', slug: 'sad', description: 'Emotional and sad songs' }
    }),
    prisma.genre.upsert({
      where: { slug: 'party' },
      update: {},
      create: { name: 'Party', slug: 'party', description: 'Party and dance songs' }
    }),
    prisma.genre.upsert({
      where: { slug: 'pop' },
      update: {},
      create: { name: 'Pop', slug: 'pop', description: 'Pop music' }
    }),
    prisma.genre.upsert({
      where: { slug: 'hip-hop' },
      update: {},
      create: { name: 'Hip Hop', slug: 'hip-hop', description: 'Hip hop and rap songs' }
    }),
  ])
  console.log('✅ Genres created')

  // Create Artists
  const artists = await Promise.all([
    prisma.artist.upsert({
      where: { slug: 'arijit-singh' },
      update: {},
      create: {
        name: 'Arijit Singh',
        slug: 'arijit-singh',
        bio: 'Arijit Singh is an Indian playback singer and music composer. He is the recipient of a National Award and six Filmfare Awards.',
        country: 'India',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3'
      }
    }),
    prisma.artist.upsert({
      where: { slug: 'ap-dhillon' },
      update: {},
      create: {
        name: 'AP Dhillon',
        slug: 'ap-dhillon',
        bio: 'Amritpal Singh Dhillon, known professionally as AP Dhillon, is an Indo-Canadian singer, songwriter, and record producer.',
        country: 'Canada',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5ba2d75eb08a2d672f9b69b7'
      }
    }),
    prisma.artist.upsert({
      where: { slug: 'diljit-dosanjh' },
      update: {},
      create: {
        name: 'Diljit Dosanjh',
        slug: 'diljit-dosanjh',
        bio: 'Diljit Dosanjh is an Indian singer, actor and television presenter who works in Punjabi and Hindi cinema.',
        country: 'India',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7a2c78fa60383bb32bb40b0c'
      }
    }),
    prisma.artist.upsert({
      where: { slug: 'pritam' },
      update: {},
      create: {
        name: 'Pritam',
        slug: 'pritam',
        bio: 'Pritam Chakraborty, known mononymously as Pritam, is an Indian music director and composer.',
        country: 'India',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb1b5863e9c00f9d9b7e8d4e4e'
      }
    }),
    prisma.artist.upsert({
      where: { slug: 'shreya-ghoshal' },
      update: {},
      create: {
        name: 'Shreya Ghoshal',
        slug: 'shreya-ghoshal',
        bio: 'Shreya Ghoshal is an Indian playback singer. She has received four National Film Awards and numerous Filmfare Awards.',
        country: 'India',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb0ad5e271352fe857bc4bffb5'
      }
    }),
  ])
  console.log('✅ Artists created')

  // Create Movies
  const movies = await Promise.all([
    prisma.movie.upsert({
      where: { id: 'movie-animal' },
      update: {},
      create: {
        id: 'movie-animal',
        title: 'Animal',
        year: 2023,
        director: 'Sandeep Reddy Vanga'
      }
    }),
    prisma.movie.upsert({
      where: { id: 'movie-jawan' },
      update: {},
      create: {
        id: 'movie-jawan',
        title: 'Jawan',
        year: 2023,
        director: 'Atlee'
      }
    }),
  ])
  console.log('✅ Movies created')

  // Create Songs with full details
  const songsData = [
    {
      title: 'Tere Vaaste',
      slug: 'tere-vaaste',
      lyrics: `Main tenu samjhawan ki
Na tere bina lagda jee
Main tenu samjhawan ki
Na tere bina lagda jee

Tere vaaste falak se main chand laaunga
Tere vaaste zameen par sitaare bichaunga
Tere vaaste main apni jaan bhi de dunga
Bas tu mera saath dena

Teri aankhon mein hai sapne mere
Teri baahon mein hai jahaan mera
Tu hi meri manzil hai
Tu hi mera mukaam hai

Tujhe dekh ke muskurana
Tujhe dekh ke jee jaana
Tere bina kuch bhi nahi
Tere bina kuch bhi nahi

Main tenu samjhawan ki
Na tere bina lagda jee
Main tenu samjhawan ki
Na tere bina lagda jee`,
      language: 'Hindi',
      releaseYear: 2023,
      duration: '4:12',
      lyricist: 'Varun Jain',
      composer: 'Sachin-Jigar',
      producer: 'Dinesh Vijan',
      label: 'T-Series',
      starring: 'Sara Ali Khan, Vicky Kaushal',
      youtubeUrl: 'https://www.youtube.com/watch?v=NkZRIhsdSPQ',
      views: 150000000,
      artistSlugs: ['arijit-singh'],
      genreSlugs: ['romantic', 'pop'],
      categorySlugs: ['hindi']
    },
    {
      title: 'Excuses',
      slug: 'excuses',
      lyrics: `Oh baby mere naal tu
Oh kardi excuses ae
Oh baby mere naal tu
Oh kardi excuses ae

Tu kithe chali jaandi ae
Main tenu puche bina
Tu mera dil todh jaandi ae
Bina kise gunah de

Excuses, excuses
Baby kardi ae excuses
Excuses, excuses
Tu kardi ae excuses

Kade mil ke baith jaiye
Kade gal kar laiye
Tu door kyun rehna ae
Tu nazdeek aa jaiye

Main tere layi kuch vi kar sakda
Tu mere layi kuch na karni
Main tere bina reh na sakda
Tu mere bina reh jaani`,
      language: 'Punjabi',
      releaseYear: 2021,
      duration: '3:45',
      lyricist: 'AP Dhillon',
      composer: 'AP Dhillon',
      producer: 'Gurinder Gill',
      label: 'Run-Up Records',
      starring: 'Intense',
      youtubeUrl: 'https://www.youtube.com/watch?v=rAVH7VNhsQE',
      views: 800000000,
      artistSlugs: ['ap-dhillon'],
      genreSlugs: ['hip-hop', 'party'],
      categorySlugs: ['punjabi']
    },
    {
      title: 'Lover',
      slug: 'lover-diljit',
      lyrics: `Tu meri lover ae
Main tera lover aan
Tu meri jaan ae
Main tera jaan aan

Sohniye ni sohniye
Tu meri life di
Tu hi mera pyaar ae
Tu hi meri wife ae

Lover, oh my lover
Tenu chahunda main
Lover, oh my lover
Tenu mangda main

Tere bina lagda na
Dil mera kahin vi
Tere bina rehna
Mushkil ae har ghari

Tu mera chand ae
Tu meri chandni
Tu meri zindagi
Tu meri bandagi`,
      language: 'Punjabi',
      releaseYear: 2023,
      duration: '3:30',
      lyricist: 'Diljit Dosanjh',
      composer: 'Diljit Dosanjh',
      producer: 'Intense',
      label: 'Famous Studios',
      starring: 'Diljit Dosanjh',
      youtubeUrl: 'https://www.youtube.com/watch?v=2PSAJMRXNuM',
      views: 450000000,
      artistSlugs: ['diljit-dosanjh'],
      genreSlugs: ['romantic', 'pop'],
      categorySlugs: ['punjabi']
    },
    {
      title: 'Satranga',
      slug: 'satranga',
      lyrics: `Satranga hai mera ishq
Satranga hai mera pyaar
Tere rang mein rang gaya
Main ho gaya bekaar

Neela asmaan sa
Teri aankhon ka rang
Laal gulaab sa
Tere hothon ka rang

Satranga hai mera ishq
Satranga hai mera pyaar
Tere rang mein rang gaya
Main ho gaya bekaar

Peela dhoop jaisa
Tera hasna mujhe
Hara mausam jaisa
Tera rehna mujhe

Safed chandni si
Teri chahat mujhe
Kaala badal sa
Tera gham bhi sahun main`,
      language: 'Hindi',
      releaseYear: 2023,
      duration: '5:02',
      lyricist: 'Manoj Muntashir',
      composer: 'Pritam',
      producer: 'T-Series',
      label: 'T-Series',
      starring: 'Ranbir Kapoor, Rashmika Mandanna',
      director: 'Sandeep Reddy Vanga',
      youtubeUrl: 'https://www.youtube.com/watch?v=uSJ40Va7L08',
      views: 300000000,
      movieId: 'movie-animal',
      artistSlugs: ['arijit-singh'],
      genreSlugs: ['romantic', 'sad'],
      categorySlugs: ['hindi']
    },
    {
      title: 'Chaleya',
      slug: 'chaleya',
      lyrics: `Chaleya chaleya
Tere ishq mein marjawan
Chaleya chaleya
Tere ishq mein marjawan

Main tujhpe fida
Tu mujhpe fida
Hum dono hain pagal
Deewane zara

Chaleya chaleya
Tere ishq mein marjawan
Chaleya chaleya
Tere ishq mein marjawan

Tu meri nigahon mein
Rehti hai tu
Main teri nigahon mein
Rehta hoon main

Is pyaar ko
Main kya naam doon
Tere bina jeena
Ab mumkin nahi`,
      language: 'Hindi',
      releaseYear: 2023,
      duration: '4:28',
      lyricist: 'Kumaar',
      composer: 'Anirudh Ravichander',
      producer: 'Red Chillies Entertainment',
      label: 'T-Series',
      starring: 'Shah Rukh Khan, Nayanthara',
      director: 'Atlee',
      youtubeUrl: 'https://www.youtube.com/watch?v=U_QoWznWPJs',
      views: 500000000,
      movieId: 'movie-jawan',
      artistSlugs: ['arijit-singh', 'shreya-ghoshal'],
      genreSlugs: ['romantic', 'party'],
      categorySlugs: ['hindi']
    },
    {
      title: 'Brown Munde',
      slug: 'brown-munde',
      lyrics: `Brown munde
AP Dhillon
Gurinder Gill

We them brown munde
Yeah we them brown munde
Born in the struggle
Hustle badla mundey

Brown munde
Ni assi brown munde
We taking over
Yeah we them brown munde

Paise kamaunde
Yeah assi paise kamaunde
Life hard si par
Assi haare na kade

Maa di dua naal
Chalda sab mera
Mehnat kiti bahut
Te aaya mera naseeb

Brown munde
We them brown munde
Taking over the game
Yeah we them brown munde`,
      language: 'Punjabi',
      releaseYear: 2020,
      duration: '3:22',
      lyricist: 'AP Dhillon',
      composer: 'AP Dhillon',
      producer: 'Gurinder Gill',
      label: 'Run-Up Records',
      starring: 'AP Dhillon',
      youtubeUrl: 'https://www.youtube.com/watch?v=TILtnYHzdPk',
      views: 1200000000,
      artistSlugs: ['ap-dhillon'],
      genreSlugs: ['hip-hop', 'party'],
      categorySlugs: ['punjabi']
    }
  ]

  for (const songData of songsData) {
    const { artistSlugs, genreSlugs, categorySlugs, movieId, ...songInfo } = songData

    // Check if song exists
    const existingSong = await prisma.song.findUnique({
      where: { slug: songInfo.slug }
    })

    if (existingSong) {
      console.log(`⏭️  Song "${songInfo.title}" already exists, skipping...`)
      continue
    }

    // Create song
    const song = await prisma.song.create({
      data: {
        ...songInfo,
        movieId: movieId || null
      }
    })

    // Connect artists
    for (const artistSlug of artistSlugs) {
      const artist = await prisma.artist.findUnique({ where: { slug: artistSlug } })
      if (artist) {
        await prisma.songArtist.create({
          data: { songId: song.id, artistId: artist.id }
        })
      }
    }

    // Connect genres
    for (const genreSlug of genreSlugs) {
      const genre = await prisma.genre.findUnique({ where: { slug: genreSlug } })
      if (genre) {
        await prisma.songGenre.create({
          data: { songId: song.id, genreId: genre.id }
        })
      }
    }

    // Connect categories
    for (const categorySlug of categorySlugs) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
      if (category) {
        await prisma.songCategory.create({
          data: { songId: song.id, categoryId: category.id }
        })
      }
    }

    console.log(`✅ Created song: ${songInfo.title}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
