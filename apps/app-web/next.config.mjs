/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add cache busting to force new chunks
  generateBuildId: async () => {
    return Date.now().toString();
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sgp1.digitaloceanspaces.com',
        port: '',
        pathname: '/grab/**',
      },
      {
        protocol: 'https',
        hostname: 'grab.sgp1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Ignore ESLint during production builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during production builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Webpack configuration to handle crypto module
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve crypto module on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
