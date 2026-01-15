import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Vercel-specific optimizations
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // API route timeout (10s for Vercel Hobby, 60s for Pro)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
