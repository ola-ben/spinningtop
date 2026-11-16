import type { Metadata } from "next";
import type { ReactNode } from "react";
import AccountShell from "@/components/account/AccountShell";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";
import { PRODUCTS } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <AccountShell products={PRODUCTS}>{children}</AccountShell>
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
