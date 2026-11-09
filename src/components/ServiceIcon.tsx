/** Restrained line icons for each care service (Brand Book p.11: "restrained line icons"). */
export type ServiceIconName = "laundry" | "cleaning" | "tailor" | "shoe" | "upholstery" | "pest";

const PATHS: Record<ServiceIconName, React.ReactNode> = {
  // Washing machine
  laundry: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 7h16" />
      <circle cx="12" cy="14" r="4" />
      <path d="M7 5h.01M10 5h.01" />
    </>
  ),
  // Hanger
  cleaning: (
    <>
      <path d="M12 7a2 2 0 1 1 2-2c0 1.1-.9 1.5-2 2.3V9" />
      <path d="M12 9 3.5 15.3A1 1 0 0 0 4.1 17h15.8a1 1 0 0 0 .6-1.7L12 9z" />
    </>
  ),
  // Scissors
  tailor: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </>
  ),
  // Shoe
  shoe: (
    <>
      <path d="M3 17V8a1 1 0 0 1 1-1h3l1.5 3 3.5 1.5 6 1.5a3 3 0 0 1 3 3V17H3z" />
      <path d="M3 17v2h18v-2M10 10.5l1-2M13 11.7l1-2" />
    </>
  ),
  // Sofa
  upholstery: (
    <>
      <path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
      <path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z" />
      <path d="M6 18v2M18 18v2" />
    </>
  ),
  // Shield with check
  pest: (
    <>
      <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

export default function ServiceIcon({ name, className = "h-4 w-4" }: { name: ServiceIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
