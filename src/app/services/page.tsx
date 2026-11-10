import ComingSoon, { comingSoonMetadata } from "@/components/ComingSoon";

export const metadata = comingSoonMetadata("services");

export default function Page() {
  return <ComingSoon page="services" />;
}
