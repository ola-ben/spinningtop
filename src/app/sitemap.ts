import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Add each new page (services, about, contact…) here as it is built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
