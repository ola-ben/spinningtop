import { Suspense } from "react";
import { Students } from "@/components/academy-preview/Admin";

export const metadata = { title: "Students" };

export default function Page() {
  return (
    <Suspense>
      <Students />
    </Suspense>
  );
}
