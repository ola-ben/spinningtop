"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import ServiceIcon from "@/components/ServiceIcon";
import ShopChrome from "@/components/shop/ShopChrome";
import {
  LOGISTICS_OPTIONS,
  MAX_BOOKING_PHOTOS,
  MAX_PHOTO_BYTES,
  createBooking,
  type Logistics,
} from "@/lib/booking-data";
import { clearBooking, toggleBookingService, useBookingSelection } from "@/lib/booking-store";
import { useLiveProducts, useLiveServices } from "@/lib/live-catalogue";
import type { Product } from "@/lib/shop-data";
import type { Service } from "@/lib/services-data";
import { useHydrated, useUser } from "@/lib/user-store";
import { BRANCHES } from "@/lib/site";
import { serviceScope } from "./ServiceCard";
import Busy from "@/components/Busy";

const NOTES_MAX = 2000;

/* Nigerian mobile numbers only: 0803 123 4567, +234 803 123 4567 or 2348031234567
   (spaces and dashes allowed). Same rule as create_booking() in supabase/bookings.sql. */
const PHONE_PATTERN = String.raw`[\s\-]*(\+?234|0)[\s\-]*[789][01]([\s\-]*[0-9]){8}[\s\-]*`;
const PHONE_HELP = "Enter a valid Nigerian phone number, e.g. 0803 123 4567 or +234 803 123 4567.";
const isNigerianPhone = (v: string) => /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/[\s-]/g, ""));

type Photo = { file: File; url: string };

/* /book — booking request form for one or more services. No sign-in needed;
   signed-in customers get their details filled in. Saved by create_booking()
   in supabase/bookings.sql. */
export default function BookingView({ services: initialServices, products: initialProducts }: { services: Service[]; products: Product[] }) {
  const { services } = useLiveServices(initialServices);
  const { products } = useLiveProducts(initialProducts);
  const [query, setQuery] = useState("");
  const selected = useBookingSelection();
  const user = useUser();
  const ready = useHydrated();

  const [logistics, setLogistics] = useState<Logistics | "">("");
  const [outlet, setOutlet] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [doneId, setDoneId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Free the preview URLs when leaving the page.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const picked = services.filter((s) => selected.includes(s.id));

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const next = [...photos];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_BOOKING_PHOTOS) {
        setError(`You can upload up to ${MAX_BOOKING_PHOTOS} photos.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        setError("Photos only, please (JPG, PNG, WEBP or HEIC).");
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`"${file.name}" is over 10 MB.`);
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file) });
    }
    setPhotos(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(photos[i].url);
    setPhotos(photos.filter((_, j) => j !== i));
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    addPhotos(e.dataTransfer.files);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (k: string) => String(d.get(k) ?? "").trim();
    const fullName = get("name");
    const phone = get("phone");
    const email = get("email");
    const area = get("area");

    if (fullName.length < 2) return setError("Enter your full name.");
    if (!isNigerianPhone(phone)) return setError(PHONE_HELP);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Enter a valid email address.");
    if (area.length < 2) return setError("Enter your location or area.");
    if (picked.length === 0) return setError("Choose at least one service.");
    if (!logistics) return setError("Choose a pickup or drop-off option.");
    if (logistics === "drop_off" && !outlet) return setError("Choose the outlet you will drop off at.");

    setError("");
    setPending(true);
    const res = await createBooking({
      fullName,
      phone,
      email,
      area,
      services: picked.map((s) => s.id),
      logistics,
      outlet,
      notes: notes.trim(),
      photos: photos.map((p) => p.file),
    });
    setPending(false);
    if (res.error || !res.id) return setError(res.error ?? "Could not send your request. Please try again.");
    clearBooking();
    setDoneId(res.id);
    window.scrollTo({ top: 0 });
  }

  let body;
  if (doneId) {
    body = (
      <Card>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <CheckIcon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-center font-display text-xl font-semibold">Booking request sent</p>
        <p className="mt-2 text-center text-sm text-ink/60">
          Your booking number is{" "}
          <span className="rounded-full bg-tint px-2.5 py-0.5 font-mono font-bold text-brand">{doneId}</span>
        </p>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-relaxed text-ink/60">
          We&rsquo;ll contact you shortly by phone or WhatsApp to confirm the details and give you a quote. A copy has been sent to your email.
        </p>
        <Link
          href="/services/"
          className="mt-6 flex w-full justify-center rounded-full bg-brand py-3.5 text-sm font-bold text-paper shadow-md shadow-brand/20 transition-colors hover:bg-brand-deep"
        >
          Back to services
        </Link>
      </Card>
    );
  } else if (!ready) {
    body = <div className="h-[50vh]" aria-busy="true" />;
  } else {
    body = (
      <form key={user?.id ?? "guest"} onSubmit={onSubmit} className="flex flex-col gap-4">
        <Card>
          <h2 className="font-display text-lg font-semibold">Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" icon={<UserIcon />}>
              <input name="name" required minLength={2} autoComplete="name" defaultValue={user?.name ?? ""} placeholder="Your full name" className={inputCls} />
            </Field>
            <Field label="Phone number" hint="WhatsApp number preferably" icon={<PhoneIcon />}>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                required
                pattern={PHONE_PATTERN}
                title={PHONE_HELP}
                maxLength={18}
                autoComplete="tel"
                defaultValue={user?.phone ?? ""}
                placeholder="Your contact number"
                className={inputCls}
              />
            </Field>
            <Field label="Email" icon={<MailIcon />}>
              <input name="email" type="email" required autoComplete="email" defaultValue={user?.email ?? ""} placeholder="Your email address" className={inputCls} />
            </Field>
            <Field label="Location / Address (Area)" icon={<PinIcon />}>
              <input name="area" required minLength={2} autoComplete="street-address" defaultValue={user?.address ?? ""} placeholder="e.g. Oluyole, Ibadan" className={inputCls} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">
            Which services do you need? <span className="text-red-600">*</span>
          </h2>
          <p className="mt-0.5 text-sm text-ink/55">Select all that apply</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {services.map((s) => {
              const on = selected.includes(s.id);
              return (
                <li key={s.id}>
                  <label className={`${optionCls} ${on ? optionOn : optionOff}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleBookingService(s.id)} className="h-4 w-4 accent-brand" />
                    <ServiceIcon name={s.icon} className="h-4 w-4 shrink-0 text-ink" />
                    {s.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">
            Delivery or pickup <span className="text-red-600">*</span>
          </h2>
          <p className="mt-0.5 text-sm text-ink/55">Do you prefer pickup &amp; delivery, or will you drop off?</p>
          <div className="mt-4 grid gap-2">
            {LOGISTICS_OPTIONS.map((o) => {
              const on = logistics === o.value;
              return (
                <div key={o.value} className="grid gap-2">
                  <label className={`${optionCls} ${on ? optionOn : optionOff}`}>
                    <input type="radio" name="logistics" required checked={on} onChange={() => setLogistics(o.value)} className="h-4 w-4 accent-brand" />
                    <span className="text-ink">{LOGISTICS_ICONS[o.value]}</span>
                    {o.label}
                  </label>
                  {/* Drop-off: which outlet */}
                  {o.value === "drop_off" && on && (
                    <fieldset className="ml-7 grid gap-2">
                      <legend className="mb-2 text-sm font-medium">
                        Which outlet? <span className="text-red-600">*</span>
                      </legend>
                      {BRANCHES.map((b) => {
                        const picked = outlet === b.name;
                        return (
                          <label key={b.id} className={`${optionCls} ${picked ? optionOn : optionOff}`}>
                            <input
                              type="radio"
                              name="outlet"
                              required
                              checked={picked}
                              onChange={() => setOutlet(b.name)}
                              className="h-4 w-4 accent-brand"
                            />
                            <span>
                              <span className="block">{b.name}</span>
                              {b.addressLines.length > 2 && <span className="block text-xs font-normal text-ink/55">{b.addressLines[1]}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Photos of your items</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink/55">
            A photo of the item(s) — e.g. laundry bags, furniture for cleaning — helps us plan the right vehicle and give a better quote. Up to {MAX_BOOKING_PHOTOS} images, 10 MB each.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div key={p.url} className="relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-ink/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-ink/75 text-xs font-bold text-paper transition-colors hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_BOOKING_PHOTOS && (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed text-center text-xs font-semibold transition-colors ${
                  dragging ? "border-brand bg-tint text-brand" : "border-ink/20 text-ink/55 hover:border-brand hover:bg-tint/60 hover:text-brand"
                }`}
              >
                <span className="flex flex-col items-center gap-1">
                  <CameraIcon />
                  Add photo
                </span>
                <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
              </label>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Additional notes or questions</h2>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
            className={`${inputCls} mt-3 resize-y !pl-3.5`}
            placeholder="Any special requests, questions, or comments?"
          />
        </Card>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand py-4 text-sm font-bold text-paper shadow-md shadow-brand/20 transition-all hover:-translate-y-px hover:bg-brand-deep hover:shadow-lg disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? <Busy text={photos.length ? "Uploading photos and sending" : "Sending your request"} /> : "Submit booking request"}
        </button>
        <p className="text-center text-xs text-ink/50">No payment now. We&rsquo;ll inspect and confirm a price before any work begins.</p>
      </form>
    );
  }

  return (
    <ShopChrome products={products} query={query} onQuery={setQuery} scope={serviceScope(services)}>
      <main className="min-h-[70vh] bg-ink/[0.03]">
        <section className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-ink/55">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/services/" className="text-ink transition-colors hover:text-brand">
                  Services
                </Link>
              </li>
              <li aria-hidden="true">&gt;</li>
              <li aria-current="page">Book</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Book a service</h1>
          <p className="mt-1 text-sm text-ink/60">Tell us what you need and we&rsquo;ll get back to you with a quote.</p>
          <div className="mt-5">{body}</div>
        </section>
      </main>
    </ShopChrome>
  );
}

const optionCls = "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-all";
const optionOn = "border-brand bg-tint font-semibold text-ink shadow-sm shadow-brand/10";
const optionOff = "border-ink/15 hover:border-ink/30 hover:bg-ink/[0.02]";

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-ink/10 bg-paper p-5 shadow-sm shadow-ink/[0.03] sm:p-6">{children}</div>;
}

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/15";

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} <span className="text-red-600">*</span>
      </span>
      {hint && <span className="block text-xs text-ink/50">{hint}</span>}
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        {children}
      </span>
    </label>
  );
}

/* ── icons ── */
const svg = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}
const UserIcon = () => (
  <svg {...svg} className="h-[18px] w-[18px]">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...svg} className="h-[18px] w-[18px]">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const MailIcon = () => (
  <svg {...svg} className="h-[18px] w-[18px]">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
const PinIcon = () => (
  <svg {...svg} className="h-[18px] w-[18px]">
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const CameraIcon = () => (
  <svg {...svg} className="h-6 w-6">
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);
const LOGISTICS_ICONS: Record<Logistics, ReactNode> = {
  pickup_delivery: (
    <svg {...svg} className="h-5 w-5">
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  ),
  drop_off: (
    <svg {...svg} className="h-5 w-5">
      <path d="M4 10 5.5 4h13L20 10M4 10v10h16V10M4 10h16M9 20v-6h6v6" />
    </svg>
  ),
  either: (
    <svg {...svg} className="h-5 w-5">
      <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
    </svg>
  ),
};
