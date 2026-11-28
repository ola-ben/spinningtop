import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PreviewBar } from "@/components/academy-preview/Student";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PreviewBar />
      <SiteHeader />
      <main className="min-h-[60vh] text-ink">{children}</main>
      <SiteFooter />
    </>
  );
}
