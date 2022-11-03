/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
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
        permanent: false,
      },
      {
        source: "/app",
        destination: "/app/db",
        permanent: false,
      },
    ];
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "x-frame-options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
