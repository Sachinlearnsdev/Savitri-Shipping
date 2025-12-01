/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable image optimization for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.app.github.dev', // Codespaces
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // For production images
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Savitri Shipping',
    NEXT_PUBLIC_COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+91 98765 43210',
    NEXT_PUBLIC_COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@savitrishipping.in',
  },
  
  // Webpack configuration (if needed)
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;