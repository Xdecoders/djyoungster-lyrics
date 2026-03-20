export const AUTHORS = [
  {
    name: 'Rahul Sharma',
    slug: 'rahul-sharma',
    title: 'Senior Entertainment Journalist',
    avatar: 'RS',
    color: '#3b82f6',
    location: 'Mumbai, Maharashtra',
    joined: '2019',
    specialties: ['Box Office', 'Bollywood Reviews', 'Film Analysis'],
    social: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    bio: `Rahul grew up in Pune going to the cinema every Friday with his father. Not the multiplex. The old single-screen theatre near their house that smelled of popcorn and worn-out velvet seats. His father kept a small notebook where he wrote down the name of every film they watched and what he thought of it. Rahul started doing the same when he was eleven. He still does it now, except the notebook is a Google Sheet with about nine hundred entries.

He moved to Mumbai after college and got his first paid writing job at a small entertainment website that no longer exists. The money was bad and the deadlines were brutal, but he got to write about films every single day, which felt like an unfair arrangement in his favour. He spent the next few years covering box office numbers for a larger publication before joining DJYoungster, where he has been writing ever since.

His thing is the numbers. Not because he thinks box office is the point of cinema, but because he finds it genuinely fascinating what those numbers say about the country. A film doing twice its expected business in tier-two cities tells you something. A big-budget release flopping in its first weekend tells you something else. Rahul writes about both, without pretending one is more important than the other. He also reviews films, and he tries hard to be honest even when honesty is inconvenient.`,
    stats: { articles: 0, yearsActive: 8 },
  },
  {
    name: 'Priya Mehta',
    slug: 'priya-mehta',
    title: 'Music Writer & Lyrics Analyst',
    avatar: 'PM',
    color: '#ec4899',
    location: 'Delhi, NCR',
    joined: '2020',
    specialties: ['Punjabi Music', 'Lyrics Deep Dives', 'New Releases'],
    social: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    bio: `Priya grew up in a house where music was always on but nobody ever talked about it seriously. Her father played old Lata Mangeshkar records on Sunday mornings without saying a word about them, just listening. Her brother would come home on weekends and blast Sidhu Moosewala from his room loud enough that the whole building could hear. Nobody in her family analysed any of it. Priya was the one who could not stop thinking about why certain songs felt the way they did.

She studied journalism at Delhi University, which she mostly found useful for learning how to write fast and miss sleep. For two years after graduating she wrote lifestyle content for websites she would rather not name now. The work paid okay and bored her completely. She kept noticing that the only pieces she felt genuinely good about were the ones where she had managed to sneak in something about music.

Eventually she stopped sneaking and just started writing about music directly. She pitched a piece about Punjabi rap lyrics to a small regional blog, not expecting much, and the response surprised her. That was the turn. She wrote more, got better, started getting commissioned rather than pitching cold, and ended up at DJYoungster covering new releases, album drops, and the kind of lyric breakdowns that most outlets do not bother with because they think the audience is not interested. Priya believes the audience is very interested. The numbers tend to agree with her.`,
    stats: { articles: 0, yearsActive: 5 },
  },
  {
    name: 'Arjun Singh',
    slug: 'arjun-singh',
    title: 'Film Critic & Industry Analyst',
    avatar: 'AS',
    color: '#f97316',
    location: 'Hyderabad, Telangana',
    joined: '2020',
    specialties: ['Telugu Cinema', 'Pan-India Films', 'OTT & Streaming'],
    social: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    bio: `Arjun grew up watching Hindi films in Lucknow and did not see a Telugu film until he moved to Hyderabad for engineering at nineteen. He went to see one because his new roommate insisted, expecting nothing, and came out genuinely unsettled by how good it was. Over the next few weeks he watched about a dozen more and started thinking seriously about why nobody in his circle back home was paying attention to this stuff.

He started a film review column in the college newsletter as a way to make sense of what he was watching. He had no plan beyond that. Somehow the newsletter ended up with 40,000 monthly readers by his third year, which told him something. He did not complete the engineering degree. He does not regret it.

After dropping out he spent two years at a Hyderabad production house doing script coverage, reading maybe four hundred scripts in that time. Most of them were not very good, which taught him a lot about why the ones that work actually work. He joined DJYoungster to write about Telugu cinema and pan-India releases. He has a particular interest in how South Indian films have changed what Hindi-speaking audiences expect from a mainstream blockbuster, and several of his pieces on why RRR and Pushpa connected the way they did are among the most read on the site.`,
    stats: { articles: 0, yearsActive: 5 },
  },
  {
    name: 'Neha Kapoor',
    slug: 'neha-kapoor',
    title: 'Entertainment Writer & Artist Features',
    avatar: 'NK',
    color: '#8b5cf6',
    location: 'Bangalore, Karnataka',
    joined: '2021',
    specialties: ['Artist Profiles', 'Upcoming Releases', 'Celebrity News'],
    social: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    bio: `Neha did not set out to be a music writer. She studied English Literature at Christ University in Bangalore, which she loved, and expected it to lead somewhere in publishing or maybe academia. What actually happened was that she kept writing very long Instagram captions under concert photos because she had things to say and nobody around her wanted to hear quite that much of it.

One of those captions was about a Bollywood composer she thought was being badly overlooked. A music label person saw it, shared it internally, and someone reached out asking if she did this kind of writing professionally. She said yes, though at that point she did not. She figured she would become professional by the time anyone noticed. It worked out.

She spent a few years doing commissioned pieces for various outlets before joining DJYoungster in 2021. She covers artist profiles, upcoming releases, and the celebrity side of the entertainment beat. She is the one who actually goes to things, which sounds like a small thing until you realise how much of entertainment journalism is written entirely from press releases. Neha goes to the album launches, the press events, the film promotions, and occasionally the after-parties when there is something worth writing about there too. She comes back with details. That is her real skill.`,
    stats: { articles: 0, yearsActive: 4 },
  },
]

export function getAuthor(slug) {
  return AUTHORS.find(a => a.slug === slug) || null
}

export function getAuthorByName(name) {
  return AUTHORS.find(a => a.name === name) || null
}
