import type { Metadata } from "next";
import LoginView from "@/components/account/LoginView";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Focused: no menu, footer or floating buttons — just signing in. */}
      <LoginView />
    </div>
  );
}
