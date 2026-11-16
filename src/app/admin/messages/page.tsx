import MessageComposer from "@/components/admin/MessageComposer";
import { Badge, Card, PageHeader, SearchInput, StatCard, Toolbar, table } from "@/components/admin/ui";
import { MESSAGES, formatDateTime } from "@/lib/admin-demo";

export const metadata = { title: "Messages" };

/* Order updates and notes sent to customers' My account → Inbox. */
export default function MessagesPage() {
  const unread = MESSAGES.filter((m) => !m.read).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Send order updates to customers' account inbox." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatCard label="Messages sent" value={String(MESSAGES.length)} icon="messages" />
        <StatCard label="Unread by customer" value={String(unread)} />
        <StatCard label="Read" value={String(MESSAGES.length - unread)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Sent messages" className="xl:col-span-2" flush>
          <Toolbar>
            <SearchInput placeholder="Search customer, order or title" />
          </Toolbar>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Message</th>
                  <th className={table.th}>Customer</th>
                  <th className={table.th}>Order</th>
                  <th className={table.th}>Sent</th>
                  <th className={table.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MESSAGES.map((m) => (
                  <tr key={m.id} className={table.row}>
                    <td className={`${table.td} max-w-xs whitespace-normal`}>
                      <p className="font-medium">{m.title}</p>
                      <p className="line-clamp-1 text-ink/55">{m.body}</p>
                    </td>
                    <td className={table.td}>{m.customer}</td>
                    <td className={`${table.td} text-ink/60`}>{m.orderId ?? "—"}</td>
                    <td className={`${table.td} text-ink/60`}>{formatDateTime(m.sentAt)}</td>
                    <td className={table.td}>
                      <Badge tone={m.read ? "green" : "amber"}>{m.read ? "Read" : "Unread"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {MESSAGES.length === 0 && <p className="px-4 py-12 text-center text-sm text-ink/50">No messages sent yet.</p>}
          </div>
        </Card>

        <Card title="New message" description="Appears in the customer's Inbox.">
          <MessageComposer />
        </Card>
      </div>
    </div>
  );
}
