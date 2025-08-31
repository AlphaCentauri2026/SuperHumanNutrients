import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove Turbopack-specific configurations
  experimental: {
    // Disable experimental features that might cause issues
  },
  // Ensure environment variables are properly exposed
  env: {
    NEXT_PUBLIC_AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
