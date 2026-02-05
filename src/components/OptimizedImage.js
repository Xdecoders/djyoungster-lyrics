'use client'

import Image from 'next/image'

function localImageLoader({ src, width }) {
  // Map requested width to nearest pre-generated size suffix
  const basePath = src.replace(/\.webp$/, '')
  if (width <= 96) return `${basePath}-thumb.webp`
  if (width <= 320) return `${basePath}-sm.webp`
  if (width <= 640) return `${basePath}-md.webp`
  return `${basePath}.webp`
}

export default function OptimizedImage({ src, ...props }) {
  const isLocalUpload = typeof src === 'string' && src.startsWith('/uploads/')

  if (isLocalUpload) {
    return <Image src={src} loader={localImageLoader} {...props} />
  }

  return <Image src={src} {...props} />
}
