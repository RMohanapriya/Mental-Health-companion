/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for React apps
  output: 'standalone', // Add this line
  experimental: {
    appDir: false, // Explicitly disable App Router if not using it
  },
  // You can add other configurations here if needed
};

export default nextConfig;