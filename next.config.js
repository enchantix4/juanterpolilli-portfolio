/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Ensure large static assets in public folder are not bundled into serverless functions
  // Files in public/ are automatically served statically by Next.js
  output: 'standalone',
}

module.exports = nextConfig


