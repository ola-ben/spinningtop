/* Line icons used by the shop header, drawers and cards. */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MenuIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
);

export const CloseIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SearchIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
  </svg>
);

export const UserIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.12a7.5 7.5 0 0 1 15 0A17.93 17.93 0 0 1 12 21.75c-2.68 0-5.22-.58-7.5-1.63z" />
  </svg>
);

export const HelpIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M9.88 7.52c1.17-1.03 3.07-1.03 4.24 0 1.17 1.02 1.17 2.68 0 3.71-.2.18-.43.33-.67.44-.74.36-1.45.99-1.45 1.83v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 5.25h.01v.01H12v-.01z" />
  </svg>
);

export const CartIcon = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M2.25 3h1.39c.51 0 .95.34 1.09.83l.38 1.44m0 0L6.96 12.8a1.5 1.5 0 0 0 1.45 1.12h8.27a1.5 1.5 0 0 0 1.44-1.08l1.63-5.63a1.13 1.13 0 0 0-1.08-1.44H5.11zM9 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);

export const ChevronDownIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const PlusIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const MinusIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={2}>
    <path d="M19.5 12h-15" />
  </svg>
);

export const TrashIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} {...base}>
    <path d="M14.74 9l-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17L18.16 19.67A2.25 2.25 0 0 1 15.92 21.75H8.08a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-12 .57c.34-.06.68-.11 1.02-.17m0 0a48.11 48.11 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.96 51.96 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.67 48.67 0 0 0-7.5 0" />
  </svg>
);

export const PhoneIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={1.6}>
    <path d="M2.25 6.75c0 8.28 6.72 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.37c0-.52-.35-.97-.85-1.09l-4.42-1.11c-.44-.11-.9.06-1.17.42l-.97 1.29a1.12 1.12 0 0 1-1.21.38 12.04 12.04 0 0 1-7.14-7.14 1.12 1.12 0 0 1 .38-1.21l1.29-.97c.36-.27.53-.73.42-1.17L6.97 3.6a1.12 1.12 0 0 0-1.09-.85H4.5A2.25 2.25 0 0 0 2.25 5v1.75z" />
  </svg>
);

export const PinIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} {...base} strokeWidth={1.6}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
