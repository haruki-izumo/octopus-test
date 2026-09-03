import type { NextConfig } from 'next'

const apiUrl = process.env.API_URL ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
    // Lets the browser call the backend without it needing to allow other origins.
    async rewrites() {
        return [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }]
    },
}

export default nextConfig
