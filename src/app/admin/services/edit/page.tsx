import { Suspense } from "react";
import { EditServiceScreen } from "@/components/admin/CatalogueScreens";

export const metadata = { title: "Edit service" };

/* /admin/services/edit/?id=<service id> — the id is read in the browser. */
export default function EditServicePage() {
  return (
    <Suspense fallback={null}>
      <EditServiceScreen />
    </Suspense>
  );
}
