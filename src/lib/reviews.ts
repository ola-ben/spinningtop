"use client";

import { db, supabaseReady } from "./supabase";

/* Product reviews (supabase/reviews.sql).
   Customers rate products from delivered orders → "Pending" → the team publishes
   them on Admin → Reviews → they show on the product page. */

export type ReviewStatus = "Pending" | "Published" | "Hidden";
export const REVIEW_STATUSES: ReviewStatus[] = ["Pending", "Published", "Hidden"];

export type Review = {
  id: number;
  orderId: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export type PublicReview = { id: number; rating: number; title: string; body: string; reviewer: string; createdAt: string };

type Row = {
  id: number;
  order_id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  created_at: string;
};

const toReview = (r: Row): Review => ({
  id: r.id,
  orderId: r.order_id,
  productId: r.product_id,
  customerName: r.customer_name,
  rating: r.rating,
  title: r.title,
  body: r.body,
  status: r.status,
  createdAt: r.created_at,
});

const friendly = (m: string) =>
  /product_reviews|submit_review/.test(m) && /does not exist|schema cache|could not find/i.test(m)
    ? "Reviews aren't set up yet — run supabase/reviews.sql in Supabase."
    : m;

/** Key for "this product on this order". */
export const reviewKey = (orderId: string, productId: string) => `${orderId}|${productId}`;

/** The signed-in customer's own reviews, as reviewKey()s. */
export async function myReviewedKeys(): Promise<Set<string>> {
  if (!supabaseReady()) return new Set();
  const { data: auth } = await db().auth.getUser();
  if (!auth.user) return new Set();
  const { data, error } = await db().from("product_reviews").select("order_id, product_id").eq("user_id", auth.user.id);
  if (error) throw new Error(friendly(error.message));
  return new Set((data as { order_id: string; product_id: string }[]).map((r) => reviewKey(r.order_id, r.product_id)));
}

/** Returns an error message, or null when saved. */
export async function submitReview(r: { orderId: string; productId: string; rating: number; title: string; body: string }): Promise<string | null> {
  if (!supabaseReady()) return "Reviews aren't available right now.";
  const { error } = await db().rpc("submit_review", {
    p_order_id: r.orderId,
    p_product_id: r.productId,
    p_rating: r.rating,
    p_title: r.title,
    p_body: r.body,
  });
  return error ? friendly(error.message) : null;
}

/** Published reviews for a product page (anyone). */
export async function publicReviews(productId: string): Promise<PublicReview[]> {
  if (!supabaseReady()) return [];
  const { data, error } = await db().rpc("product_reviews_public", { p_product_id: productId });
  if (error) return [];
  return (data as { id: number; rating: number; title: string; body: string; reviewer: string; created_at: string }[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    reviewer: r.reviewer,
    createdAt: r.created_at,
  }));
}

/* ───────────────────────── admin ───────────────────────── */

export async function listReviews(): Promise<Review[]> {
  if (!supabaseReady()) return [];
  const { data, error } = await db().from("product_reviews").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error(friendly(error.message));
  return (data as Row[]).map(toReview);
}

export async function setReviewStatus(id: number, status: ReviewStatus): Promise<string | null> {
  const { data, error } = await db().from("product_reviews").update({ status }).eq("id", id).select("id");
  if (error) return friendly(error.message);
  return data?.length ? null : "Not allowed — your role can't manage reviews.";
}

export async function deleteReview(id: number): Promise<string | null> {
  const { data, error } = await db().from("product_reviews").delete().eq("id", id).select("id");
  if (error) return friendly(error.message);
  return data?.length ? null : "Not allowed — your role can't manage reviews.";
}
