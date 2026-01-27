import Link from 'next/link'
import { FiMusic, FiUsers, FiHeart, FiGlobe, FiMail } from 'react-icons/fi'

export const metadata = {
  title: 'About Us - DJYoungster Lyrics',
  description: 'Learn about DJYoungster Lyrics - Your ultimate destination for song lyrics from Bollywood, Punjabi, English, and regional languages.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <FiMusic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">About DJYoungster Lyrics</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Your ultimate destination for song lyrics</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Who We Are</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Welcome to <strong>DJYoungster Lyrics</strong>, your go-to platform for discovering and enjoying song lyrics from various genres and languages. We are passionate about music and believe that lyrics are the soul of every song.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our mission is to provide accurate, well-formatted lyrics for songs across Bollywood, Punjabi, English, Tamil, Telugu, and many other regional languages. We strive to make lyrics accessible to everyone, helping music lovers connect more deeply with their favorite songs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <FiUsers className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Our Community</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                We serve music enthusiasts from around the world who share a love for lyrics and the stories they tell.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <FiHeart className="w-10 h-10 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Our Passion</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Music connects people. We're dedicated to helping you find the perfect lyrics to sing along to your favorite tunes.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <FiGlobe className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Multi-Language Support</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                We offer lyrics in multiple languages including Hindi, Punjabi, English, Tamil, Telugu, and more regional languages.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              <FiMail className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Get In Touch</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Have questions or suggestions? We'd love to hear from you. Reach out to us anytime.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>Extensive collection of song lyrics across multiple genres</li>
              <li>Accurate and well-formatted lyrics</li>
              <li>Easy-to-use search functionality</li>
              <li>Lyrics in multiple languages including romanized versions</li>
              <li>Artist and album information</li>
              <li>Regular updates with new song releases</li>
              <li>Mobile-friendly design for on-the-go access</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4 opacity-90">
              For any queries, suggestions, or removal requests, please contact us at:
            </p>
            <a href="mailto:djyoungster32@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-medium hover:bg-slate-100 transition">
              <FiMail className="w-5 h-5" />
              djyoungster32@gmail.com
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:text-emerald-600 font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
