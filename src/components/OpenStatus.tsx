"use client";

import { useEffect, useState } from "react";
import type { OpeningHours } from "@/lib/site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Current weekday + minutes-since-midnight in Nigeria (WAT), regardless of the viewer's timezone. */
function lagosNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
};

function hoursFor(day: string, hours: OpeningHours[]) {
  return hours.find((h) => h.schemaDays.includes(day));
}

function computeStatus(hours: OpeningHours[]) {
  const { day, minutes } = lagosNow();
  const today = hoursFor(day, hours);

  if (today?.opens && today.closes) {
    const open = toMinutes(today.opens);
    const close = toMinutes(today.closes);
    if (minutes >= open && minutes < close) {
      return { open: true, text: `Open now · closes ${fmt(today.closes)}` };
    }
    if (minutes < open) {
      return { open: false, text: `Closed · opens ${fmt(today.opens)} today` };
    }
  }

  // Find the next day that opens.
  const start = DAY_NAMES.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = DAY_NAMES[(start + i) % 7];
    const h = hoursFor(next, hours);
    if (h?.opens) {
      return { open: false, text: `Closed · opens ${fmt(h.opens)} ${i === 1 ? "tomorrow" : next}` };
    }
  }
  return { open: false, text: "Closed" };
}

/** Live open/closed badge, computed in Nigerian time and refreshed every minute. */
export default function OpenStatus({ hours }: { hours: OpeningHours[] }) {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const update = () => setStatus(computeStatus(hours));
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [hours]);

  // Reserve the space before hydration so the layout doesn't jump.
  if (!status) return <span className="inline-block h-6" aria-hidden="true" />;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        status.open ? "bg-emerald-50 text-emerald-700" : "bg-ink/[0.05] text-ink/65"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status.open ? "bg-emerald-500" : "bg-ink/35"}`} aria-hidden="true" />
      {status.text}
    </span>
  );
}
