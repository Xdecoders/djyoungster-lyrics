'use client'

import Image from 'next/image'

/**
 * Wrapper around Next.js Image that handles local uploads.
 * Local uploads (paths starting with /uploads/) are served unoptimized
 * because Next.js production server only optimizes images that existed
 * before the server started. Runtime-uploaded images need unoptimized mode.
 */
export default function OptimizedImage({ src, ...props }) {
  const isLocalUpload = typeof src === 'string' && src.startsWith('/uploads/')

  return <Image src={src} unoptimized={isLocalUpload} {...props} />
}
