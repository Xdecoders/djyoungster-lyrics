import Link from 'next/link'
import { FiShield } from 'react-icons/fi'

export const metadata = {
  title: 'Privacy Policy - DJYoungster Lyrics',
  description: 'Privacy Policy for DJYoungster Lyrics. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-6">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: {currentDate}</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              At DJYoungster Lyrics ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website djyoungster.com.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">1. Information We Collect</h2>

            <h3 className="text-lg font-medium text-slate-800 dark:text-white mt-6 mb-3">Personal Information</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Subscribe to our newsletter</li>
              <li>Contact us through our contact form</li>
              <li>Submit feedback or suggestions</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This information may include your name and email address.
            </p>

            <h3 className="text-lg font-medium text-slate-800 dark:text-white mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              When you visit our website, we automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
              <li>Date and time of your visit</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Send you newsletters (if subscribed)</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">3. Cookies and Tracking Technologies</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">4. Third-Party Services</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may use third-party services that collect, monitor, and analyze data to improve our service. These third-party service providers have their own privacy policies addressing how they use such information.
            </p>

            <h3 className="text-lg font-medium text-slate-800 dark:text-white mt-6 mb-3">Google AdSense</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings.
            </p>

            <h3 className="text-lg font-medium text-slate-800 dark:text-white mt-6 mb-3">Google Analytics</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may use Google Analytics to track and analyze website traffic. Google Analytics uses cookies to collect information about how visitors use our site.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">5. Data Security</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">6. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Unsubscribe from our newsletter at any time</li>
              <li>Opt out of cookies through your browser settings</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">7. Children's Privacy</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-4">9. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
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
