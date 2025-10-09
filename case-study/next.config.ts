import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: '.',
  },
  eslint: {
    // Disable ESLint during builds due to flat config compatibility issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
