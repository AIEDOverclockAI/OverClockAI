import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Match requests to /api/* in the frontend
        destination: "http://localhost:8000/api/:path*", // Proxy to backend
      },
    ];
  },
  /* other config options can go here */
};

export default nextConfig;
