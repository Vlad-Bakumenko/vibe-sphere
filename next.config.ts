import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // UploadThing serves files from these hosts; allow next/image to optimize them.
    remotePatterns: [
      { protocol: 'https', hostname: '*.ufs.sh', pathname: '/f/**' },
      { protocol: 'https', hostname: 'utfs.io', pathname: '/f/**' },
    ],
  },
}

export default nextConfig
