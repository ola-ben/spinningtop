import { Suspense } from "react";
import { Certificate } from "@/components/academy-preview/Student";

export const metadata = { title: "Certificate" };

export default function Page() {
  return (
    <Suspense>
      <Certificate />
    </Suspense>
  );
}
