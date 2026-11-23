"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { routeAccess, useAdminSession } from "@/lib/admin-auth";
import { btn } from "./ui";

/* Shows /admin only to signed-in team members; everyone else goes to /admin/login.
   Pages a worker's role doesn't include show a short "no access" note.
   (Supabase itself blocks any change the role doesn't allow — this just keeps
   the screens out of view.) */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAdminSession();
  const isLogin = pathname.replace(/\/$/, "") === "/admin/login";

  useEffect(() => {
    if (isLogin || status === "loading" || status === "admin") return;
    // A signed-in customer (not on the team) stays signed in to their account.
    router.replace(`/admin/login/?next=${encodeURIComponent(pathname)}`);
  }, [isLogin, status, pathname, router]);

  if (isLogin || status === "admin") return <>{children}</>;
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f4f6]">
      <div aria-label="Checking sign-in" className="h-9 w-9 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
    </div>
  );
}

/** Inside the admin layout: shows the page, or a note when the role doesn't include it. */
export function PageGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { can, role } = useAdminSession();
  const need = routeAccess(pathname);
  if (need && !can(need)) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl bg-paper p-8 text-center shadow-sm">
        <p className="font-display text-xl font-semibold">No access to this page</p>
        <p className="mt-2 text-sm text-ink/60">Your role{role ? ` (${role})` : ""} doesn&apos;t include this page. Ask the owner if you need it.</p>
        <Link href="/admin" className={`${btn.primary} mt-6 inline-flex`}>
          Go to dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
