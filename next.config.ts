import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // Ensure environment variables are properly exposed
  env: {
    NEXT_PUBLIC_AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
    scrollRestoration: true, // Better scroll restoration
  },

  // Bundle analyzer (only in production builds)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
      });
      return withBundleAnalyzer(config);
    },
  }),
};

export default nextConfig;
