import ComingSoon, { comingSoonMetadata } from "@/components/ComingSoon";

export const metadata = comingSoonMetadata("terms");

export default function Page() {
  return <ComingSoon page="terms" />;
}
