/* Customer account — DEMO DATA for previewing the account pages.
   Replace with the signed-in customer's real orders, messages and vouchers
   from the backend. Product ids refer to src/lib/shop-data.ts. */

import type { OrderStatus } from "./orders";

export type { OrderStatus };

export type DemoOrder = {
  id: string;
  date: string; // ISO date
  status: OrderStatus;
  fulfilment: string;
  items: { productId: string; qty: number }[];
};

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "ST-1042",
    date: "2026-11-08",
    status: "Ready for pickup",
    fulfilment: "Pickup — Oluyole outlet",
    items: [
      { productId: "liquid-detergent-2l", qty: 1 },
      { productId: "fabric-softener-1l", qty: 2 },
    ],
  },
  {
    id: "ST-1031",
    date: "2026-11-02",
    status: "Processing",
    fulfilment: "Delivery — Ibadan",
    items: [{ productId: "starch-spray-400ml", qty: 1 }],
  },
  {
    id: "ST-1017",
    date: "2026-10-21",
    status: "Delivered",
    fulfilment: "Delivery — Ibadan",
    items: [
      { productId: "microfibre-cloths-5", qty: 1 },
      { productId: "rubber-gloves", qty: 2 },
      { productId: "surface-disinfectant-1l", qty: 1 },
    ],
  },
  {
    id: "ST-0998",
    date: "2026-09-30",
    status: "Cancelled",
    fulfilment: "Pickup — Oluyole outlet",
    items: [{ productId: "powder-detergent-1kg", qty: 1 }],
  },
];

export type DemoMessage = { id: string; date: string; title: string; body: string; productId: string };

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "m4",
    date: "2026-11-09",
    title: "Ready for pickup",
    body: "Your order ST-1042 is ready for pickup at our Oluyole outlet. Please bring your order number when collecting.",
    productId: "liquid-detergent-2l",
  },
  {
    id: "m3",
    date: "2026-11-08",
    title: "Your order has been received!",
    body: "Thank you for shopping with Spinning Top. We have received your order ST-1042 and will let you know when it is ready.",
    productId: "liquid-detergent-2l",
  },
  {
    id: "m2",
    date: "2026-10-23",
    title: "Package delivered!",
    body: "Your order ST-1017 has been delivered. You can rate your products to let other customers know about them.",
    productId: "microfibre-cloths-5",
  },
  {
    id: "m1",
    date: "2026-10-21",
    title: "Your order has been received!",
    body: "Thank you for shopping with Spinning Top. We have received your order ST-1017.",
    productId: "microfibre-cloths-5",
  },
];

export type DemoVoucher = { code: string; title: string; detail: string; expires: string; used?: boolean };

export const DEMO_VOUCHERS: DemoVoucher[] = [
  {
    code: "WELCOME500",
    title: "₦500 off",
    detail: "Your first order of ₦5,000 or more",
    expires: "2026-12-31",
  },
  {
    code: "SPIN10",
    title: "10% off",
    detail: "Laundry products, one order",
    expires: "2026-10-31",
    used: true,
  },
];

export const STORE_CREDIT = 0;
