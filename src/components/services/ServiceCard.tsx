"use client";

import Link from "next/link";
import ImageSlot from "@/components/ImageSlot";
import { BookingToggle } from "./BookingControls";
import type { SearchScope } from "@/components/shop/ShopSearch";
import { SERVICE_PRICE_LABEL, SERVICE_SUGGESTIONS, type Service } from "@/lib/services-data";

/** Header search scope for the services pages. */
export const serviceScope = (services: Service[]): SearchScope => ({
  basePath: "/services",
  noun: "services",
  placeholder: "Search services",
  suggestions: SERVICE_SUGGESTIONS,
  items: services.map((s) => ({
    id: s.id,
    name: s.name,
    meta: s.category,
    price: "Quote",
    haystack: [s.name, s.category, s.summary, ...s.includes].join(" ").toLowerCase(),
  })),
});

/** Grid card: photo, name, category, price note, select for booking. */
export default function ServiceCard({ service: s }: { service: Service }) {
  return (
    <div className="flex h-full flex-col bg-paper transition-shadow hover:shadow-lg hover:shadow-ink/10">
      <Link href={`/services/${s.id}`} className="group flex flex-1 flex-col">
        <ImageSlot
          image={{ src: s.image.src, alt: s.name, shot: s.name }}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 33vw, 50vw"
          objectPosition={s.image.position}
          zoomOnHover
        />
        <div className="flex flex-1 flex-col px-3 pt-3 sm:px-4">
          <h2 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink group-hover:text-brand sm:text-sm">{s.name}</h2>
          <p className="mt-0.5 text-xs text-ink/50">{s.category}</p>
          <p className="mt-auto pt-2 text-xs font-semibold text-ink/70 sm:text-sm">{SERVICE_PRICE_LABEL}</p>
        </div>
      </Link>
      <div className="p-3 pt-2 sm:p-4 sm:pt-3">
        <BookingToggle id={s.id} size="sm" />
      </div>
    </div>
  );
}

/** Small tile for the "Other services" row. */
export function ServiceMini({ service: s }: { service: Service }) {
  return (
    <Link href={`/services/${s.id}`} className="group block">
      <ImageSlot
        image={{ src: s.image.src, alt: s.name, shot: s.name }}
        aspect="aspect-square"
        sizes="(min-width: 640px) 25vw, 50vw"
        objectPosition={s.image.position}
        zoomOnHover
      />
      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug group-hover:text-brand sm:text-sm">{s.name}</p>
      <p className="mt-1 text-xs text-ink/50">{s.category}</p>
    </Link>
  );
}
