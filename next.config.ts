import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 상위 폴더(OneDrive)의 package-lock.json을 프로젝트 루트로 오인하지 않도록 고정합니다.
  turbopack: { root: __dirname },
  images: {
    // 네이버 프로필 사진이 올라오는 곳
    remotePatterns: [{ protocol: 'https', hostname: '**.pstatic.net' }],
  },
}

export default nextConfig
