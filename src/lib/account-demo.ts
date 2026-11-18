/* Customer account — orders, messages and vouchers.
   Empty for now so real customers see "nothing yet" instead of sample data.
   Phase 3 (orders) and Phase 6 (vouchers) replace these with Supabase data.
   Product ids refer to src/lib/shop-data.ts. */

import type { OrderStatus } from "./orders";

export type { OrderStatus };

export type DemoOrder = {
  id: string;
  date: string; // ISO date
  status: OrderStatus;
  fulfilment: string;
  items: { productId: string; qty: number }[];
};

export const DEMO_ORDERS: DemoOrder[] = [];

export type DemoMessage = { id: string; date: string; title: string; body: string; productId: string };

export const DEMO_MESSAGES: DemoMessage[] = [];

export type DemoVoucher = { code: string; title: string; detail: string; expires: string; used?: boolean };

export const DEMO_VOUCHERS: DemoVoucher[] = [];

