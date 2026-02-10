/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize for production
  swcMinify: true,

  // Image optimization
  images: {
    domains: ['gpaichxrdxniigtcxkqk.supabase.co'],
  },

  // Webpack configuration for React Flow
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;
