"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { signOutAdmin, useAdminSession } from "@/lib/admin-auth";

/* Shows /admin only to signed-in admins; everyone else goes to /admin/login.
   (Supabase itself blocks any change from non-admins — this just keeps the
   screens out of view.) */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAdminSession();
  const isLogin = pathname.replace(/\/$/, "") === "/admin/login";

  useEffect(() => {
    if (isLogin || status === "loading" || status === "admin") return;
    if (status === "not-admin") void signOutAdmin();
    router.replace(`/admin/login/?next=${encodeURIComponent(pathname)}`);
  }, [isLogin, status, pathname, router]);

  if (isLogin || status === "admin") return <>{children}</>;
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f4f6]">
      <div aria-label="Checking sign-in" className="h-9 w-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
    </div>
  );
}
