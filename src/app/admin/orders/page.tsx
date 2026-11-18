import { Suspense } from "react";
import OrdersTabs from "@/components/admin/OrdersTabs";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Product orders from the shop and service bookings from the booking form, newest first."
      />
      <Suspense fallback={null}>
        <OrdersTabs />
      </Suspense>
    </div>
  );
}
