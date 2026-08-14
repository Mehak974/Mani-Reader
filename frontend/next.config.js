/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img-r1.2xstorage.com' },
      { protocol: 'https', hostname: 'img-r2.2xstorage.com' },
      { protocol: 'https', hostname: 'storage.waitst.com' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
