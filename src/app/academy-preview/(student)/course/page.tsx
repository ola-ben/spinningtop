import { Suspense } from "react";
import { CoursePage } from "@/components/academy-preview/Student";

export const metadata = { title: "Course" };

export default function Page() {
  return (
    <Suspense>
      <CoursePage />
    </Suspense>
  );
}
