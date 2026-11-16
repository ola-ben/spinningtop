/* Order statuses — shared by the admin (Orders) and the customer account
   (My orders), so both always show the same labels. */
export type OrderStatus = "Processing" | "Ready for pickup" | "Delivered" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["Processing", "Ready for pickup", "Delivered", "Cancelled"];

/** Orders still in progress (need action from the team). */
export const isOpenOrder = (s: OrderStatus) => s === "Processing" || s === "Ready for pickup";
