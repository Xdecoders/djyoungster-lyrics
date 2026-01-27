import Link from 'next/link'
import { FiFileText } from 'react-icons/fi'

export const metadata = {
  title: 'Terms and Conditions - DJYoungster Lyrics',
  description: 'Terms and Conditions for using DJYoungster Lyrics website. Please read these terms carefully before using our service.',
}

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <FiFileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">Terms and Conditions</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: {currentDate}</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Welcome to DJYoungster Lyrics. By accessing and using this website (djyoungster.com), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              By accessing or using DJYoungster Lyrics, you agree to comply with and be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. These terms apply to all visitors, users, and others who access or use the website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              DJYoungster Lyrics provides a platform for users to access song lyrics for personal, non-commercial use. Our services include:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Access to song lyrics in multiple languages</li>
              <li>Search functionality for finding lyrics</li>
              <li>Artist and album information</li>
              <li>Newsletter subscription service</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">3. Intellectual Property Rights</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The lyrics displayed on this website are the property of their respective owners (songwriters, composers, and music publishers). We do not claim ownership of any lyrics displayed on our website.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The website design, logo, and original content created by DJYoungster Lyrics are our intellectual property and are protected by copyright laws.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">4. Permitted Use</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You may use our website for personal, non-commercial purposes only. You agree not to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Reproduce, distribute, or commercially exploit the content</li>
              <li>Use automated systems or software to extract data from the website</li>
              <li>Attempt to gain unauthorized access to any portion of the website</li>
              <li>Use the website for any unlawful purpose</li>
              <li>Interfere with or disrupt the website or servers</li>
              <li>Upload or transmit viruses or malicious code</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">5. Copyright Infringement</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We respect the intellectual property rights of others. If you believe that any content on our website infringes your copyright, please contact us at{' '}
              <a href="mailto:djyoungster32@gmail.com" className="text-primary hover:text-emerald-600">
                djyoungster32@gmail.com
              </a>{' '}
              with the following information:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Description of the copyrighted work</li>
              <li>URL of the infringing content on our website</li>
              <li>Your contact information</li>
              <li>A statement that you have a good faith belief that the use is unauthorized</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We will respond to valid copyright infringement notices and remove infringing content within 48 hours.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">6. User Submissions</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you submit any content to us (such as feedback, suggestions, or corrections), you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, and display such content.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">7. Third-Party Links</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party websites. You access such websites at your own risk.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">8. Advertisements</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may display advertisements on our website through third-party advertising networks such as Google AdSense. These advertisements are clearly distinguishable from our content. We are not responsible for the content of any advertisements.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This website is provided "as is" without any warranties, express or implied. We do not warrant that:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>The website will be available at all times</li>
              <li>The information on the website is accurate or complete</li>
              <li>The website is free from errors or viruses</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              To the fullest extent permitted by law, DJYoungster Lyrics shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">11. Indemnification</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You agree to indemnify and hold harmless DJYoungster Lyrics from any claims, damages, losses, or expenses arising from your violation of these Terms and Conditions or your use of the website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">12. Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the website. Your continued use of the website after any changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">13. Governing Law</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">14. Contact Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Email:</strong>{' '}
              <a href="mailto:djyoungster32@gmail.com" className="text-primary hover:text-emerald-600">
                djyoungster32@gmail.com
              </a>
            </p>
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
