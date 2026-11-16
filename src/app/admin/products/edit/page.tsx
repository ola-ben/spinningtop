import { Suspense } from "react";
import { EditProductScreen } from "@/components/admin/CatalogueScreens";

export const metadata = { title: "Edit product" };

/* /admin/products/edit/?id=<product id> — the id is read in the browser. */
export default function EditProductPage() {
  return (
    <Suspense fallback={null}>
      <EditProductScreen />
    </Suspense>
  );
}
