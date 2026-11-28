import { Suspense } from "react";
import { Overview } from "@/components/academy-preview/Admin";

export const metadata = { title: "Admin" };

export default function Page() {
  return (
    <Suspense>
      <Overview />
    </Suspense>
  );
}
