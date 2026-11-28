import { Suspense } from "react";
import { CourseEditor } from "@/components/academy-preview/Admin";

export const metadata = { title: "Course" };

export default function Page() {
  return (
    <Suspense>
      <CourseEditor />
    </Suspense>
  );
}
