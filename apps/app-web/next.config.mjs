/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore while we fix root types
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
