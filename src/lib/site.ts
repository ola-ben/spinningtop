/** Live link hub (Brand Book p.15). The proposed spinningtop.ng site is not live yet. */
export const LINK_HUB = "https://linktr.ee/spinningtoplaundry";

/* ---- WhatsApp / phone ------------------------------------------------- */
export const WHATSAPP_NUMBER = "2348038302674"; // international format, no "+"
export const PHONE_DISPLAY = "+234 803 830 2674";
export const PHONE_E164 = "+2348038302674";

/** wa.me link, optionally with a pre-filled message. */
export const whatsappLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

/** Pre-filled WhatsApp messages for each enquiry type. */
export const WA_MESSAGES = {
  quote: "Hello Spinning Top, I'd like to request a quote.",
  availability: "Hello Spinning Top, I'd like to ask about availability for a service.",
  shop: "Hello Spinning Top, I'd like to ask about your laundry and hygiene products.",
  academy: "Hello Spinning Top, I'd like to enquire about the next Training Academy intake.",
  corporate: "Hello Spinning Top, I'd like to request a corporate quote for my organisation.",
} as const;

/** "Request a quote" and enquiry buttons go to the Linktree hub. */
export const QUOTE_LINK = LINK_HUB;

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

/* ---- Google rating ------------------------------------------------------
   From the business's Google listing (Nov 2026). Update when it changes.
   Not added to structured data: Google ignores self-served review markup. */
export const GOOGLE_RATING = {
  value: 4.8,
  count: 10,
  url: "https://maps.app.goo.gl/HoREpb6YWA4UdTtt8",
};

/* ---- Social profiles (also used as schema.org `sameAs`) ---------------- */
export type SocialId = "instagram" | "tiktok" | "facebook" | "x" | "linkedin" | "youtube";

export const SOCIALS: { id: SocialId; label: string; href: string }[] = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/spinningtoplaundry" },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@spinningtoplaundry" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/spinningtoplaundry" },
  { id: "x", label: "X (Twitter)", href: "https://x.com/stl_laundry" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/spinning-top-drycleaners-launderers/" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@spinningtoplaundry" },
];

/* ---- Branches ----------------------------------------------------------
   Source: business Google listing (Nov 2026). Hours are only shown where
   confirmed — the Dominion University outlet's hours are not yet known. */
export type OpeningHours = {
  /** Display label, e.g. "Monday – Friday". */
  days: string;
  /** Display time, e.g. "8:00 AM – 6:00 PM", or "Closed". */
  time: string;
  /** schema.org day names covered by this row. */
  schemaDays: string[];
  opens?: string; // "08:00"
  closes?: string; // "18:00"
};

export type Branch = {
  id: string;
  name: string;
  addressLines: string[];
  /** Street address for search engines (schema.org streetAddress). */
  street: string;
  locality: string;
  region: string;
  postalCode?: string;
  mapUrl: string;
  hours?: OpeningHours[];
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const BRANCHES: Branch[] = [
  {
    id: "oluyole",
    name: "Oluyole, Ibadan",
    addressLines: [
      "Estate, House of VKY, Extension",
      "Opposite Valencia School Junction, beside TAP Studio",
      "Oluyole, Ibadan 223222, Oyo",
    ],
    street: "Estate, House of VKY, Extension, opposite Valencia School Junction, beside TAP Studio, Oluyole",
    locality: "Ibadan",
    region: "Oyo",
    postalCode: "223222",
    mapUrl: "https://maps.app.goo.gl/HoREpb6YWA4UdTtt8",
    hours: [
      { days: "Monday – Friday", time: "8:00 AM – 6:00 PM", schemaDays: WEEKDAYS, opens: "08:00", closes: "18:00" },
      { days: "Saturday", time: "8:00 AM – 3:00 PM", schemaDays: ["Saturday"], opens: "08:00", closes: "15:00" },
      { days: "Sunday", time: "Closed", schemaDays: ["Sunday"] },
    ],
  },
  {
    id: "dominion",
    name: "Dominion University",
    addressLines: ["Dominion University", "Ibadan, Oyo State"],
    street: "Dominion University",
    locality: "Ibadan",
    region: "Oyo",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Dominion+University+Ibadan",
  },
];

export const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#services", label: "Services" },
  { href: "#shop", label: "Shop" },
  { href: "#academy", label: "Academy" },
  { href: "#corporate", label: "Corporate" },
  { href: "#visit", label: "Visit us" },
];
