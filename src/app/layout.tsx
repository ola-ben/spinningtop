import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import HashlessLinks from "@/components/HashlessLinks";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Share preview image: public/og-image.jpg (small JPG at a clean URL for WhatsApp).
const OG_ALT = "Spinning Top Drycleaners & Launderers — Better care. Easier living. Brighter futures.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Better care. Easier living. Brighter futures.`,
    template: "%s | Spinning Top",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Spinning Top",
  keywords: [
    "Spinning Top",
    "dry cleaning Nigeria",
    "laundry service",
    "wet cleaning",
    "tailor repairs and alterations",
    "shoe repair",
    "upholstery and rug cleaning",
    "pest control",
    "laundry and hygiene products",
    "laundry training academy",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: "Professional care for clothes and spaces. Products and practical training.",
    url: "/",
    siteName: "Spinning Top",
    locale: "en_NG",
    type: "website",
    // Small JPG at a clean URL (no ?hash) — WhatsApp skips large or query-string preview images.
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Professional care for clothes and spaces. Products and practical training.",
    images: [{ url: "/og-image.jpg", alt: OG_ALT }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: keep smooth scrolling for in-page section links, but
    // open every new page at the top instantly (no scroll-up animation).
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-paper antialiased">
        {children}
        <HashlessLinks />
      </body>
    </html>
  );
}
