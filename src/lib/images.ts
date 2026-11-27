/**
 * Landing-page imagery — Spinning Top brand illustrations (Nov 2026).
 *
 * Originals are in /public/images/photos/spin*.png; the site uses web-sized
 * JPG copies (1600px wide) named home-*.jpg so the page loads quickly.
 * To change one:
 *   1. Add a landscape image (~1600px wide) to /public/images/photos/.
 *   2. Point `src` below at it.
 *   3. Update `alt` to describe what is actually in the image.
 * Setting `src` to null shows a placeholder frame with the `shot` brief.
 */
export type SiteImage = {
  src: string | null;
  alt: string;
  /** What this slot should show (brief for future photos). */
  shot: string;
  /** Credit, if the image is not Spinning Top's own. */
  credit?: string;
};

export const IMAGES = {
  hero: {
    src: "/images/photos/home-workshop.jpg",
    alt: "Illustration of a Spinning Top tailor sewing at a machine in a bright workshop, with garments on display",
    shot: "The Oluyole outlet: machines, counter or staff at work",
  },
  pillarServices: {
    src: "/images/photos/home-garments-rail.jpg",
    alt: "Illustration of freshly cleaned shirts hanging on a rail",
    shot: "Freshly finished garments on a rail",
  },
  pillarShop: {
    src: "/images/photos/home-products.jpg",
    alt: "Illustration of laundry and hygiene products on shelves",
    shot: "Laundry & hygiene products on a shelf, labels readable",
  },
  pillarAcademy: {
    src: "/images/photos/home-academy.jpg",
    alt: "Illustration of a trainer guiding learners at sewing machines",
    shot: "Trainer demonstrating a technique to learners",
  },
  services: {
    src: "/images/photos/home-ironing.jpg",
    alt: "Illustration of a white shirt being pressed with an iron",
    shot: "Staff member inspecting or pressing a garment",
  },
  shop: {
    src: "/images/photos/home-folded-laundry.jpg",
    alt: "Illustration of stacks of clean, folded laundry in front of washing machines",
    shot: "Close-up of a product pack in use",
  },
  academy: {
    src: "/images/photos/home-workshop.jpg",
    alt: "Illustration of a Spinning Top tailor sewing at a machine in a bright workshop, with garments on display",
    shot: "Learners in hands-on practice, with safety equipment",
  },
  corporate: {
    src: "/images/photos/home-corporate.jpg",
    alt: "Illustration of a team meeting around a conference table",
    shot: "Folded linen packed and ready for collection",
  },
} satisfies Record<string, SiteImage>;
