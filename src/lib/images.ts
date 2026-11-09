/**
 * Landing-page imagery.
 *
 * CURRENT PHOTOS ARE TEMPORARY Unsplash stock (Unsplash License — free for
 * commercial use, no attribution required; credits kept below anyway).
 * Replace them with real Spinning Top photos as soon as they are available:
 *   1. Put the photo in /public/images/ (landscape, ~1600px wide or larger).
 *   2. Change `src` below, e.g. src: "/images/pressing.jpg".
 *   3. Update `alt` to describe what is actually in the photo.
 * Brand illustrations are kept in /public/images/*.svg as a fallback.
 * Setting `src` to null shows a placeholder frame with the `shot` brief.
 *
 * Brand Book p.11: real staff, facilities, process and products only.
 * Don't present stock people as Spinning Top staff, clients or results.
 */
export type SiteImage = {
  src: string | null;
  alt: string;
  /** Shot brief for the real photo that should replace this slot. */
  shot: string;
  /** Temporary stock credit. */
  credit?: string;
};

export const IMAGES = {
  hero: {
    src: "/images/photos/laundry-room.jpg",
    alt: "A row of commercial washing machines in a clean laundry facility",
    shot: "The Oluyole outlet: machines, counter or staff at work",
    credit: "Oli Woodman — unsplash.com/photos/f4jsI88K7ds",
  },
  pillarServices: {
    src: "/images/photos/garments-rail.jpg",
    alt: "Freshly cleaned shirts hanging on a clothes rail",
    shot: "Freshly finished garments on a rail",
    credit: "Parker Burchfield — unsplash.com/photos/tvG4WvjgsEY",
  },
  pillarShop: {
    src: "/images/photos/detergent-bubbles.jpg",
    alt: "Close-up of detergent bubbles on a white surface",
    shot: "Laundry & hygiene products on a shelf, labels readable",
    credit: "Julia Ly — unsplash.com/photos/lkp-b-kfdwc",
  },
  pillarAcademy: {
    src: "/images/photos/academy-sewing.jpg",
    alt: "A woman working with fabric at an industrial sewing machine",
    shot: "Trainer demonstrating a technique to learners",
    credit: "EqualStock — unsplash.com/photos/ov1h5VBpkUo",
  },
  services: {
    src: "/images/photos/pressing-shirt.jpg",
    alt: "A white shirt being pressed with an iron",
    shot: "Staff member inspecting or pressing a garment",
    credit: "Dzulfikar Alkautsar — unsplash.com/photos/Bf8ojHnEvVc",
  },
  shop: {
    src: "/images/photos/folded-laundry.jpg",
    alt: "Stacks of clean, folded shirts on a table",
    shot: "Close-up of a product pack in use",
    credit: "Dan LeFebvre — unsplash.com/photos/APUvZYCjPJ0",
  },
  academy: {
    src: "/images/photos/tailor-at-work.jpg",
    alt: "A tailor sewing fabric on a sewing machine in a workshop",
    shot: "Learners in hands-on practice, with safety equipment",
    credit: "Ali Mkumbwa — unsplash.com/photos/1SAFRlUY0lk",
  },
  corporate: {
    src: "/images/photos/corporate-meeting.jpg",
    alt: "A team meeting around a conference table with laptops in a bright office",
    shot: "Folded linen packed and ready for collection",
    credit: "Christina @ wocintechchat.com — unsplash.com/photos/rg1y72eKw6o",
  },
} satisfies Record<string, SiteImage>;
