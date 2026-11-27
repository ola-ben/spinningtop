"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/lib/admin-auth";
import { useAdminBookings } from "@/lib/admin-bookings";
import { useAdminOrders } from "@/lib/admin-orders";
import { disablePush, enablePush, getPushState, playChime, type PushState } from "@/lib/admin-push";
import Busy from "@/components/Busy";
import { AdminIcon } from "./AdminIcons";
import { toast } from "./Toast";
import { btn } from "./ui";

/* Top-bar bell: turn push notifications on/off for this device, plus a chime
   and toast when a new booking or paid order arrives while the admin is open. */

const HELP: Record<PushState, string> = {
  on: "This device gets a notification for every new booking and paid order, even when the website is closed.",
  off: "Get a notification on this device for every new booking and paid order, even when the website is closed.",
  blocked:
    "Notifications are blocked for this site. Allow them in your browser: tap the lock/settings icon next to the address, then Notifications → Allow.",
  "ios-home-screen":
    "On iPhone or iPad: tap Share → Add to Home Screen, open the admin from that new icon, then turn notifications on here.",
  unsupported: "This browser can't show notifications. Use Chrome on Android, or Chrome/Edge/Safari on a computer.",
};

export default function NotificationBell({ className }: { className: string }) {
  const { can } = useAdminSession();
  const allowed = can("orders.view");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void getPushState().then((s) => {
      if (active) setState(s);
    });
    return () => {
      active = false;
    };
  }, []);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function toggle() {
    setBusy(true);
    const err = state === "on" ? await disablePush() : await enablePush();
    const next = await getPushState();
    setState(next);
    setBusy(false);
    if (err) toast(err, false);
    else toast(next === "on" ? "Notifications are on for this device." : "Notifications turned off for this device.");
  }

  return (
    <div ref={boxRef} className="relative">
      <button type="button" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`${className} relative`}>
        <AdminIcon name="bell" className="h-5 w-5" />
        {allowed && state === "off" && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-paper" aria-hidden="true" />}
      </button>
      {allowed && <NewArrivals />}

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl bg-paper p-5 shadow-xl ring-1 ring-ink/10">
          <p className="flex items-center justify-between gap-3 text-sm font-semibold">
            Notifications
            {state === "on" && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">On</span>}
          </p>
          {!allowed ? (
            <p className="mt-2 text-xs leading-relaxed text-ink/60">Your role doesn&apos;t include orders and bookings, so there&apos;s nothing to notify you about.</p>
          ) : state === null ? (
            <p className="mt-2 text-xs text-ink/55">
              <Busy text="Checking this device" />
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">{HELP[state]}</p>
              {(state === "on" || state === "off") && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggle()}
                  className={`${state === "on" ? btn.secondary : btn.primary} mt-4 w-full disabled:opacity-60`}
                >
                  {busy ? <Busy text={state === "on" ? "Turning off" : "Turning on"} /> : state === "on" ? "Turn off on this device" : "Enable notifications"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Chime + toast when a new booking or paid order shows up while the admin is open. */
function NewArrivals() {
  const { orders, loading: ordersLoading } = useAdminOrders();
  const { bookings, loading: bookingsLoading } = useAdminBookings();
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (ordersLoading || bookingsLoading) return;
    const current = [
      ...orders.filter((o) => o.status === "Received" && (o.paymentMethod !== "paystack" || o.paymentStatus === "paid")).map((o) => o.id),
      ...bookings.filter((b) => b.status === "New").map((b) => b.id),
    ];
    if (known.current === null) {
      known.current = new Set(current); // first load: nothing is "new"
      return;
    }
    const fresh = current.filter((id) => !known.current!.has(id));
    fresh.forEach((id) => known.current!.add(id));
    if (!fresh.length) return;
    playChime();
    toast(fresh.length === 1 ? `New ${fresh[0].startsWith("BK-") ? "booking" : "paid order"} ${fresh[0]} just came in.` : `${fresh.length} new bookings/orders just came in.`);
  }, [orders, bookings, ordersLoading, bookingsLoading]);

  return null;
}
