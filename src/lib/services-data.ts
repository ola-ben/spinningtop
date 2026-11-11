import type { ServiceIconName } from "@/components/ServiceIcon";

/* Care services catalogue for /services and /services/[id].
   Wording follows Brand Book pp.6–7 (customer promise, what to show,
   service notes). No fixed prices: every job is inspected and quoted first.
   Photos are temporary Unsplash images until real ones are supplied. */

export type Service = {
  id: ServiceIconName;
  name: string;
  category: "Garment care" | "Home care";
  summary: string;
  includes: string[];
  /** Service boundary / limitation, shown as "Good to know". */
  note: string;
  image: { src: string; credit: string; position?: string };
};

export const SERVICES: Service[] = [
  {
    id: "laundry",
    name: "Laundry",
    category: "Garment care",
    summary: "Everyday and household washable items, cleaned and neatly finished.",
    includes: ["Sorting", "Washing", "Finishing & ironing", "Folding & packaging"],
    note: "Wash-and-fold and wash-and-iron options are quoted according to availability.",
    image: { src: "/images/photos/folded-laundry.jpg", credit: "Dan LeFebvre" },
  },
  {
    id: "cleaning",
    name: "Wet & Dry Cleaning",
    category: "Garment care",
    summary: "Professional care for suitable garments, textiles and delicate items.",
    includes: ["Label & fabric assessment", "Wet or dry cleaning programme", "Careful finishing", "Final quality check"],
    note: "Not every fabric or stain suits every process — we explain any limitations before work begins.",
    image: { src: "/images/photos/garments-rail.jpg", credit: "Parker Burchfield" },
  },
  {
    id: "tailor",
    name: "Tailor Repairs & Alterations",
    category: "Garment care",
    summary: "Repairs and fit adjustments that give your favourite items more life.",
    includes: ["Hemming", "Fit adjustments", "Repairs", "Button & zip replacement"],
    note: "We confirm the item's condition, measurements, scope and completion date before work.",
    image: { src: "/images/photos/tailor-at-work.jpg", credit: "Ali Mkumbwa" },
  },
  {
    id: "shoe",
    name: "Shoe Repair / Cobbler",
    category: "Garment care",
    summary: "Care, selected repairs and restoration for appropriate footwear.",
    includes: ["Cleaning", "Sole repairs", "Stitching", "Restoration"],
    note: "Availability depends on the material and condition of each pair; you'll get an agreed quote first.",
    image: { src: "/images/services/shoe-repair.jpg", credit: "Zheng Yijun" },
  },
  {
    id: "upholstery",
    name: "Upholstery & Rug Cleaning",
    category: "Home care",
    summary: "Cleaning for selected sofas, chairs, rugs and other suitable furnishings.",
    includes: ["Inspection & fabric identification", "Suitability test", "Cleaning", "Drying checks"],
    note: "We test suitability first and don't promise every stain will come out.",
    image: { src: "/images/services/upholstery.jpg", credit: "Giorgio Trovato" },
  },
  {
    id: "pest",
    name: "Pest Control",
    category: "Home care",
    summary: "Assessment-led pest management for homes and commercial premises.",
    includes: ["Site inspection", "Preparation advice", "Treatment", "Follow-up visit"],
    note: "Carried out by qualified personnel following safety procedures. Results vary by site — we don't guarantee eradication.",
    image: { src: "/images/services/pest-control.jpg", credit: "MESTO Sprayers" },
  },
];

export const SERVICE_SUGGESTIONS = ["Laundry", "Dry cleaning", "Alterations", "Shoe repair", "Rug cleaning", "Pest control"];

/** Shown in place of a price — Brand Book: inspect first, confirm price. */
export const SERVICE_PRICE_LABEL = "Price after inspection";

export const matchServices = (services: Service[], q: string) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return services;
  return services.filter((s) =>
    [s.name, s.category, s.summary, ...s.includes].some((f) => f.toLowerCase().includes(needle)),
  );
};

export const quoteMessage = (s: Service) => `Hello Spinning Top, I'd like a quote for ${s.name}.`;
