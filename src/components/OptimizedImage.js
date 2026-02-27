'use client'

import Image from 'next/image'

function localImageLoader({ src, width }) {
  // Map requested width to nearest pre-generated size suffix
  const basePath = src.replace(/\.(webp|jpg|jpeg|png|gif)$/, '')
  if (width <= 96) return `${basePath}-thumb.webp`
  if (width <= 320) return `${basePath}-sm.webp`
  if (width <= 640) return `${basePath}-md.webp`
  return `${basePath}.webp`
}

export default function OptimizedImage({ src, priority, loading, ...props }) {
  const isLocalUpload = typeof src === 'string' && src.startsWith('/uploads/')
  // Be explicit about lazy loading so browsers and auditing tools see it.
  // When priority is set Next.js preloads eagerly — don't set loading in that case.
  const loadingProp = priority ? undefined : (loading ?? 'lazy')

  if (isLocalUpload) {
    return <Image src={src} loader={localImageLoader} priority={priority} loading={loadingProp} {...props} />
  }

  return <Image src={src} priority={priority} loading={loadingProp} {...props} />
}
