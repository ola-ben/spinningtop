/** Live link hub (Brand Book p.15). The proposed spinningtop.ng site is not live yet. */
export const LINK_HUB = "https://linktr.ee/spinningtoplaundry";

/**
 * Canonical site URL, used for social previews, sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL once the domain is live (e.g. https://spinningtop.ng).
 * On Vercel it falls back to the production deployment URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Spinning Top Drycleaners & Launderers";
export const SITE_DESCRIPTION =
  "Laundry, wet & dry cleaning, tailor repairs, shoe repair, upholstery & rug cleaning, pest control, hygiene products and practical training — from one trusted brand.";

export const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#shop", label: "Shop" },
  { href: "#academy", label: "Academy" },
  { href: "#corporate", label: "Corporate" },
];
