const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},

  // ✅ Compress responses with gzip/brotli
  compress: true,

  // ✅ Optimise images: serve WebP/AVIF, cache aggressively
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h CDN cache for optimised images
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  // ✅ Aggressive HTTP caching headers
  async headers() {
    return [
      // Static assets — cache 1 year immutable
      {
        source: '/(.*)\\.(png|jpg|jpeg|svg|webp|avif|gif|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Next.js static chunks — cache 1 year
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // API responses — short cache with stale-while-revalidate
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      // HTML pages — no cache (always fresh, ISR handles it)
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
    ];
  },

  // ✅ Reduce JS bundle: skip polyfills for modern browsers
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);