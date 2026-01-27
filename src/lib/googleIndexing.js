import { google } from 'googleapis'

/**
 * Submit URL to Google Search Console for indexing
 * Requires Google Cloud service account with Indexing API enabled
 *
 * Setup:
 * 1. Create a Google Cloud project
 * 2. Enable "Web Search Indexing API"
 * 3. Create a service account and download JSON key
 * 4. Add service account email as owner in Search Console
 * 5. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env
 */

const getAuthClient = () => {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  if (!credentials.client_email || !credentials.private_key) {
    return null
  }

  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/indexing']
  )
}

/**
 * Submit a URL for indexing
 * @param {string} url - The full URL to index
 * @param {string} type - 'URL_UPDATED' for new/updated content, 'URL_DELETED' for removed content
 */
export async function submitUrlForIndexing(url, type = 'URL_UPDATED') {
  try {
    const auth = getAuthClient()

    if (!auth) {
      console.log('Google Indexing API not configured - skipping indexing')
      return { success: false, message: 'Google Indexing API not configured' }
    }

    const indexing = google.indexing({ version: 'v3', auth })

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type // 'URL_UPDATED' or 'URL_DELETED'
      }
    })

    console.log(`Successfully submitted ${url} for indexing`)
    return {
      success: true,
      message: 'URL submitted for indexing',
      data: response.data
    }
  } catch (error) {
    console.error('Error submitting URL for indexing:', error.message)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Submit multiple URLs for indexing
 * @param {string[]} urls - Array of URLs to index
 */
export async function submitMultipleUrlsForIndexing(urls) {
  const results = []

  // Google has rate limits, so we process sequentially with delay
  for (const url of urls) {
    const result = await submitUrlForIndexing(url)
    results.push({ url, ...result })

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Get indexing status of a URL
 * @param {string} url - The URL to check
 */
export async function getIndexingStatus(url) {
  try {
    const auth = getAuthClient()

    if (!auth) {
      return { success: false, message: 'Google Indexing API not configured' }
    }

    const indexing = google.indexing({ version: 'v3', auth })

    const response = await indexing.urlNotifications.getMetadata({
      url: url
    })

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
