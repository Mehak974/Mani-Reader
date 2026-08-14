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
    const apiHost = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.manireader.online';
    const cleaned = apiHost.endsWith('/') ? apiHost.slice(0, -1) : apiHost;
    const base = cleaned.endsWith('/api') ? cleaned.slice(0, -4) : cleaned;
    return [
      { source: '/api/:path*', destination: `${base}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
