import CustomersScreen from "@/components/admin/CustomersScreen";

export const metadata = { title: "Customers" };

/* Website customers, loaded live from Supabase in the browser. */
export default function CustomersPage() {
  return <CustomersScreen />;
}
