/**
 * Convert a string to Title Case (capitalize first letter of each word).
 * Returns the original value if not a string.
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\b\w/g, c => c.toUpperCase())
}
