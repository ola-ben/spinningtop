"use client";

import { useEffect, useState } from "react";
import { publicReviews, type PublicReview } from "@/lib/reviews";

/* Published customer reviews on a product page (supabase/reviews.sql).
   Hidden entirely until the product has at least one published review. */

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(iso));

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`whitespace-nowrap text-amber-500 ${className}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-ink/15">{"★".repeat(5 - full)}</span>
    </span>
  );
}

const PAGE = 5;

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    void publicReviews(productId).then((list) => {
      if (active) setReviews(list);
    });
    return () => {
      active = false;
    };
  }, [productId]);

  if (!reviews.length) return null;
  const average = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
  const list = showAll ? reviews : reviews.slice(0, PAGE);

  return (
    <section className="mt-2 bg-paper p-4 sm:mt-4 sm:p-8" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-display text-lg font-semibold tracking-tight">
        Customer reviews
      </h2>
      <p className="mt-2 flex items-center gap-2 text-sm">
        <Stars rating={average} className="text-lg" />
        <span className="font-semibold">{average.toFixed(1)}</span>
        <span className="text-ink/55">
          · {reviews.length} review{reviews.length > 1 ? "s" : ""}
        </span>
      </p>
      <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {list.map((r) => (
          <li key={r.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Stars rating={r.rating} />
              {r.title && <p className="text-sm font-semibold">{r.title}</p>}
            </div>
            {r.body && <p className="mt-1.5 whitespace-pre-line text-sm text-ink/75">{r.body}</p>}
            <p className="mt-1.5 text-xs text-ink/50">
              {r.reviewer} · {formatDate(r.createdAt)} · Verified purchase
            </p>
          </li>
        ))}
      </ul>
      {reviews.length > PAGE && !showAll && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-2 cursor-pointer text-sm font-semibold text-brand hover:underline">
          Show all {reviews.length} reviews
        </button>
      )}
    </section>
  );
}
