import Link from 'next/link'
import { FiAlertCircle } from 'react-icons/fi'

export const metadata = {
  title: 'Disclaimer - DJYoungster Lyrics',
  description: 'Disclaimer for DJYoungster Lyrics. Important information about the content and use of our website.',
}

export default function DisclaimerPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <FiAlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">Disclaimer</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: {currentDate}</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The information provided on DJYoungster Lyrics (djyoungster.com) is for general informational and entertainment purposes only. Please read this disclaimer carefully before using our website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">1. Copyright Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              All song lyrics displayed on this website are the property of their respective owners, including but not limited to songwriters, composers, music publishers, and record labels. DJYoungster Lyrics does not claim ownership of any lyrics.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The lyrics are provided for personal and educational purposes only. If you are the rightful owner of any content on this website and wish to have it removed, please contact us at{' '}
              <a href="mailto:djyoungster32@gmail.com" className="text-primary hover:text-emerald-600">
                djyoungster32@gmail.com
              </a>
              , and we will remove the content within 48 hours.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">2. Accuracy of Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              While we strive to provide accurate and up-to-date lyrics, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the lyrics or related information.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Lyrics may contain errors, typos, or may differ from the official versions. Any reliance you place on such information is strictly at your own risk.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">3. No Professional Advice</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The content on this website is not intended to constitute professional advice of any kind. For matters requiring professional assistance, please consult appropriate qualified professionals.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">4. External Links Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our website may contain links to external websites that are not owned or controlled by DJYoungster Lyrics. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We strongly advise you to read the terms and conditions and privacy policies of any third-party websites you visit.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">5. Advertisement Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our website may display advertisements from third-party advertising networks. We do not endorse and are not responsible for the content of any advertisements. The presence of advertisements does not constitute an endorsement of the advertised products or services.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">6. Fair Use Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This website may contain copyrighted material, the use of which may not have been specifically authorized by the copyright owner. We believe this constitutes "fair use" of the copyrighted material as provided for in various copyright laws for the following purposes:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Educational purposes</li>
              <li>Personal, non-commercial use</li>
              <li>Commentary and criticism</li>
              <li>News reporting</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you wish to use copyrighted material from this site for purposes of your own that go beyond fair use, you must obtain permission from the copyright owner.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              In no event shall DJYoungster Lyrics be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence, or other arising out of or in connection with the use of the website or the contents of the website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">8. Views Expressed Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The views and opinions expressed in the lyrics on this website are those of the original artists and songwriters and do not necessarily reflect the official policy or position of DJYoungster Lyrics.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">9. "Use at Your Own Risk" Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              All information on this website is provided "as is," with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information. Your use of this website and its content is at your own risk.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">10. Changes to This Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting on the website. It is your responsibility to review this disclaimer periodically.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">11. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about this Disclaimer or wish to report any issues, please contact us at:
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
