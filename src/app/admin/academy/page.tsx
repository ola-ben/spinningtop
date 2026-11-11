import { Badge, Card, PageHeader, STATUS_TONE, StatCard, btn, table } from "@/components/admin/ui";
import { COURSES, formatDate } from "@/lib/admin-demo";
import { formatNaira } from "@/lib/shop-data";

export const metadata = { title: "Academy" };

export default function AcademyPage() {
  const enrolled = COURSES.reduce((n, c) => n + c.enrolled, 0);
  const seats = COURSES.reduce((n, c) => n + c.seats, 0);
  const next = [...COURSES].filter((c) => c.status !== "Draft").sort((a, b) => a.nextIntake.localeCompare(b.nextIntake))[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Training Academy"
        description="Courses, intakes and enrolments."
        actions={
          <button type="button" className={btn.primary}>
            + New course
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Courses" value={String(COURSES.length)} />
        <StatCard label="Enrolled learners" value={String(enrolled)} />
        <StatCard label="Seats filled" value={`${seats ? Math.round((enrolled / seats) * 100) : 0}%`} />
        <StatCard label="Next intake" value={next ? formatDate(next.nextIntake) : "—"} hint={next?.title} />
      </div>

      <Card title="Courses & intakes" flush>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Course</th>
                <th className={table.th}>Duration</th>
                <th className={table.th}>Fee</th>
                <th className={table.th}>Next intake</th>
                <th className={table.th}>Seats</th>
                <th className={table.th}>Status</th>
                <th className={`${table.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-ink/50">
                    No courses yet.
                  </td>
                </tr>
              )}
              {COURSES.map((c) => (
                <tr key={c.id} className={table.row}>
                  <td className={`${table.td} font-semibold`}>{c.title}</td>
                  <td className={`${table.td} text-ink/65`}>{c.duration}</td>
                  <td className={`${table.td} tabular-nums`}>{formatNaira(c.fee)}</td>
                  <td className={`${table.td} text-ink/65`}>{formatDate(c.nextIntake)}</td>
                  <td className={table.td}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/10">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${(c.enrolled / c.seats) * 100}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-ink/60">
                        {c.enrolled}/{c.seats}
                      </span>
                    </div>
                  </td>
                  <td className={table.td}>
                    <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                  </td>
                  <td className={`${table.td} text-right`}>
                    <button type="button" className={btn.ghost}>
                      Learners
                    </button>
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

      <p className="text-xs text-ink/50">
        Brand Book p.14: publish accurate syllabus, fees, instructor credentials and certificate type for each course.
      </p>
    </div>
  );
}
