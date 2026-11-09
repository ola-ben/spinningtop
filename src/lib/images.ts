/**
 * Landing-page imagery.
 *
 * The current files are TEMPORARY brand illustrations (public/images/*.svg).
 * Replace them with real photos before launch:
 *   1. Put the photo in /public/images/ (landscape, ~1600px wide or larger).
 *   2. Change `src` below, e.g. src: "/images/pressing.jpg".
 *   3. Update `alt` to describe what is actually in the photo.
 * Setting `src` to null shows a placeholder frame with the `shot` brief.
 *
 * Brand Book p.11: real staff, facilities, process and products only.
 * No watermarked stock, no fake results, no unsafe handling, and get
 * permission from anyone identifiable.
 */
export type SiteImage = {
  src: string | null;
  alt: string;
  /** Shot brief for the real photo that should replace this slot. */
  shot: string;
};

export const IMAGES = {
  pillarServices: {
    src: "/images/garments-rail.svg",
    alt: "Illustration of freshly finished garments hanging on a rail",
    shot: "Freshly finished garments on a rail",
  },
  pillarShop: {
    src: "/images/products-shelf.svg",
    alt: "Illustration of laundry and hygiene products on a shelf",
    shot: "Laundry & hygiene products on a shelf, labels readable",
  },
  pillarAcademy: {
    src: "/images/academy-demo.svg",
    alt: "Illustration of a trainer demonstrating garment care to learners",
    shot: "Trainer demonstrating a technique to learners",
  },
  services: {
    src: "/images/pressing.svg",
    alt: "Illustration of a shirt being pressed on an ironing board",
    shot: "Staff member inspecting or pressing a garment",
  },
  shop: {
    src: "/images/product-in-use.svg",
    alt: "Illustration of detergent being measured into a cap",
    shot: "Close-up of a product pack in use",
  },
  academy: {
    src: "/images/learners-practice.svg",
    alt: "Illustration of a stain-treatment practice station with goggles, gloves and tools",
    shot: "Learners in hands-on practice, with safety equipment",
  },
  corporate: {
    src: "/images/linen-stack.svg",
    alt: "Illustration of folded linen tied and tagged, ready for collection",
    shot: "Folded linen packed and ready for collection",
  },
} satisfies Record<string, SiteImage>;
