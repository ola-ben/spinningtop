import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminToaster } from "@/components/admin/Toast";

/* Academy PROTOTYPE — hidden link for the client to review.
   Not linked anywhere, not in the sitemap, and kept out of search engines. */
export const metadata: Metadata = {
  title: { default: "Academy (preview)", template: "%s · Academy preview" },
  robots: { index: false, follow: false },
};

export default function AcademyPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminToaster />
      {children}
    </>
  );
}
