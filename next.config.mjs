/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Redirect www to non-www for URL canonicalization
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.djyoungster.com',
          },
        ],
        destination: 'https://djyoungster.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
