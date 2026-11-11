"use client";

import { toggleWishlist, useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/shop-data";
import { HeartIcon } from "./ShopIcons";

/** ♡ toggle. "overlay" sits on a product photo; "plain" sits beside a title. */
export default function WishlistButton({
  product,
  variant = "overlay",
}: {
  product: Product;
  variant?: "overlay" | "plain";
}) {
  const saved = useWishlist().includes(product.id);
  const label = saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`;

  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards are links — don't navigate when tapping the heart.
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product.id);
      }}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved" : "Save for later"}
      className={`grid shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 active:scale-90 ${
        variant === "overlay"
          ? "h-9 w-9 bg-paper/95 shadow-md shadow-ink/10 backdrop-blur hover:scale-105"
          : "h-11 w-11 border border-ink/15 hover:border-ink/40"
      } ${saved ? "text-red-600" : "text-ink/70 hover:text-ink"}`}
    >
      <HeartIcon filled={saved} className="h-5 w-5" />
    </button>
  );
}
