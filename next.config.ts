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
    ],
  },
};

export default nextConfig;
