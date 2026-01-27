import { google } from 'googleapis'

/**
 * Submit URL to Google Search Console for indexing
 * Requires Google Cloud service account with Indexing API enabled
 *
 * Setup:
 * 1. Create a Google Cloud project
 * 2. Enable "Web Search Indexing API" (also called "Indexing API")
 * 3. Create a service account and download JSON key
 * 4. Add service account email as owner in Search Console
 * 5. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env
 *
 * IMPORTANT: For GOOGLE_PRIVATE_KEY in .env:
 * - Copy the entire private_key value from the JSON file including -----BEGIN/END-----
 * - Keep the \n characters as-is (don't convert to actual newlines in .env)
 * - Wrap in double quotes in .env file
 */

const getAuthClient = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKey) {
    console.log('[GoogleIndexing] Missing credentials - GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY not set')
    return null
  }

  // Handle different ways the private key might be stored
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }

  console.log('[GoogleIndexing] Auth client email:', clientEmail)
  console.log('[GoogleIndexing] Private key starts with:', privateKey.substring(0, 30))

  try {
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/indexing']
    )

    // Authorize to verify credentials work
    await auth.authorize()
    console.log('[GoogleIndexing] Auth successful')

    return auth
  } catch (error) {
    console.error('[GoogleIndexing] Auth failed:', error.message)
    return null
  }
}

/**
 * Submit a URL for indexing
 * @param {string} url - The full URL to index
 * @param {string} type - 'URL_UPDATED' for new/updated content, 'URL_DELETED' for removed content
 */
export async function submitUrlForIndexing(url, type = 'URL_UPDATED') {
  try {
    const auth = await getAuthClient()

    if (!auth) {
      console.log('[GoogleIndexing] API not configured - skipping indexing for:', url)
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
    const auth = await getAuthClient()

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
