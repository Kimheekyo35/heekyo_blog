import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 네이버 프로필 사진이 올라오는 곳
    remotePatterns: [{ protocol: 'https', hostname: '**.pstatic.net' }],
  },
}

export default nextConfig
