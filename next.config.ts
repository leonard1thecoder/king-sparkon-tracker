import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "veizbtzugssszhxabzrv.supabase.co",
        pathname: "/storage/v1/object/public/king-sparkon-logo/**",
      },
      {
        protocol: "https",
        hostname: "veizbtzugssszhxabzrv.supabase.co",
        pathname: "/storage/v1/object/public/smartbuyglasses/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
