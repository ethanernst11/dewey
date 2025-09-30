import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    tsconfigPaths: true,
  },
  transpilePackages: ['@dewey/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
