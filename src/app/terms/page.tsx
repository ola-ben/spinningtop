import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to orders, bookings, purchases and training with Spinning Top Drycleaners & Launderers.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage doc={TERMS} other={{ href: "/privacy", label: "Privacy Policy" }} />;
}
