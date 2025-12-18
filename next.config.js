/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Exclude large portfolio images from serverless function bundle
  // These will be served as static assets from the public folder
  experimental: {
    outputFileTracingExcludes: {
      // Exclude portfolio images from all API routes to avoid 250MB limit
      '/api/list-folder': [
        'public/images/portfolio/**',
      ],
      '/api/file-preview': [
        'public/images/portfolio/**',
      ],
    },
  },
}

module.exports = nextConfig


