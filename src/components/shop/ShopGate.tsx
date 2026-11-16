"use client";

import type { ReactNode } from "react";
import { useLiveShopSwitch } from "@/lib/live-catalogue";

/* Follows the /admin shop on/off switch live: the page is built with the
   setting as it was at build time, then re-checks Supabase in the browser. */
export default function ShopGate({ initialOn, children, off }: { initialOn: boolean; children: ReactNode; off: ReactNode }) {
  const { showProducts } = useLiveShopSwitch(initialOn);
  return <>{showProducts ? children : off}</>;
}
