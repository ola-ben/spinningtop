import { Suspense } from "react";
import { Learn } from "@/components/academy-preview/Student";

export const metadata = { title: "Lesson" };

export default function Page() {
  return (
    <Suspense>
      <Learn />
    </Suspense>
  );
}
