"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminProducts } from "@/components/admin/CatalogueForms";
import { toast } from "@/components/admin/Toast";
import { Badge, Card, PageHeader, STATUS_TONE, SearchInput, Select, StatCard, Toolbar, btn, table } from "@/components/admin/ui";
import { formatDate } from "@/lib/admin-demo";
import { REVIEW_STATUSES, deleteReview, listReviews, setReviewStatus, type Review, type ReviewStatus } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap text-amber-500" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/15">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

const RATINGS = ["All ratings", "5 ★", "4 ★", "3 ★", "2 ★", "1 ★"];

/* Product reviews written by customers in My account → Pending Reviews.
   New reviews arrive as "Pending" and only show on the shop once published. */
export default function ReviewsScreen() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [rating, setRating] = useState("All ratings");
  const { products } = useAdminProducts();
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  const load = useCallback(async () => {
    try {
      setReviews(await listReviews());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reviews.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    listReviews()
      .then((list) => active && setReviews(list))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Could not load reviews."));
    return () => {
      active = false;
    };
  }, []);

  const all = reviews ?? [];
  const count = (s: ReviewStatus) => all.filter((r) => r.status === s).length;
  const published = all.filter((r) => r.status === "Published");
  const average = published.length ? (published.reduce((n, r) => n + r.rating, 0) / published.length).toFixed(1) : "–";

  const q = query.trim().toLowerCase();
  const stars = rating === "All ratings" ? 0 : Number(rating[0]);
  const shown = all.filter(
    (r) =>
      (!q || `${productName(r.productId)} ${r.customerName} ${r.orderId} ${r.title} ${r.body}`.toLowerCase().includes(q)) &&
      (status === "All statuses" || r.status === status) &&
      (!stars || r.rating === stars),
  );

  async function change(r: Review, next: ReviewStatus) {
    setBusy(r.id);
    const err = await setReviewStatus(r.id, next);
    setBusy(null);
    if (err) return toast(err, false);
    toast(next === "Published" ? "Review published" : "Review hidden");
    void load();
  }

  async function remove(r: Review) {
    if (!window.confirm(`Delete this review from ${r.customerName || "the customer"}? This can't be undone.`)) return;
    setBusy(r.id);
    const err = await deleteReview(r.id);
    setBusy(null);
    if (err) return toast(err, false);
    toast("Review deleted");
    void load();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reviews" description="Approve customer reviews before they appear on product pages." />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Awaiting approval" value={String(count("Pending"))} icon="reviews" />
        <StatCard label="Published" value={String(count("Published"))} />
        <StatCard label="Hidden" value={String(count("Hidden"))} />
        <StatCard label="Average rating (published)" value={average === "–" ? "–" : `${average} ★`} />
      </div>

      <Card flush>
        <Toolbar>
          <SearchInput placeholder="Search product, customer or review" value={query} onChange={setQuery} />
          <Select label="Status" options={["All statuses", ...REVIEW_STATUSES]} value={status} onChange={setStatus} />
          <Select label="Rating" options={RATINGS} value={rating} onChange={setRating} />
        </Toolbar>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Product</th>
                <th className={table.th}>Rating</th>
                <th className={table.th}>Review</th>
                <th className={table.th}>Customer</th>
                <th className={table.th}>Date</th>
                <th className={table.th}>Status</th>
                <th className={`${table.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={table.row}>
                  <td className={`${table.td} font-medium`}>{productName(r.productId)}</td>
                  <td className={table.td}>
                    <Stars rating={r.rating} />
                  </td>
                  <td className={`${table.td} max-w-xs whitespace-normal`}>
                    {r.title && <p className="font-medium">{r.title}</p>}
                    {r.body ? <p className="text-ink/60">{r.body}</p> : !r.title && <p className="text-ink/40">Stars only</p>}
                  </td>
                  <td className={table.td}>
                    {r.customerName || "Customer"}
                    <p className="text-xs text-ink/50">Order {r.orderId}</p>
                  </td>
                  <td className={`${table.td} text-ink/60`}>{formatDate(r.createdAt)}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </td>
                  <td className={`${table.td} whitespace-nowrap text-right`}>
                    {r.status !== "Published" && (
                      <button type="button" disabled={busy === r.id} onClick={() => change(r, "Published")} className={btn.ghost}>
                        Publish
                      </button>
                    )}
                    {r.status !== "Hidden" && (
                      <button type="button" disabled={busy === r.id} onClick={() => change(r, "Hidden")} className={btn.ghost}>
                        Hide
                      </button>
                    )}
                    <button type="button" disabled={busy === r.id} onClick={() => remove(r)} className={`${btn.ghost} text-red-700`}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews === null && !error && <p className="px-4 py-12 text-center text-sm text-ink/50">Loading…</p>}
          {reviews !== null && all.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-ink/50">
              No reviews yet. Customers can rate products after their order is delivered.
            </p>
          )}
          {all.length > 0 && shown.length === 0 && <p className="px-4 py-12 text-center text-sm text-ink/50">No reviews match your search.</p>}
        </div>
      </Card>
    </div>
  );
}
