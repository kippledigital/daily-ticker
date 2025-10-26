/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dailyticker.co',
      },
      {
        protocol: 'https',
        hostname: 'polygon.io',
      },
      {
        protocol: 'https',
        hostname: '*.polygon.io',
      },
    ],
  },
};

export default nextConfig;
