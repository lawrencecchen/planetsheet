/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: "/app/:path*",
        destination: "/app",
      },
    ];
  },
  redirects() {
    return [
      {
        source: "/",
        destination: "/app/db",
        permanent: true,
      },
      {
        source: "/app",
        destination: "/app/db",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
