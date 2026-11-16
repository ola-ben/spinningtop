import type { NextConfig } from "next";

/* The site is a STATIC export: plain HTML/CSS/JS for cPanel public_html
   (no Node.js on the host). `npm run package:static` builds and zips it.

   Products, services, the shop switch and the admin talk to Supabase from
   the visitor's browser (see src/lib/supabase.ts). Pages are also built with
   the catalogue as it is at build time, so they load with content. */

const nextConfig: NextConfig = {
  output: "export",
  // Writes services/index.html etc. so Apache serves /services/ directly.
  trailingSlash: true,
  // No server to resize images — photos are served as-is (admin uploads are
  // shrunk in the browser before upload).
  images: { unoptimized: true },
  // "use cache" is used for build-time reads of Supabase.
  experimental: { useCache: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
