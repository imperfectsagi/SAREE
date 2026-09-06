import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Admin-uploaded media served from Cloudflare R2. R2 public dev URLs
      // look like https://pub-<hash>.r2.dev — a custom domain works too.
      // Update this pattern if you attach a custom domain to your bucket.
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default nextConfig;

// Enables local access to Cloudflare bindings (D1, R2) during `next dev`.
// Required by @opennextjs/cloudflare — see:
// https://opennext.js.org/cloudflare/get-started#12-develop-locally
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
