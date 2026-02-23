/**
 * Renders <link rel="prev"> and <link rel="next"> tags for paginated pages.
 * React 19 (Next.js 15) automatically hoists <link> tags to <head>.
 *
 * @param {string} basePath - The base path without query string (e.g. "/songs" or "/category/hindi")
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {object} [searchParams={}] - Current search params (sort, genre, etc.) to preserve in URLs
 */
export default function PaginationHead({ basePath, currentPage, totalPages, searchParams = {} }) {
  if (totalPages <= 1) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://djyoungster.com'

  const buildUrl = (page) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) params.set(key, String(value))
    })
    if (page > 1) params.set('page', String(page))
    const queryString = params.toString()
    return queryString ? `${siteUrl}${basePath}?${queryString}` : `${siteUrl}${basePath}`
  }

  return (
    <>
      {currentPage > 1 && <link rel="prev" href={buildUrl(currentPage - 1)} />}
      {currentPage < totalPages && <link rel="next" href={buildUrl(currentPage + 1)} />}
    </>
  )
}
