"use client";

import Link from "next/link";
import { clearBooking, toggleBookingService, useBookingSelection } from "@/lib/booking-store";

/** Select / unselect a service for the booking request. */
export function BookingToggle({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const selected = useBookingSelection().includes(id);
  const sm = size === "sm";
  return (
    <button
      type="button"
      onClick={() => toggleBookingService(id)}
      aria-pressed={selected}
      className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 transition-colors ${
        sm ? "py-1.5 text-xs font-semibold" : "py-3 text-sm font-bold"
      } ${
        selected
          ? "border-brand bg-brand text-paper hover:border-brand-deep hover:bg-brand-deep"
          : "border-brand text-brand hover:bg-tint"
      }`}
    >
      {selected ? (
        <>
          <svg viewBox="0 0 20 20" fill="currentColor" className={sm ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
          </svg>
          {sm ? "Selected" : "Added to booking"}
        </>
      ) : sm ? (
        <>
          <span className="text-sm leading-none" aria-hidden="true">+</span>
          Select
        </>
      ) : (
        "Add to booking"
      )}
    </button>
  );
}

/** Bottom bar shown once at least one service is selected. */
export function BookingBar({ aboveMobileBar = false }: { aboveMobileBar?: boolean }) {
  const count = useBookingSelection().length;
  if (count === 0) return null;
  return (
    <div
      className={`fixed inset-x-0 z-40 px-3 sm:bottom-5 ${aboveMobileBar ? "bottom-[80px]" : "bottom-3"}`}
      role="region"
      aria-label="Booking selection"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-paper shadow-xl shadow-ink/25">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {count} {count === 1 ? "service" : "services"} selected
        </p>
        <button
          type="button"
          onClick={clearBooking}
          className="cursor-pointer text-xs font-semibold text-paper/60 transition-colors hover:text-paper"
        >
          Clear
        </button>
        <Link
          href="/book/"
          className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-brand-deep"
        >
          Book now →
        </Link>
      </div>
    </div>
  );
}
