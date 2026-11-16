import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/* Admin sign-in uses Supabase Auth (src/lib/admin-auth.ts). AdminGuard sends
   signed-out visitors to /admin/login; Supabase's Row Level Security blocks
   any change from non-admin accounts. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
