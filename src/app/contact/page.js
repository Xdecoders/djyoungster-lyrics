import { redirect } from 'next/navigation'

// Redirect /contact to /contact-us to avoid duplicate content
export default function ContactPage() {
  redirect('/contact-us')
}
