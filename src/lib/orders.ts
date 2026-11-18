/* Order statuses — shared by the admin (Orders) and the customer account
   (My orders), so both always show the same labels. Must match the status
   check in supabase/orders.sql. */
export type OrderStatus = "Received" | "Processing" | "Ready for pickup" | "Out for delivery" | "Delivered" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["Received", "Processing", "Ready for pickup", "Out for delivery", "Delivered", "Cancelled"];

/** Orders still in progress (need action from the team). */
export const isOpenOrder = (s: OrderStatus) => s !== "Delivered" && s !== "Cancelled";

/** What the customer sees under each status. */
export const STATUS_HELP: Record<OrderStatus, string> = {
  Received: "We've got your order and will confirm it shortly.",
  Processing: "We're preparing your order.",
  "Ready for pickup": "Your order is ready — come and collect it.",
  "Out for delivery": "Your order is on its way.",
  Delivered: "Your order has been completed.",
  Cancelled: "This order was cancelled.",
};
