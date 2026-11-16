"use client";

import {
  rowToAdminProduct,
  rowToAdminService,
  type AdminProduct,
  type AdminService,
  type ProductRow,
  type ServiceRow,
} from "./catalogue-rows";
import { resetLiveCatalogue } from "./live-catalogue";
import { IMAGE_BUCKET, db } from "./supabase";

/* Admin reads and writes, straight from the browser with the signed-in
   admin's Supabase session. Row Level Security (supabase/admin-access.sql)
   only allows these for accounts in the admins table. */

const friendly = (message: string) =>
  /row-level security|permission denied|JWT|not authorized/i.test(message)
    ? "Not allowed — sign in again with an admin account."
    : message;

const fail = (what: string, message: string) => new Error(`${what}: ${friendly(message)}`);

/* ───────────────────────── reads ───────────────────────── */

export async function listProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db().from("products").select("*").order("sort_order").order("name");
  if (error) throw fail("Could not load products", error.message);
  return (data as ProductRow[]).map(rowToAdminProduct);
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw fail("Could not load product", error.message);
  return data ? rowToAdminProduct(data as ProductRow) : null;
}

export async function listServices(): Promise<AdminService[]> {
  const { data, error } = await db().from("services").select("*").order("sort_order").order("name");
  if (error) throw fail("Could not load services", error.message);
  return (data as ServiceRow[]).map(rowToAdminService);
}

export async function getService(id: string): Promise<AdminService | null> {
  const { data, error } = await db().from("services").select("*").eq("id", id).maybeSingle();
  if (error) throw fail("Could not load service", error.message);
  return data ? rowToAdminService(data as ServiceRow) : null;
}

/* ───────────────────────── helpers ───────────────────────── */

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

/** "Liquid Detergent 2 litres" → "liquid-detergent-2-litres" */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Shrinks big phone photos (max 1600px, WebP) so pages load fast. */
async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    // Keep the original if the browser can't make WebP or it came out bigger.
    return blob && blob.type === "image/webp" && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Uploads the form's "image" file (if any) and returns its public URL. */
async function uploadImage(formData: FormData, folder: "products" | "services", id: string) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Photo must be a JPG, PNG or WebP image.");

  const blob = await compressImage(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("Photo is larger than 5 MB — please use a smaller one.");
  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";

  const path = `${folder}/${id}-${Date.now()}.${ext}`;
  const storage = db().storage.from(IMAGE_BUCKET);
  const { error } = await storage.upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw fail("Photo upload failed", error.message);
  return storage.getPublicUrl(path).data.publicUrl;
}

/** Deletes an old photo from the bucket (only ones uploaded here, not /images/… files). */
async function removeStoredImage(url: string | null | undefined) {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  if (!url || !url.includes(marker)) return;
  await db().storage.from(IMAGE_BUCKET).remove([decodeURIComponent(url.split(marker)[1])]);
}

const duplicate = (code: string | undefined, noun: string) =>
  code === "23505" ? `Another ${noun} already uses this web address. Change the name or the web address.` : null;

async function nextSortOrder(table: "products" | "services") {
  const { data } = await db().from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
}

/* ───────────────────────── products ───────────────────────── */

/** Saves the product form. Returns an error message, or null on success. */
export async function saveProduct(formData: FormData, existing?: AdminProduct): Promise<string | null> {
  const name = text(formData, "name");
  const size = text(formData, "size");
  const category = text(formData, "category");
  const price = Number(text(formData, "price"));
  const compareRaw = text(formData, "compareAtPrice");
  const compareAtPrice = compareRaw === "" ? null : Number(compareRaw);
  if (!name) return "Enter the product name.";
  if (!category) return "Enter a category.";
  if (!Number.isInteger(price) || price < 0) return "Enter the price in naira (whole number).";
  if (compareAtPrice !== null && (!Number.isInteger(compareAtPrice) || compareAtPrice < 0))
    return "Compare-at price must be a whole number.";

  const id = existing?.id ?? slugify(text(formData, "slug") || `${name} ${size}`);
  if (!id) return "Enter a web address using letters or numbers.";

  try {
    const uploaded = await uploadImage(formData, "products", id);
    const removeImage = formData.get("removeImage") === "on";
    const row = {
      name,
      category,
      size,
      description: text(formData, "description"),
      usage: text(formData, "usage"),
      caution: text(formData, "caution") || null,
      price,
      compare_at_price: compareAtPrice,
      in_stock: formData.get("inStock") === "on",
      status: formData.get("intent") === "draft" ? "draft" : "published",
      image_credit: text(formData, "imageCredit") || null,
      ...(uploaded ? { image_url: uploaded } : removeImage ? { image_url: null } : {}),
    };

    if (existing) {
      const { data, error } = await db().from("products").update(row).eq("id", existing.id).select("id");
      if (error) return `Could not save: ${friendly(error.message)}`;
      if (!data?.length) return "Not allowed — sign in again with an admin account.";
      if (uploaded || removeImage) await removeStoredImage(existing.image?.src);
    } else {
      const { error } = await db().from("products").insert({ id, ...row, sort_order: await nextSortOrder("products") });
      if (error) {
        if (uploaded) await removeStoredImage(uploaded);
        return duplicate(error.code, "product") ?? `Could not save: ${friendly(error.message)}`;
      }
    }
  } catch (err) {
    return err instanceof Error ? err.message : "Could not save the product.";
  }
  resetLiveCatalogue();
  return null;
}

export async function setProductStock(id: string, inStock: boolean) {
  const { data, error } = await db().from("products").update({ in_stock: inStock }).eq("id", id).select("id");
  if (error) throw fail("Could not update stock", error.message);
  if (!data?.length) throw new Error("Not allowed — sign in again with an admin account.");
  resetLiveCatalogue();
}

export async function deleteProduct(product: AdminProduct) {
  const { data, error } = await db().from("products").delete().eq("id", product.id).select("id");
  if (error) throw fail("Could not delete", error.message);
  if (!data?.length) throw new Error("Not allowed — sign in again with an admin account.");
  await removeStoredImage(product.image?.src);
  resetLiveCatalogue();
}

/* ───────────────────────── services ───────────────────────── */

/** Saves the service form. Returns an error message, or null on success. */
export async function saveService(formData: FormData, existing?: AdminService): Promise<string | null> {
  const name = text(formData, "name");
  const category = text(formData, "category");
  if (!name) return "Enter the service name.";
  if (category !== "Garment care" && category !== "Home care") return "Choose a category.";

  const id = existing?.id ?? slugify(text(formData, "slug") || name);
  if (!id) return "Enter a web address using letters or numbers.";

  try {
    const uploaded = await uploadImage(formData, "services", id);
    const removeImage = formData.get("removeImage") === "on";
    const row = {
      name,
      category,
      icon: text(formData, "icon") || "laundry",
      summary: text(formData, "summary"),
      includes: text(formData, "includes")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      note: text(formData, "note"),
      status: formData.get("intent") === "draft" ? "draft" : "published",
      image_credit: text(formData, "imageCredit") || null,
      ...(uploaded ? { image_url: uploaded } : removeImage ? { image_url: null } : {}),
    };

    if (existing) {
      const { data, error } = await db().from("services").update(row).eq("id", existing.id).select("id");
      if (error) return `Could not save: ${friendly(error.message)}`;
      if (!data?.length) return "Not allowed — sign in again with an admin account.";
      if (uploaded || removeImage) await removeStoredImage(existing.image.src);
    } else {
      const { error } = await db().from("services").insert({ id, ...row, sort_order: await nextSortOrder("services") });
      if (error) {
        if (uploaded) await removeStoredImage(uploaded);
        return duplicate(error.code, "service") ?? `Could not save: ${friendly(error.message)}`;
      }
    }
  } catch (err) {
    return err instanceof Error ? err.message : "Could not save the service.";
  }
  resetLiveCatalogue();
  return null;
}

export async function setServiceVisible(id: string, visible: boolean) {
  const { data, error } = await db()
    .from("services")
    .update({ status: visible ? "published" : "draft" })
    .eq("id", id)
    .select("id");
  if (error) throw fail("Could not update the service", error.message);
  if (!data?.length) throw new Error("Not allowed — sign in again with an admin account.");
  resetLiveCatalogue();
}

export async function deleteService(service: AdminService) {
  const { data, error } = await db().from("services").delete().eq("id", service.id).select("id");
  if (error) throw fail("Could not delete", error.message);
  if (!data?.length) throw new Error("Not allowed — sign in again with an admin account.");
  await removeStoredImage(service.image.src);
  resetLiveCatalogue();
}

/* ───────────────────────── shop switch ───────────────────────── */

export async function getShopSwitch(): Promise<boolean> {
  const { data, error } = await db().from("site_settings").select("value").eq("key", "shop").maybeSingle();
  if (error) throw fail("Could not load the shop setting", error.message);
  return !!(data?.value as { showProducts?: boolean } | undefined)?.showProducts;
}

export async function setShopSwitch(showProducts: boolean) {
  const { error } = await db().from("site_settings").upsert({ key: "shop", value: { showProducts } });
  if (error) throw fail("Could not save the setting", error.message);
  resetLiveCatalogue();
}
