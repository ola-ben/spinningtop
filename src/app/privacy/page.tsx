import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Spinning Top Drycleaners & Launderers collects, uses and protects personal data.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage doc={PRIVACY} other={{ href: "/terms", label: "Terms of Service" }} />;
}
