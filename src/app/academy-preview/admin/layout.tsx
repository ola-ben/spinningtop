import type { ReactNode } from "react";
import { PreviewBar } from "@/components/academy-preview/Student";
import { AdminFrame } from "@/components/academy-preview/Admin";

export default function AdminPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PreviewBar admin />
      <AdminFrame>{children}</AdminFrame>
    </>
  );
}
