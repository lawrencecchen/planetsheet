/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: '/app/:path*',
        destination: '/app',
      },
    ];
  },
}

module.exports = nextConfig
