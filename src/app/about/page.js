import { permanentRedirect } from 'next/navigation'

// Redirect /about to /about-us to avoid duplicate content
export default function AboutPage() {
  permanentRedirect('/about-us')
}
