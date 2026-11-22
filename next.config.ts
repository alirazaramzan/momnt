import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Avatar uploads go through a server action. The avatars bucket allows
      // 5 MB; the extra room covers multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
