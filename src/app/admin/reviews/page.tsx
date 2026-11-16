import { Badge, Card, PageHeader, STATUS_TONE, SearchInput, Select, StatCard, Toolbar, btn, table } from "@/components/admin/ui";
import { REVIEWS, REVIEW_STATUSES, formatDate } from "@/lib/admin-demo";
import { PRODUCTS } from "@/lib/shop-data";

export const metadata = { title: "Reviews" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap text-amber-500" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/15">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/* Product reviews written by customers in My account → Pending Reviews.
   New reviews arrive as "Pending" and only show on the shop once published. */
export default function ReviewsPage() {
  const count = (s: string) => REVIEWS.filter((r) => r.status === s).length;
  const average = REVIEWS.length ? (REVIEWS.reduce((n, r) => n + r.rating, 0) / REVIEWS.length).toFixed(1) : "0.0";
  const product = (id: string) => PRODUCTS.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reviews" description="Approve customer reviews before they appear on product pages." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Awaiting approval" value={String(count("Pending"))} icon="reviews" />
        <StatCard label="Published" value={String(count("Published"))} />
        <StatCard label="Hidden" value={String(count("Hidden"))} />
        <StatCard label="Average rating" value={`${average} ★`} />
      </div>

      <Card flush>
        <Toolbar>
          <SearchInput placeholder="Search product, customer or review" />
          <Select label="Status" options={["All statuses", ...REVIEW_STATUSES]} />
          <Select label="Rating" options={["All ratings", "5 ★", "4 ★", "3 ★", "2 ★", "1 ★"]} />
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
              {REVIEWS.map((r) => (
                <tr key={r.id} className={table.row}>
                  <td className={`${table.td} font-medium`}>{product(r.productId)}</td>
                  <td className={table.td}>
                    <Stars rating={r.rating} />
                  </td>
                  <td className={`${table.td} max-w-xs whitespace-normal`}>
                    {r.title && <p className="font-medium">{r.title}</p>}
                    <p className="line-clamp-2 text-ink/60">{r.body}</p>
                  </td>
                  <td className={table.td}>
                    {r.customer}
                    <p className="text-xs text-ink/50">Order {r.orderId}</p>
                  </td>
                  <td className={`${table.td} text-ink/60`}>{formatDate(r.createdAt)}</td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </td>
                  <td className={`${table.td} text-right`}>
                    {r.status !== "Published" && (
                      <button type="button" className={btn.ghost}>
                        Publish
                      </button>
                    )}
                    {r.status !== "Hidden" && (
                      <button type="button" className={btn.ghost}>
                        Hide
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {REVIEWS.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-ink/50">
              No reviews yet. Customers can rate products after their order is delivered.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
