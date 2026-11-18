"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminBookings } from "@/lib/admin-bookings";
import { useAdminOrders } from "@/lib/admin-orders";
import BookingsBoard from "./BookingsBoard";
import OrdersBoard from "./OrdersBoard";

/* Orders page: switch between product orders (shop) and service bookings.
   ?view=bookings opens the bookings tab directly. */
export default function OrdersTabs() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = params.get("view") === "bookings" ? "bookings" : "products";
  const { toConfirm } = useAdminOrders();
  const { newCount } = useAdminBookings();

  const tabs = [
    { key: "products", label: "Product orders", hint: "From the shop", badge: toConfirm },
    { key: "bookings", label: "Service bookings", hint: "From the booking form", badge: newCount },
  ] as const;

  return (
    <>
      <div className="inline-flex w-full gap-1 rounded-2xl border border-ink/10 bg-paper p-1 sm:w-auto" role="tablist" aria-label="Order type">
        {tabs.map((t) => {
          const active = view === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => router.replace(t.key === "bookings" ? `${pathname}?view=bookings` : pathname, { scroll: false })}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                active ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-paper/20" : "bg-brand text-paper"}`}>{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {view === "bookings" ? <BookingsBoard /> : <OrdersBoard />}
    </>
  );
}
