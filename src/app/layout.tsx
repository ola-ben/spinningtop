import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
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

// The share image comes from app/opengraph-image.png (file convention).
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
  icons: { icon: "/spinning-top-logo.jpg" },
  openGraph: {
    title: SITE_NAME,
    description: "Professional care for clothes and spaces. Products and practical training.",
    url: "/",
    siteName: "Spinning Top",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Professional care for clothes and spaces. Products and practical training.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-paper antialiased">{children}</body>
    </html>
  );
}
