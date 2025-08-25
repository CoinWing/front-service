/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 환경별 웹소켓 URL 설정
    WS_URL: process.env.WS_URL || 'wss://api.upbit.com/websocket/v1',
    UPBIT_API_URL: process.env.UPBIT_API_URL || 'https://api.upbit.com/v1',
  },
  compiler: {
    // 프로덕션 빌드에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 