import type { NextConfig } from "next";

const getFastApiBaseUrl = (): string => {
  const internal = process.env.FAST_API_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/+$/, "");
  const configured = process.env.NEXT_PUBLIC_FAST_API?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "http://127.0.0.1:8000";
};

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7c765f3726084c52bcd5d180d51f1255.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "present-for-me.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "yefhrkuqbjcblofdcpnr.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async rewrites() {
    const fastApiUrl = getFastApiBaseUrl();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${fastApiUrl}/api/v1/:path*`,
      },
      {
        source: "/api/v2/:path*",
        destination: `${fastApiUrl}/api/v2/:path*`,
      },
      {
        source: "/app_data/:path*",
        destination: `${fastApiUrl}/app_data/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${fastApiUrl}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
