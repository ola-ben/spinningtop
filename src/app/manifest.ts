import type { MetadataRoute } from "next";

// Written once at build time (static site).
export const dynamic = "force-static";

/* Web app manifest: lets the site be added to a phone's home screen.
   On iPhone/iPad this is required before admin notifications can work
   (open the admin, Share → Add to Home Screen, then enable notifications).
   No start_url on purpose: the icon opens the page it was added from. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spinning Top Drycleaners & Launderers",
    short_name: "Spinning Top",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0000fe",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
