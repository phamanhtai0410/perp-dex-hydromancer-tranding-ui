/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Empty turbopack config to silence warning
  env: {
    NEXT_PUBLIC_HYDROMANCER_API_URL: process.env.NEXT_PUBLIC_HYDROMANCER_API_URL || 'https://api.hydromancer.xyz',
    NEXT_PUBLIC_HYDROMANCER_WS_URL: process.env.NEXT_PUBLIC_HYDROMANCER_WS_URL || 'wss://ws.hydromancer.xyz',
  },
}

module.exports = nextConfig
