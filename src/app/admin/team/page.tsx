import { Badge, Card, Field, PageHeader, STATUS_TONE, btn, inputClass, table } from "@/components/admin/ui";
import { ROLES, TEAM } from "@/lib/admin-demo";

export const metadata = { title: "Team & roles" };

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Team & roles" description="Who can sign in to the admin and what they can do." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Team members" className="lg:col-span-2" flush>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Name</th>
                  <th className={table.th}>Role</th>
                  <th className={table.th}>Outlet</th>
                  <th className={table.th}>Status</th>
                  <th className={`${table.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {TEAM.map((m) => (
                  <tr key={m.id} className={table.row}>
                    <td className={table.td}>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-ink/50">{m.email}</p>
                    </td>
                    <td className={table.td}>
                      <Badge tone={m.role === "Owner" ? "violet" : m.role === "Manager" ? "blue" : "grey"}>{m.role}</Badge>
                    </td>
                    <td className={`${table.td} text-ink/65`}>{m.branch}</td>
                    <td className={table.td}>
                      <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
                    </td>
                    <td className={`${table.td} text-right`}>
                      <button type="button" className={btn.ghost}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Invite someone">
            <form className="grid gap-4">
              <Field label="Email">
                <input type="email" placeholder="name@example.com" className={inputClass} />
              </Field>
              <Field label="Role">
                <select className={`${inputClass} cursor-pointer`} defaultValue="Staff">
                  {ROLES.map((r) => (
                    <option key={r.role}>{r.role}</option>
                  ))}
                </select>
              </Field>
              <button type="button" className={btn.primary}>
                Send invite
              </button>
            </form>
          </Card>

          <Card title="Roles">
            <ul className="flex flex-col gap-3">
              {ROLES.map((r) => (
                <li key={r.role}>
                  <p className="text-sm font-semibold">{r.role}</p>
                  <p className="text-xs leading-relaxed text-ink/55">{r.summary}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
