import type { Metadata } from "next";
import LoginView from "@/components/account/LoginView";
import SiteFooter from "@/components/SiteFooter";
import FloatingActions from "@/components/FloatingActions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <LoginView />
      <SiteFooter />
      <FloatingActions quoteBar={false} />
    </div>
  );
}
