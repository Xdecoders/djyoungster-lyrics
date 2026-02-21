import RequestSongForm from './RequestSongForm'

export const metadata = {
  title: 'Request Song Lyrics - DJYoungster',
  description: 'Can\'t find your favorite song lyrics? Request any song lyrics and we\'ll add them to DJYoungster. Submit your request with song name, artist, and optional details.',
  openGraph: {
    title: 'Request Song Lyrics - DJYoungster',
    description: 'Can\'t find your favorite song lyrics? Request any song lyrics and we\'ll add them to DJYoungster.',
    type: 'website',
  },
}

export default function RequestSongPage() {
  return <RequestSongForm />
}
