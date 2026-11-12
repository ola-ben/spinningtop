import type { NextConfig } from "next";

/* STATIC_EXPORT=1 builds plain HTML files for hosting without Node.js
   (cPanel public_html). Set only by `npm run package:static`; normal
   builds (dev, Node.js, Vercel) are unaffected. */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStatic
    ? {
        output: "export",
        // Writes services/index.html etc. so Apache serves /services/ directly.
        trailingSlash: true,
        // No server to resize images — photos are served as-is.
        images: { unoptimized: true },
        // The admin is hidden during this build, but the dev server's generated
        // route types still reference it. Normal builds keep full type checking.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
  // Cache Components / Partial Prefetching need a server, so they're off for the
  // static export; "use cache" (used by the shop settings) stays available.
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  ...(isStatic ? { experimental: { useCache: true } } : {}),
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
