/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["192.168.1.27", "flagcdn.com"], // Add flagcdn.com for HTTPS
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.51",
        port: "6006",
        pathname: "/storage/**",
      }

    ],
  },
  async rewrites() {
    // In production, localhost is the Vercel runtime, not your backend.
    // Configure NEXT_PUBLIC_API_BASE_URL (e.g. https://<backend>.up.railway.app)
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
