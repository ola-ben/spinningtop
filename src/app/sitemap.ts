import type { MetadataRoute } from "next";

// Written once at build time (static site).
export const dynamic = "force-static";
import { SITE_URL } from "@/lib/site";
import { getServices } from "@/lib/catalogue";

// Add each new public page here as it is built.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
