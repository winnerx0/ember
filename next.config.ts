const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        port: '',
        protocol: 'https',
        pathname: '/a/**'
      },
    ],
  },
};

export default nextConfig