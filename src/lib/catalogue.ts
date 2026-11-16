import { cacheTag } from "next/cache";
import { PRODUCTS as LOCAL_PRODUCTS, type Product } from "./shop-data";
import { SERVICES as LOCAL_SERVICES, type Service } from "./services-data";
import { rowToProduct, rowToService, type ProductRow, type ServiceRow } from "./catalogue-rows";
import { db, supabaseReady } from "./supabase";

/* BUILD-TIME reads of published products and services, so every page is
   built with content (and search engines see it). In the browser the pages
   then refresh from Supabase (src/lib/live-catalogue.ts), so changes made in
   /admin show without rebuilding.

   Without Supabase env vars, the built-in lists in shop-data.ts /
   services-data.ts are used. */

export const CATALOGUE_TAG = "catalogue";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOGUE_TAG);

  if (!supabaseReady()) return LOCAL_PRODUCTS;
  const { data, error } = await db().from("products").select("*").eq("status", "published").order("sort_order").order("name");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(CATALOGUE_TAG);

  if (!supabaseReady()) return LOCAL_SERVICES;
  const { data, error } = await db().from("services").select("*").eq("status", "published").order("sort_order").order("name");
  if (error) throw new Error(`Could not load services: ${error.message}`);
  return (data as ServiceRow[]).map(rowToService);
}
