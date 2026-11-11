import OrdersBoard from "@/components/admin/OrdersBoard";
import { PageHeader, btn } from "@/components/admin/ui";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Cart requests from the shop (sent on WhatsApp), walk-ins and phone orders."
        actions={
          <>
            <button type="button" className={btn.secondary}>
              Export
            </button>
            <button type="button" className={btn.primary}>
              + Record order
            </button>
          </>
        }
      />
      <OrdersBoard />
    </div>
  );
}
