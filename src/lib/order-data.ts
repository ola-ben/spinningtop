"use client";

import type { OrderStatus } from "./orders";
import { db, supabaseReady } from "./supabase";

/* Orders in Supabase (supabase/orders.sql) — used by checkout, My orders and
   the admin. Placing an order and changing status go through database
   functions, so prices come from the products table, never the browser. */

export type OrderItem = {
  productId: string | null;
  name: string;
  size: string;
  image: string | null;
  unitPrice: number;
  qty: number;
};

export type OrderEvent = { status: OrderStatus; note: string; at: string };

export type Order = {
  id: string;
  userId: string | null;
  customerName: string;
  email: string;
  phone: string;
  fulfilment: "pickup" | "delivery";
  outlet: string;
  deliveryAddress: string;
  customerNote: string;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  /** Items only. */
  subtotal: number;
  /** Delivery company ("holt"), area and fee — empty / 0 for pickup. */
  deliveryCourier: string;
  deliveryArea: string;
  deliveryFee: number;
  /** Items + delivery: what the customer pays. */
  total: number;
  channel: string;
  adminNote: string;
  createdAt: string;
  items: OrderItem[];
  history: OrderEvent[];
};

type Row = {
  id: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  fulfilment: Order["fulfilment"];
  outlet: string;
  delivery_address: string;
  customer_note: string;
  status: OrderStatus;
  payment_status: Order["paymentStatus"];
  subtotal: number;
  delivery_courier?: string;
  delivery_area?: string;
  delivery_fee?: number;
  channel: string;
  admin_note: string;
  created_at: string;
  order_items: { product_id: string | null; name: string; size: string; image_url: string | null; unit_price: number; qty: number }[];
  order_status_history: { status: OrderStatus; note: string; created_at: string }[];
};

const SELECT = "*, order_items(product_id, name, size, image_url, unit_price, qty), order_status_history(status, note, created_at)";

const toOrder = (r: Row): Order => ({
  id: r.id,
  userId: r.user_id,
  customerName: r.customer_name,
  email: r.email,
  phone: r.phone,
  fulfilment: r.fulfilment,
  outlet: r.outlet,
  deliveryAddress: r.delivery_address,
  customerNote: r.customer_note,
  status: r.status,
  paymentStatus: r.payment_status,
  subtotal: r.subtotal,
  deliveryCourier: r.delivery_courier ?? "",
  deliveryArea: r.delivery_area ?? "",
  deliveryFee: r.delivery_fee ?? 0,
  total: r.subtotal + (r.delivery_fee ?? 0),
  channel: r.channel,
  adminNote: r.admin_note,
  createdAt: r.created_at,
  items: (r.order_items ?? []).map((i) => ({
    productId: i.product_id,
    name: i.name,
    size: i.size,
    image: i.image_url,
    unitPrice: i.unit_price,
    qty: i.qty,
  })),
  history: (r.order_status_history ?? [])
    .map((h) => ({ status: h.status, note: h.note, at: h.created_at }))
    .sort((a, b) => a.at.localeCompare(b.at)),
});

const friendly = (message: string) =>
  /place_order|admin_set_order_status|cancel_my_order|does not exist/i.test(message) && /function/i.test(message)
    ? "Orders aren't set up yet — run supabase/orders.sql in Supabase."
    : message;

/** Orders the signed-in person can see: their own (customers) or all (admins), newest first. */
export async function listOrders(): Promise<Order[]> {
  if (!supabaseReady()) return [];
  const { data, error } = await db().from("orders").select(SELECT).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(friendly(error.message));
  return (data as Row[]).map(toOrder);
}

export type NewOrder = {
  items: { productId: string; qty: number }[];
  fulfilment: "pickup" | "delivery";
  outlet: string;
  deliveryAddress: string;
  /** Delivery area picked at checkout (delivery_zones id) — the fee is charged from it. */
  deliveryZoneId: string | null;
  phone: string;
  name: string;
  note: string;
};

/** Places the order. Returns { id } or { error }. */
export async function placeOrder(o: NewOrder): Promise<{ id?: string; error?: string }> {
  if (!supabaseReady()) return { error: "Ordering isn't available right now." };
  const { data, error } = await db().rpc("place_order", {
    p_items: o.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
    p_fulfilment: o.fulfilment,
    p_outlet: o.outlet,
    p_delivery_address: o.deliveryAddress,
    p_phone: o.phone,
    p_customer_name: o.name,
    p_customer_note: o.note,
    p_delivery_zone: o.fulfilment === "delivery" ? o.deliveryZoneId : null,
  });
  if (error) return { error: friendly(error.message) };
  return { id: data as string };
}

export async function cancelOrder(id: string): Promise<string | null> {
  const { error } = await db().rpc("cancel_my_order", { p_order_id: id });
  return error ? friendly(error.message) : null;
}

/* ───────────────────────── admin ───────────────────────── */

export async function setOrderStatus(id: string, status: OrderStatus, note = ""): Promise<string | null> {
  const { error } = await db().rpc("admin_set_order_status", { p_order_id: id, p_status: status, p_note: note });
  return error ? friendly(error.message) : null;
}

export async function setPaymentStatus(id: string, status: Order["paymentStatus"]): Promise<string | null> {
  const { error } = await db().rpc("admin_set_payment_status", { p_order_id: id, p_payment_status: status });
  return error ? friendly(error.message) : null;
}

export async function setAdminNote(id: string, note: string): Promise<string | null> {
  const { data, error } = await db().from("orders").update({ admin_note: note }).eq("id", id).select("id");
  if (error) return friendly(error.message);
  return data?.length ? null : "Not allowed — sign in again with an admin account.";
}

export const orderCount = (o: Order) => o.items.reduce((n, i) => n + i.qty, 0);

export const formatOrderDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
