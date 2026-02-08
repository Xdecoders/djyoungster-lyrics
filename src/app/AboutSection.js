import { FiInfo, FiHelpCircle } from 'react-icons/fi'
import FAQAccordion from './FAQAccordion'

export default function AboutSection({ faqs }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About DJYoungster - Server Side Rendered for SEO */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FiInfo className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">About DJYoungster</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Welcome to <strong>DJYoungster</strong>, your ultimate destination for discovering and exploring song lyrics from around the world. Established as a trusted source for music enthusiasts, we bring together a vast collection of lyrics spanning multiple languages including Hindi, Punjabi, English, Tamil, Telugu, Bhojpuri, Haryanvi, and many more regional languages.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Whether you're looking for the latest Bollywood hits, trending Punjabi tracks, classic English songs, or regional favorites, DJYoungster has you covered. Our platform is designed to help music lovers find accurate lyrics quickly, understand song meanings, discover new artists, and connect with the stories behind every song.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              <strong className="text-slate-700 dark:text-slate-200">Create Instagram Stories:</strong> Express yourself with our innovative Instagram Story creator! Select your favorite lyrics (2-4 lines) from any song and transform them into stunning, shareable story images. Choose from beautiful templates including Sad, Happy, Romantic, and Neon themes – perfect for sharing your mood, expressing emotions, or connecting with friends through music on Instagram, WhatsApp, and other social platforms.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              DJYoungster is more than just a lyrics website – it's a trusted community for music enthusiasts. We continuously update our database with verified lyrics from new releases, provide romanized versions for non-native speakers, offer English translations for better understanding, and deliver creative tools for social sharing. Trusted by over 15,000+ users monthly, join the DJYoungster family and discover why we're the go-to platform for accurate lyrics and creative expression.
            </p>
          </div>
        </article>

        {/* FAQs - Server Side Rendered with Client-side Accordion */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <FiHelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Frequently Asked Questions</h2>
          </div>

          {/* Render FAQs as static HTML for SEO */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="sr-only" itemProp="name">{faq.question}</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="sr-only" itemProp="text">{faq.answer}</p>
                </div>
              </div>
            ))}

            {/* Client-side accordion for interactivity */}
            <FAQAccordion faqs={faqs} />
          </div>
        </article>
      </div>
    </section>
  )
}
