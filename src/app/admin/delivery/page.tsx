import DeliveryScreen from "@/components/admin/DeliveryScreen";

export const metadata = { title: "Delivery" };

/* Delivery areas and prices for checkout, loaded live from Supabase. */
export default function DeliveryPage() {
  return <DeliveryScreen />;
}
