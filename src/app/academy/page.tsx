import ComingSoon, { comingSoonMetadata } from "@/components/ComingSoon";

export const metadata = comingSoonMetadata("academy");

export default function Page() {
  return <ComingSoon page="academy" />;
}
