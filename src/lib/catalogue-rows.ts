import type { ServiceIconName } from "@/components/ServiceIcon";
import type { Product } from "./shop-data";
import type { Service } from "./services-data";

/* Supabase row shapes (tables in supabase/schema.sql) and how they map to the
   Product / Service types the site already uses. Safe to import anywhere
   (build time or browser). */

/** Placeholder id for the /shop/_live/ and /services/_live/ pages, which show
    items added in /admin after the site was built. */
export const LIVE_ID = "_live";

export type ItemStatus = "draft" | "published";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  size: string;
  description: string;
  usage: string;
  caution: string | null;
  price: number;
  compare_at_price: number | null;
  in_stock: boolean;
  status: ItemStatus;
  image_url: string | null;
  image_credit: string | null;
  image_position: string | null;
  sort_order: number;
};

export type ServiceRow = {
  id: string;
  icon: string;
  name: string;
  category: Service["category"];
  summary: string;
  includes: string[];
  note: string;
  status: ItemStatus;
  image_url: string | null;
  image_credit: string | null;
  image_position: string | null;
  sort_order: number;
};

export type AdminProduct = Product & { status: ItemStatus; compareAtPrice: number | null; sortOrder: number };
export type AdminService = Service & { status: ItemStatus; sortOrder: number };

export const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  category: r.category,
  size: r.size,
  description: r.description,
  usage: r.usage,
  ...(r.caution ? { caution: r.caution } : {}),
  price: r.price,
  inStock: r.in_stock,
  ...(r.image_url
    ? { image: { src: r.image_url, credit: r.image_credit ?? "", ...(r.image_position ? { position: r.image_position } : {}) } }
    : {}),
});

export const rowToService = (r: ServiceRow): Service => ({
  id: r.id,
  icon: r.icon as ServiceIconName,
  name: r.name,
  category: r.category,
  summary: r.summary,
  includes: r.includes ?? [],
  note: r.note,
  image: {
    src: r.image_url ?? "",
    credit: r.image_credit ?? "",
    ...(r.image_position ? { position: r.image_position } : {}),
  },
});

export const rowToAdminProduct = (r: ProductRow): AdminProduct => ({
  ...rowToProduct(r),
  status: r.status,
  compareAtPrice: r.compare_at_price,
  sortOrder: r.sort_order,
});

export const rowToAdminService = (r: ServiceRow): AdminService => ({
  ...rowToService(r),
  status: r.status,
  sortOrder: r.sort_order,
});
