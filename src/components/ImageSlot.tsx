import Image from "next/image";
import type { SiteImage } from "@/lib/images";

type ImageSlotProps = {
  image: SiteImage;
  /** Tailwind aspect class, e.g. "aspect-[4/3]". */
  aspect?: string;
  className?: string;
  /** `sizes` hint for responsive loading. */
  sizes?: string;
  /** Adds a slow zoom when a parent `.group` is hovered. */
  zoomOnHover?: boolean;
  /** Load eagerly — use for above-the-fold images (e.g. the hero). */
  priority?: boolean;
  /** CSS object-position for the crop focus, e.g. "30% 60%". */
  objectPosition?: string;
};

/**
 * A photo frame that renders the real image when `src` is set,
 * otherwise a calm placeholder carrying the shot brief.
 */
export default function ImageSlot({
  image,
  aspect = "aspect-[4/3]",
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  zoomOnHover = false,
  priority = false,
  objectPosition,
}: ImageSlotProps) {
  const zoom = zoomOnHover
    ? "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
    : "";

  return (
    <div className={`relative w-full overflow-hidden bg-tint ${aspect} ${className}`}>
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={priority}
          loading={priority ? "eager" : undefined}
          // SVG illustrations are already vector + tiny; skip the raster optimiser.
          unoptimized={image.src.endsWith(".svg")}
          style={objectPosition ? { objectPosition } : undefined}
          className={`object-cover ${zoom}`}
        />
      ) : (
        <div
          role="img"
          aria-label={`Photo coming soon: ${image.shot}`}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-ink/15 p-6 text-center ${zoom}`}
        >
          <svg
            className="h-7 w-7 text-ink/25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.16-5.16a2.25 2.25 0 013.18 0l5.16 5.16m-1.5-1.5l1.41-1.41a2.25 2.25 0 013.18 0l2.91 2.91M3.75 21h16.5A1.5 1.5 0 0021.75 19.5v-15A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zm10.5-12.75h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">Photo</span>
          <span className="max-w-[18rem] text-xs leading-relaxed text-ink/50">{image.shot}</span>
        </div>
      )}
    </div>
  );
}
