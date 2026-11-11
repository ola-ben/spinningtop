/* ─────────────────────────────────────────────────────────────────────────
   ADMIN DATA — empty until the backend is connected, so every figure in
   the admin starts at zero. Replace each export with a real data call
   (API / database) when integrating; the shapes below are the contract
   the admin screens expect.
   ───────────────────────────────────────────────────────────────────────── */

import type { ServiceIconName } from "@/components/ServiceIcon";

/* ---- Orders (cart requests sent on WhatsApp) -------------------------- */
export type OrderStatus = "New" | "Confirmed" | "Ready" | "Collected" | "Cancelled";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  status: OrderStatus;
  channel: "WhatsApp" | "Walk-in" | "Phone";
  branch: string;
  createdAt: string; // ISO
};

export const ORDER_STATUSES: OrderStatus[] = ["New", "Confirmed", "Ready", "Collected", "Cancelled"];

export const ORDERS: Order[] = [];

export const orderTotal = (o: Order) => o.items.reduce((sum, i) => sum + i.qty * i.price, 0);

/* ---- Customers ---------------------------------------------------------- */
export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orders: number;
  spent: number;
  type: "Individual" | "Business";
};

export const CUSTOMERS: Customer[] = [];

/* ---- Services ------------------------------------------------------------ */
export type AdminService = {
  id: string;
  name: string;
  icon: ServiceIconName;
  fromPrice: number | null; // null = quote only
  available: boolean;
  visible: boolean;
};

export const SERVICES: AdminService[] = [
  { id: "laundry", name: "Laundry", icon: "laundry", fromPrice: null, available: true, visible: true },
  { id: "cleaning", name: "Wet & Dry Cleaning", icon: "cleaning", fromPrice: null, available: true, visible: true },
  { id: "tailor", name: "Tailor Repairs & Alterations", icon: "tailor", fromPrice: null, available: true, visible: true },
  { id: "shoe", name: "Shoe Repair / Cobbler", icon: "shoe", fromPrice: null, available: true, visible: true },
  { id: "upholstery", name: "Upholstery & Rug Cleaning", icon: "upholstery", fromPrice: null, available: true, visible: true },
  { id: "pest", name: "Pest Control", icon: "pest", fromPrice: null, available: false, visible: true },
];

/* ---- Academy ------------------------------------------------------------- */
export type Course = {
  id: string;
  title: string;
  duration: string;
  fee: number;
  nextIntake: string;
  seats: number;
  enrolled: number;
  status: "Open" | "Full" | "Draft";
};

export const COURSES: Course[] = [];

/* ---- Team ------------------------------------------------------------------- */
export type Role = "Owner" | "Manager" | "Staff";
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch: string;
  status: "Active" | "Invited";
};

export const ROLES: { role: Role; summary: string }[] = [
  { role: "Owner", summary: "Full access, including settings, team and billing." },
  { role: "Manager", summary: "Products, orders, customers and content." },
  { role: "Staff", summary: "View and update orders for their outlet." },
];

export const TEAM: TeamMember[] = [
  { id: "u1", name: "Business Owner", email: "owner@example.com", role: "Owner", branch: "All outlets", status: "Active" },
  { id: "u2", name: "Outlet Manager", email: "manager@example.com", role: "Manager", branch: "Oluyole, Ibadan", status: "Active" },
  { id: "u3", name: "Front Desk", email: "frontdesk@example.com", role: "Staff", branch: "Dominion University", status: "Invited" },
];

/* ---- Helpers ------------------------------------------------------------------ */
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(
    new Date(iso),
  );

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(iso));
