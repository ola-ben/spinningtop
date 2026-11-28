import { Suspense } from "react";
import { StudentDetail } from "@/components/academy-preview/Admin";

export const metadata = { title: "Student" };

export default function Page() {
  return (
    <Suspense>
      <StudentDetail />
    </Suspense>
  );
}
