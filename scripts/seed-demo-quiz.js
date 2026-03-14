/**
 * Seed demo songs for each language so the Daily Quiz can generate.
 * Run: node scripts/seed-demo-quiz.js
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Category slugs from DB
const CATEGORY_SLUGS = {
  hindi: 'hindi',
  punjabi: 'punjabi',
  english: 'english',
  tamil: 'tamil',
  telugu: 'telugu',
}

// Artist IDs from DB (reuse existing)
const ARTISTS = {
  hindi: '00ceab27-2ee5-4720-beec-9db4685ea7e1',     // Arijit Singh
  hindi2: '60bc2328-f74a-4a61-967a-081875dd8287',    // Sonu Nigam
  punjabi: '3af9f1a8-42b0-4578-8cb2-d8c217ed2ed3',  // Guru Randhawa
  punjabi2: 'a12e2df1-5e5d-430a-a469-c7d5baa5f5c5', // Asees Kaur
  english: 'b93b8dec-351e-4325-94bf-a7c88c5d644e',  // Vishal Dadlani
  tamil: '86bee4a0-3f25-4537-85a2-e4ad8573edf1',    // Anirudh Ravichander
  tamil2: 'd65deb3a-e09d-4e95-8195-b54e7a3af791',   // Dhanush
  telugu: '1be6b8eb-a267-47d9-beb9-d86cc75e8110',   // Thaman S
  telugu2: '9eee1f01-d314-4fbb-b715-047073833972',  // Balamuralikrishna
}

const DEMO_SONGS = [
  // ─── HINDI (3 more needed, but adding 6 to be safe) ───────────────────────
  {
    language: 'hindi',
    title: 'Tum Hi Ho',
    slug: 'demo-tum-hi-ho',
    artistId: ARTISTS.hindi,
    lyrics: `Hum tere bin ab reh nahi sakte<br/>Tere bina kya wajood mera<br/>Tujhse juda gar ho jaayenge<br/>Toh khud se hi ho jaayenge juda<br/>Kyunki tum hi ho aab tum hi ho<br/>Zindagi ab tum hi ho<br/>Chain bhi mera dard bhi mera<br/>Meri aashiqui ab tum hi ho<br/>Tera mera rishta hai kaisa<br/>Ik pal door gaye toh<br/>Tarse yeh naina<br/>Bata mere saathi bata<br/>Nahi jeena tere bina<br/>Hum tere bin ab reh nahi sakte<br/>Tere bina kya wajood mera`,
  },
  {
    language: 'hindi',
    title: 'Kabhi Alvida Naa Kehna',
    slug: 'demo-kabhi-alvida',
    artistId: ARTISTS.hindi2,
    lyrics: `Kabhi alvida naa kehna kabhi alvida naa kehna<br/>Woh lamhe woh baatein woh raatein yaad hain<br/>Woh hasna woh rulana sab mere saath hain<br/>Main sochta hoon woh pal kyun aaye the<br/>Jo dil mein uthkar gaye the<br/>Tere bina main adhura hoon<br/>Tujhse hi meri zindagi poori hai<br/>Kabhi alvida naa kehna kabhi alvida naa kehna<br/>Yeh rishta hai woh rishta jo kabhi na toote<br/>Kabhi na bichde kabhi na chhute<br/>Dil se dil ka jo naata hai<br/>Woh pyaar kabhi na jaata hai`,
  },
  {
    language: 'hindi',
    title: 'Kal Ho Naa Ho',
    slug: 'demo-kal-ho-naa-ho',
    artistId: ARTISTS.hindi,
    lyrics: `Har pal yahan jee bhar jiyo<br/>Jo hai sama kal ho na ho<br/>Har pal yahan jee bhar jiyo<br/>Jo hai sama kal ho naa ho<br/>Har khushi ho tumhari<br/>Aisee raat kyun nahi jaati<br/>Subah hogi toh kya hoga<br/>Zindagi ka ek khuubsurat safar hai yeh<br/>Muskuraata reh hamesha<br/>Gham door kar aur khushi se ji<br/>Kal ho naa ho tera saath ho<br/>Teri khushiyon ka raaz ho<br/>Dil mein teri yaad ho`,
  },
  {
    language: 'hindi',
    title: 'Ae Dil Hai Mushkil',
    slug: 'demo-ae-dil-hai-mushkil',
    artistId: ARTISTS.hindi,
    lyrics: `Ae dil hai mushkil jeena yahan<br/>Ae dil hai mushkil jeena yahan<br/>Zara hatke zara bachke<br/>Yeh hai Bombay meri jaan<br/>Kahin building kahin traame<br/>Kahin motor kahin mill<br/>Milta hai yahan sab kuch<br/>Ik milta nahin dil<br/>Insaan ka nahin kahin naam-o-nishan<br/>Ae dil hai mushkil jeena yahan<br/>Zara hatke zara bachke<br/>Yeh hai Bombay meri jaan`,
  },
  {
    language: 'hindi',
    title: 'Gerua',
    slug: 'demo-gerua',
    artistId: ARTISTS.hindi,
    lyrics: `Rang de tu mohe gerua<br/>Rang de tu mohe gerua<br/>Raata roothe toh roothe<br/>Chandrama roothe toh roothe<br/>Ishq tera rang laga de<br/>Rang de tu mohe gerua<br/>Aaj raat jo chandni hai<br/>Teri aankhon ki chandni hai<br/>Chhoo ke teri baahon ko main<br/>Kho jaata hoon<br/>Bin tere adhoora hoon<br/>Tujhse hi mujhe milna hai<br/>Pyaar mein rang jaana hai<br/>Rang de tu mohe gerua`,
  },
  {
    language: 'hindi',
    title: 'Channa Mereya',
    slug: 'demo-channa-mereya',
    artistId: ARTISTS.hindi,
    lyrics: `Channa mereya mereya channa mereya<br/>Channa mereya mereya channa mereya<br/>Achha chalte chalte ruk ja<br/>Ek pal ki toh saza de<br/>Jeene ki wajah toh bata<br/>Kuch toh mere haath mein de<br/>Koi nahi hoga yahan tera<br/>Toh phir kya teri gali<br/>Kya teri kasam kya teri duaa<br/>Channa mereya mereya<br/>Bewajah toh nahi rootha tu<br/>Kuch toh baat hogi tujhe bhi<br/>Sapnon mein aata kyun hai<br/>Agar dil nahi lagta yahan`,
  },

  // ─── PUNJABI (4 more needed) ──────────────────────────────────────────────
  {
    language: 'punjabi',
    title: 'Suit Suit',
    slug: 'demo-suit-suit',
    artistId: ARTISTS.punjabi,
    lyrics: `Suit suit karda karda patola patola<br/>Patola patola suit suit karda karda<br/>Teri photo khichaata main rozana<br/>Tera nakhara sehna main rozana<br/>Fer vi dil tenu maarda<br/>Suit suit karda karda<br/>Teri chunni lehraaundi<br/>Dil mera ud ud jaanda<br/>Teri hasi maarundi<br/>Dil mera reh reh jaanda<br/>Teri aankhaan de taare<br/>Dil lainde sare<br/>Suit suit karda karda patola`,
  },
  {
    language: 'punjabi',
    title: 'Laembadgini',
    slug: 'demo-laembadgini',
    artistId: ARTISTS.punjabi,
    lyrics: `Laembadgini laembadgini laembadgini haaye<br/>Teri aankhaan de laembadgini<br/>Dil mera ud ud jaaye<br/>Teri walk laembadgini<br/>Tera style laembadgini<br/>Tenu takda reh jaanda<br/>Dil mera keh jaanda<br/>Oye hoye oye hoye<br/>Patola peg lagake naachda<br/>Laembadgini teri ada laembadgini<br/>Har koi tera deewana<br/>Tenu takda aana jaana<br/>Laembadgini laembadgini haaye`,
  },
  {
    language: 'punjabi',
    title: 'Tenu Suit Suit Karda',
    slug: 'demo-tenu-suit',
    artistId: ARTISTS.punjabi2,
    lyrics: `Tenu suit suit karda<br/>Goriye suit suit karda<br/>Tenu suit suit karda<br/>Patola patola patola<br/>Teri chunni de rang wangu<br/>Rang gaya hai dil mera<br/>Tere naal rehna mujhe<br/>Chahunda hai dil mera<br/>Tenu suit karda patola karda<br/>Teri ada te marda marda<br/>Sajna tenu suit suit karda<br/>Goriye patola patola`,
  },
  {
    language: 'punjabi',
    title: 'Nikle Currant',
    slug: 'demo-nikle-currant',
    artistId: ARTISTS.punjabi,
    lyrics: `Nikle currant tere yaar da<br/>Jado maar di nazar yaar da<br/>Nikle current tere yaar da<br/>Maar di jado nazar yaar da<br/>Tenu dekhke hawa lagdi mujhe<br/>Tere naal taan sawa lagdi mujhe<br/>Teri aankhon mein hai kuch aisa<br/>Dil ne maana yeh hai paisaa<br/>Nikle current tere yaar da<br/>Tere pyaar da current nikle<br/>Teri ik nazar se dil dhadke<br/>Nikle current tere yaar da`,
  },
  {
    language: 'punjabi',
    title: 'High Rated Gabru',
    slug: 'demo-high-rated-gabru',
    artistId: ARTISTS.punjabi,
    lyrics: `Main high rated gabru<br/>Teri photo khinchke roz dekhan<br/>Teri yaad aundi roz sakun<br/>High rated gabru<br/>Teri aankhaan de tare gin gin<br/>Dil mera ud ud jaanda<br/>Teri hasi sundi main gin gin<br/>Mann mera bhij bhij jaanda<br/>Main high rated gabru<br/>Tenu lena apne naal<br/>Teri aadat payi gaye yaar<br/>Main high rated gabru<br/>Teri aankhaan ne maar liya<br/>Dil mera ud ud jaanda`,
  },

  // ─── ENGLISH (3 more needed) ──────────────────────────────────────────────
  {
    language: 'english',
    title: 'Blinding Lights',
    slug: 'demo-blinding-lights',
    artistId: ARTISTS.english,
    lyrics: `I've been trying to call you<br/>I've been on my own for long enough<br/>Maybe you can show me how to love maybe<br/>I'm going through withdrawals<br/>You don't even have to do too much<br/>You can turn me on with just a touch baby<br/>I look around and sin is everywhere<br/>You don't have to make me feel like nobody<br/>I've been running out of time<br/>I need you blinding lights<br/>Without your love I'm not okay<br/>Without your touch I fall away<br/>I need your love baby come save me tonight<br/>Blinding lights city lights`,
  },
  {
    language: 'english',
    title: 'Shape of You',
    slug: 'demo-shape-of-you',
    artistId: ARTISTS.english,
    lyrics: `The club isn't the best place to find a lover<br/>So the bar is where I go<br/>Me and my friends at the table doing shots<br/>Drinking faster and then we talk slow<br/>Come over and start talking to me<br/>I'm crazy and I like the way you move<br/>I'm in love with your body<br/>Every day discovering something brand new<br/>I'm in love with the shape of you<br/>We push and pull like a magnet do<br/>Although my heart is falling too<br/>I'm in love with your body<br/>Last night you were in my room<br/>And now my bedsheets smell like you`,
  },
  {
    language: 'english',
    title: 'Stay With Me',
    slug: 'demo-stay-with-me',
    artistId: ARTISTS.english,
    lyrics: `Guess it's true I'm not good at a one night stand<br/>But I still need love cause I'm just a man<br/>These nights never seem to go to plan<br/>I don't want you to leave will you hold my hand<br/>Oh won't you stay with me<br/>Cause you're all I need<br/>This ain't love it's clear to see<br/>But darling stay with me<br/>Why am I so emotional<br/>No it's not a good look gain some self control<br/>Deep down I know this never works<br/>But you can lay with me so it doesn't hurt<br/>Oh won't you stay with me<br/>Cause you're all I need`,
  },
  {
    language: 'english',
    title: 'Perfect',
    slug: 'demo-perfect',
    artistId: ARTISTS.english,
    lyrics: `I found a love for me<br/>Darling just dive right in and follow my lead<br/>Well I found a girl beautiful and sweet<br/>I never knew you were the someone waiting for me<br/>Cause we were just kids when we fell in love<br/>Not knowing what it was I will not give you up this time<br/>Darling just kiss me slow your heart is all I own<br/>And in your eyes you're holding mine<br/>Baby I'm dancing in the dark<br/>With you between my arms<br/>Barefoot on the grass listening to our favourite song<br/>When you said you looked a mess<br/>I whispered underneath my breath<br/>But you heard it darling you look perfect tonight`,
  },

  // ─── TAMIL (5 needed) ─────────────────────────────────────────────────────
  {
    language: 'tamil',
    title: 'Rowdy Baby',
    slug: 'demo-rowdy-baby',
    artistId: ARTISTS.tamil2,
    lyrics: `Maari maari maari maari vaada<br/>Rowdy baby rowdy baby rowdy rowdy<br/>Thaali kettuven thaali kettuven<br/>Nee romba rowdy baby<br/>Maari maari maari maari vaada<br/>Kaanom kaadhal kaanom kaadhal<br/>Un kaadhali paartha paartha<br/>Idhu enna aagudhu<br/>Rowdy baby rowdy baby<br/>Nee vandha vazhiya maari<br/>En dil ulla thaan irukkiya<br/>Rowdy baby rowdy baby rowdy rowdy<br/>Thaali kettuven nee romba rowdy baby`,
  },
  {
    language: 'tamil',
    title: 'Kannaana Kanney',
    slug: 'demo-kannaana-kanney',
    artistId: ARTISTS.tamil,
    lyrics: `Kannaana kanney konja neram<br/>Kaathezhuthu vandhu sol<br/>Manasukku sevvanam maela<br/>Kanne kalaimane<br/>Kannaana kanney konja neram<br/>Un kannilae thoongudi<br/>Vaanam paarthu ketkudhae<br/>Paadal paadu paadal paadu<br/>Unnai paarthu unnaippol<br/>Ennalae yezhudhavillai<br/>Kannaana kanney nee vandha<br/>Vaazhkai maari vittae<br/>Illai illai ennalae<br/>Paesum vali puriyavillai`,
  },
  {
    language: 'tamil',
    title: 'Ennodu Nee Irundhal',
    slug: 'demo-ennodu-nee',
    artistId: ARTISTS.tamil,
    lyrics: `Ennodu nee irundhal yenum<br/>Vaanam vizhum thaai maela<br/>Kadhalum pirandhadhu<br/>Kaadhal enum veedil<br/>Ennodu nee irundhal<br/>Vazhikaatti niruththi<br/>Un kangal paesugindrana<br/>Kaadhal enum kavidhai<br/>Ennodu nee irundhal yenum<br/>Vaanam vizhum thaai maela<br/>Pala kanavugal kanda<br/>Vazhikaadu theriyum<br/>Unnaipol oru penn<br/>Kaadhaliyen jeevan`,
  },
  {
    language: 'tamil',
    title: 'Nenjukulle',
    slug: 'demo-nenjukulle',
    artistId: ARTISTS.tamil,
    lyrics: `Nenjukulle nenjukulle<br/>Nee irukkaai nee irukkaai<br/>Vaanam thodum varai<br/>Nee irukkaai<br/>Nenjukulle nenjukulle<br/>Ninaivugal yenum<br/>Nee vandha naal mudhale<br/>Manam maari vittadhu<br/>Nenjukulle nenjukulle<br/>Un kangal kadhaigal<br/>Paesugindrana ennai<br/>Kaadhaliyen jeevan<br/>Nenjukulle nenjukulle<br/>Nee irukkaai nee irukkaai`,
  },
  {
    language: 'tamil',
    title: 'Vaaranam Aayiram',
    slug: 'demo-vaaranam-aayiram',
    artistId: ARTISTS.tamil2,
    lyrics: `Vaaranam aayiram sharanam aayiram<br/>Unnai thaedi vandhaen<br/>Vaaranam aayiram sharanam aayiram<br/>Un kaigal thedi vandhaen<br/>Kanmani anbodu kaadhal seivaai<br/>Kangal irandal pennin kaadhal<br/>Vaaranam aayiram sharanam aayiram<br/>Amma endru azhaikkaadha<br/>Uyirillaadha manidhanillai<br/>Unnai thaedi vandhaen amma<br/>Vaaranam aayiram sharanam aayiram<br/>Pennin kaadhal paasam aagudhu`,
  },
  {
    language: 'tamil',
    title: 'Petta Paraak',
    slug: 'demo-petta-paraak',
    artistId: ARTISTS.tamil2,
    lyrics: `Petta paraak petta paraak<br/>Rajiniyum avar pettakkaarar<br/>Petta paraak petta paraak<br/>Rajini vandha rajakkaararey<br/>Namma ooru namma ooru<br/>Namma ooru singaara velan<br/>Rowdy rowdy rowdy petta rowdy<br/>Petta paraak petta paraak<br/>Kadavul varum kadavul varum<br/>Kadavul varum thambi<br/>Petta paraak petta paraak<br/>Namma raajaa vandhu vittan<br/>Petta paraak petta paraak`,
  },

  // ─── TELUGU (5 needed) ────────────────────────────────────────────────────
  {
    language: 'telugu',
    title: 'Buttabomma',
    slug: 'demo-buttabomma',
    artistId: ARTISTS.telugu,
    lyrics: `Buttabomma buttabomma<br/>Navvindi navvindi navvindi<br/>Ee prema ela cheppanu<br/>Nee kanneeti vennela<br/>Buttabomma buttabomma<br/>Nee chupulu chupulu<br/>Manasunu maaye chesaayi<br/>Nee andamu choodaleka<br/>Buttabomma buttabomma<br/>Navvindi navvindi navvindi<br/>Premalo padipoyaanu<br/>Nee kanneeti vennela<br/>Nee navvu na prana<br/>Buttabomma buttabomma`,
  },
  {
    language: 'telugu',
    title: 'Saranga Dariya',
    slug: 'demo-saranga-dariya',
    artistId: ARTISTS.telugu2,
    lyrics: `Saranga dariya saranga dariya<br/>Sagam naaku saraga premalo<br/>Saranga dariya saranga dariya<br/>Kalala kosam saagutunna priya<br/>Oka chinna anubhavam<br/>Manasunu thaakindi<br/>Nee choopu oka vadam<br/>Gundenu meladindi<br/>Saranga dariya saranga dariya<br/>Sagam naaku saraga premalo<br/>Prema prema prema prem priyaa<br/>Saranga dariya saranga dariya<br/>Nee kanneeti vennela<br/>Oka vela nenu kalalo`,
  },
  {
    language: 'telugu',
    title: 'Oo Antava',
    slug: 'demo-oo-antava',
    artistId: ARTISTS.telugu,
    lyrics: `Oo antava mava oo antava<br/>Oo antava mava oo antava<br/>Navvuthu navvuthu thaakey<br/>Gundelu danichesey<br/>Oo antava mava oo antava<br/>Nee choopu choopu choopu<br/>Naa prana teeseytundi<br/>Oo antava mava oo antava<br/>Navvindi navvindi<br/>Nee navvu naa jeevanam<br/>Oo antava mava oo antava<br/>Premalo padindi padam<br/>Gundelo kaladi kadam<br/>Oo antava mava oo antava`,
  },
  {
    language: 'telugu',
    title: 'Naa Ready',
    slug: 'demo-naa-ready',
    artistId: ARTISTS.telugu,
    lyrics: `Naa ready naa ready naa ready<br/>Nee kosam naa ready<br/>Naa prana naa ready<br/>Nee premaku naa ready<br/>Naa ready naa ready<br/>Oka manchi pellam kaavali<br/>Manasukku nacchinattundi<br/>Nee choopu oka bangaram<br/>Naa gundeto taakinindi<br/>Naa ready naa ready naa ready<br/>Nee kosam naa ready<br/>Premato naa ready<br/>Nee navvutho naa ready<br/>Naa ready naa ready`,
  },
  {
    language: 'telugu',
    title: 'Srivalli',
    slug: 'demo-srivalli',
    artistId: ARTISTS.telugu,
    lyrics: `Srivalli srivalli<br/>Nee navvu naa ventaadi<br/>Srivalli srivalli<br/>Nee choopu naa premadi<br/>Nee paata vinipinchu<br/>Nee paata vinipinchu<br/>Manasuna nalipinchu<br/>Srivalli srivalli<br/>Oka vela nenu<br/>Nee premalo padipoyaanu<br/>Srivalli srivalli<br/>Nee navvu naa ventaadi<br/>Manasunu maaye chesaavu<br/>Srivalli srivalli<br/>Nee choopu naa premadi`,
  },
  {
    language: 'telugu',
    title: 'Naatu Naatu',
    slug: 'demo-naatu-naatu',
    artistId: ARTISTS.telugu,
    lyrics: `Naatu naatu naatu naatu<br/>Naatu naatu naatu naatu<br/>Naatunaatu naatu naatunaatu<br/>Kompareyyi kompareyyi<br/>Kompareyyi kompareyyi<br/>Naatu naatu naatu naatu<br/>Naatunaatu naatunaatu<br/>Oka sari cheppammaa<br/>Naatu naatu naatu<br/>Nee naatu naatu<br/>Naatunaatu naatunaatu<br/>Kompa reyyile kompa reyyile<br/>Naatu naatu naatu naatu<br/>Naatunaatu naatunaatu`,
  },
]

async function main() {
  console.log('Fetching categories...')
  const categories = await prisma.category.findMany()
  const catMap = {}
  categories.forEach(c => { catMap[c.slug] = c.id })

  let created = 0
  let skipped = 0

  for (const song of DEMO_SONGS) {
    const catSlug = CATEGORY_SLUGS[song.language]
    const catId = catMap[catSlug]

    if (!catId) {
      console.log(`⚠ No category found for slug: ${catSlug}`)
      continue
    }

    // Check if already exists
    const existing = await prisma.song.findUnique({ where: { slug: song.slug } })
    if (existing) {
      console.log(`  skip (exists): ${song.title}`)
      skipped++
      continue
    }

    await prisma.song.create({
      data: {
        title: song.title,
        slug: song.slug,
        lyrics: song.lyrics,
        status: 'published',
        artists: {
          create: [{ artistId: song.artistId }],
        },
        categories: {
          create: [{ categoryId: catId }],
        },
      },
    })
    console.log(`  ✓ created: ${song.title} [${song.language}]`)
    created++
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`)

  // Show counts per language
  console.log('\nSong counts per language:')
  for (const [lang, slug] of Object.entries(CATEGORY_SLUGS)) {
    const count = await prisma.song.count({
      where: {
        status: 'published',
        lyrics: { not: '' },
        categories: { some: { category: { slug } } },
      },
    })
    console.log(`  ${lang}: ${count} songs ${count >= 5 ? '✓' : '✗ (need more)'}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
