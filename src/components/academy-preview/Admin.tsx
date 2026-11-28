"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  COURSES,
  STALL_DAYS,
  STUDENTS,
  courseMinutes,
  daysSince,
  findCourse,
  formatMinutes,
  lessonsOf,
  meAsStudent,
  priceOf,
  relTime,
  resetDemo,
  setHidden,
  setPrice,
  setRevoked,
  useAcademy,
  type Enrolment,
  type Student,
} from "@/lib/academy-preview";
import { formatNaira } from "@/lib/shop-data";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcons";
import { toast } from "@/components/admin/Toast";
import { Badge, Card, PageHeader, StatCard, btn, inputClass, table, type BadgeTone } from "@/components/admin/ui";
import { BASE } from "./Student";

const A = `${BASE}/admin`;

/* ───────────────────────── shell ───────────────────────── */

const NAV: { href: string; label: string; icon: AdminIconName }[] = [
  { href: `${A}/`, label: "Overview", icon: "dashboard" },
  { href: `${A}/students/`, label: "Students", icon: "customers" },
  { href: `${A}/course/?c=${COURSES[0].id}`, label: "Courses", icon: "academy" },
];

export function AdminFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => {
    const p = href.split("?")[0];
    return p === `${A}/` ? path === `${A}/` || path === A : path.startsWith(p);
  };
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-3 py-5 sm:px-4 lg:flex-row lg:px-5">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="rounded-2xl bg-paper p-3 shadow-sm lg:sticky lg:top-5">
            <Link href={`${A}/`} className="flex items-center gap-2 px-2 py-1">
              <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-8 w-auto" />
            </Link>
            <p className="mt-4 px-3 pb-1.5 text-xs font-medium text-ink/45">Academy admin</p>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Academy admin">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active(n.href) ? "bg-brand font-semibold text-paper shadow-md shadow-brand/20" : "font-medium text-ink/75 hover:bg-[#f3f4f6]"
                  }`}
                >
                  <AdminIcon name={n.icon} className="h-5 w-5" />
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 hidden flex-col gap-2 border-t border-ink/10 pt-4 lg:flex">
              <Link href={`${BASE}/`} className="flex items-center gap-3 rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-sm font-medium text-ink/75 hover:text-ink">
                <AdminIcon name="external" className="h-5 w-5" />
                Student view
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (!confirm("Clear the demo student's progress and start again?")) return;
                  resetDemo();
                  toast("Demo progress cleared");
                }}
                className="cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-medium text-ink/50 hover:text-ink"
              >
                Reset demo progress
              </button>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/* ───────────────────────── shared helpers ───────────────────────── */

type Row = { student: Student; e: Enrolment; revoked: boolean };

function useRows() {
  const s = useAcademy();
  return useMemo(() => {
    const me = meAsStudent(s);
    const students = me ? [me, ...STUDENTS] : STUDENTS;
    const rows: Row[] = students.flatMap((st) => st.enrolments.map((e) => ({ student: st, e, revoked: !!s.revoked[`${st.id}:${e.courseId}`] })));
    return { s, students, rows };
  }, [s]);
}

function statusOf(r: Row): { label: string; tone: BadgeTone } {
  if (r.revoked) return { label: "Access removed", tone: "red" };
  if (r.e.progress === 100) return { label: "Completed", tone: "green" };
  if (r.e.progress === 0) return { label: "Not started", tone: "grey" };
  if (daysSince(r.e.lastActive) >= STALL_DAYS) return { label: "Stalled", tone: "amber" };
  return { label: "Active", tone: "blue" };
}

function Progress({ pct }: { pct: number }) {
  return (
    <div className="flex min-w-[7rem] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
        <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums text-ink/60">{pct}%</span>
    </div>
  );
}

const initials = (name: string) =>
  name
    .replace(/\(.*\)/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function Avatar({ name, me }: { name: string; me?: boolean }) {
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${me ? "bg-accent text-ink" : "bg-brand/10 text-brand"}`}>{initials(name)}</span>
  );
}

/* ───────────────────────── overview ───────────────────────── */

export function Overview() {
  const { s, rows, students } = useRows();
  const live = rows.filter((r) => !r.revoked);
  const revenue = live.reduce((n, r) => n + priceOf(s, findCourse(r.e.courseId)!), 0);
  const avg = live.length ? Math.round(live.reduce((n, r) => n + r.e.progress, 0) / live.length) : 0;
  const stalled = live.filter((r) => statusOf(r).label === "Stalled" || (r.e.progress === 0 && daysSince(r.e.enrolledAt) >= 2));
  const feed = students
    .flatMap((st) => st.activity.map((a) => ({ ...a, who: st })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Academy"
        description="Sales, students and how far each one has got."
        actions={
          <button type="button" onClick={() => toast("In the real academy this opens the new-course form")} className={btn.primary}>
            + New course
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Course sales" value={formatNaira(revenue)} icon="wallet" sub="All time (demo)" />
        <StatCard label="Students" value={String(students.length)} icon="customers" sub={`${live.length} enrolments`} />
        <StatCard label="Average progress" value={`${avg}%`} icon="academy" sub="Across all enrolments" />
        <StatCard label="Need a nudge" value={String(stalled.length)} icon="bell" tone={stalled.length ? "warn" : "good"} hint={`No activity in ${STALL_DAYS}+ days or not started`} />
      </div>

      <Card title="Courses" flush>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Course</th>
                <th className={table.th}>Price</th>
                <th className={table.th}>Students</th>
                <th className={table.th}>Avg. progress</th>
                <th className={table.th}>Completed</th>
                <th className={table.th}>Status</th>
                <th className={table.th} />
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => {
                const cr = live.filter((r) => r.e.courseId === c.id);
                const cavg = cr.length ? Math.round(cr.reduce((n, r) => n + r.e.progress, 0) / cr.length) : 0;
                const done = cr.filter((r) => r.e.progress === 100).length;
                return (
                  <tr key={c.id} className={table.row}>
                    <td className={table.td}>
                      <Link href={`${A}/course/?c=${c.id}`} className="font-semibold text-ink hover:text-brand">
                        {c.title}
                      </Link>
                      <p className="text-xs text-ink/50">
                        {lessonsOf(c).length} lessons · {formatMinutes(courseMinutes(c))}
                      </p>
                    </td>
                    <td className={`${table.td} tabular-nums`}>{formatNaira(priceOf(s, c))}</td>
                    <td className={`${table.td} tabular-nums`}>{cr.length}</td>
                    <td className={table.td}>
                      <Progress pct={cavg} />
                    </td>
                    <td className={`${table.td} tabular-nums`}>{done}</td>
                    <td className={table.td}>{s.hidden[c.id] ? <Badge tone="grey">Hidden</Badge> : <Badge tone="green">Published</Badge>}</td>
                    <td className={`${table.td} text-right`}>
                      <Link href={`${A}/course/?c=${c.id}`} className={btn.ghost}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Needs a nudge" description="Stalled or not started — send a reminder.">
          {!stalled.length ? (
            <p className="text-sm text-ink/55">Everyone is on track.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink/[0.06]">
              {stalled.map((r) => (
                <li key={`${r.student.id}-${r.e.courseId}`} className="flex items-center gap-3 py-3">
                  <Avatar name={r.student.name} me={r.student.id === "me"} />
                  <div className="min-w-0 flex-1">
                    <Link href={`${A}/student/?s=${r.student.id}`} className="text-sm font-semibold text-ink hover:text-brand">
                      {r.student.name}
                    </Link>
                    <p className="truncate text-xs text-ink/50">
                      {findCourse(r.e.courseId)?.title} · {r.e.progress}% · last seen {relTime(r.e.lastActive)}
                    </p>
                  </div>
                  <button type="button" onClick={() => toast(`Reminder email sent to ${r.student.name} (demo)`)} className={btn.secondary}>
                    Remind
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent activity" description="Live from students' lessons, videos and quizzes.">
          <ul className="flex flex-col gap-3">
            {feed.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <Avatar name={a.who.name} me={a.who.id === "me"} />
                <div className="min-w-0">
                  <p className="text-ink/80">
                    <span className="font-semibold text-ink">{a.who.name}</span> — {a.text}
                  </p>
                  <p className="text-xs text-ink/45">{relTime(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── students list ───────────────────────── */

export function Students() {
  const { rows } = useRows();
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState("all");
  const shown = rows.filter((r) => {
    if (course !== "all" && r.e.courseId !== course) return false;
    if (status !== "all" && statusOf(r).label !== status) return false;
    const t = q.trim().toLowerCase();
    return !t || r.student.name.toLowerCase().includes(t) || r.student.email.toLowerCase().includes(t);
  });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Students"
        description="Every enrolment with progress, quiz scores, watch time and last activity."
        actions={
          <button type="button" onClick={() => toast("In the real academy: enrol someone who paid cash or by transfer")} className={btn.primary}>
            + Enrol student
          </button>
        }
      />
      <Card flush>
        <div className="flex flex-wrap items-center gap-2 px-5 py-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className={`${inputClass} max-w-xs`} aria-label="Search students" />
          <select value={course} onChange={(e) => setCourse(e.target.value)} className={`${inputClass} w-auto`} aria-label="Course">
            <option value="all">All courses</option>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-auto`} aria-label="Status">
            {["all", "Active", "Stalled", "Not started", "Completed", "Access removed"].map((o) => (
              <option key={o} value={o}>
                {o === "all" ? "Any status" : o}
              </option>
            ))}
          </select>
        </div>
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Student</th>
                <th className={table.th}>Course</th>
                <th className={table.th}>Progress</th>
                <th className={table.th}>Quiz avg.</th>
                <th className={table.th}>Watch time</th>
                <th className={table.th}>Last active</th>
                <th className={table.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const st = statusOf(r);
                return (
                  <tr key={`${r.student.id}-${r.e.courseId}`} className={table.row}>
                    <td className={table.td}>
                      <Link href={`${A}/student/?s=${r.student.id}`} className="flex items-center gap-3">
                        <Avatar name={r.student.name} me={r.student.id === "me"} />
                        <span>
                          <span className="block font-semibold text-ink hover:text-brand">{r.student.name}</span>
                          <span className="block text-xs text-ink/50">{r.student.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${table.td} max-w-[14rem] truncate`}>{findCourse(r.e.courseId)?.title}</td>
                    <td className={table.td}>
                      <Progress pct={r.e.progress} />
                    </td>
                    <td className={`${table.td} tabular-nums`}>{r.e.quizAvg === null ? "—" : `${r.e.quizAvg}%`}</td>
                    <td className={`${table.td} tabular-nums`}>{formatMinutes(r.e.watchMinutes)}</td>
                    <td className={table.td}>{relTime(r.e.lastActive)}</td>
                    <td className={table.td}>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/50">
                    No students match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────── one student ───────────────────────── */

export function StudentDetail() {
  const params = useSearchParams();
  const { s, students } = useRows();
  const st = students.find((x) => x.id === params.get("s"));
  if (!st)
    return (
      <Card>
        <p className="text-sm text-ink/60">
          Student not found.{" "}
          <Link href={`${A}/students/`} className="font-semibold text-brand">
            Back to students
          </Link>
        </p>
      </Card>
    );
  return (
    <div className="flex flex-col gap-6">
      <Link href={`${A}/students/`} className="text-sm font-semibold text-brand">
        ← Students
      </Link>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-paper p-5 shadow-sm">
        <Avatar name={st.name} me={st.id === "me"} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold text-ink">{st.name}</p>
          <p className="text-sm text-ink/55">
            {st.email} · {st.phone}
          </p>
        </div>
        <button type="button" onClick={() => toast(`Message sent to ${st.name} (demo)`)} className={btn.secondary}>
          Send message
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          {st.enrolments.map((e) => {
            const c = findCourse(e.courseId)!;
            const revoked = !!s.revoked[`${st.id}:${c.id}`];
            const st2 = statusOf({ student: st, e, revoked });
            return (
              <Card key={c.id} title={c.title} actions={<Badge tone={st2.tone}>{st2.label}</Badge>}>
                <Progress pct={e.progress} />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {[
                    ["Enrolled", new Date(e.enrolledAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })],
                    ["Quiz average", e.quizAvg === null ? "—" : `${e.quizAvg}%`],
                    ["Watch time", formatMinutes(e.watchMinutes)],
                    ["Last active", relTime(e.lastActive)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-[#f6f7fb] p-3">
                      <dt className="text-xs text-ink/50">{k}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => toast(`Reminder sent to ${st.name} (demo)`)} className={btn.secondary}>
                    Send reminder
                  </button>
                  {e.progress === 100 && (
                    <button type="button" onClick={() => toast("Certificate re-sent by email (demo)")} className={btn.secondary}>
                      Resend certificate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setRevoked(st.id, c.id, !revoked);
                      toast(revoked ? "Access restored" : "Access removed — lessons are locked for this student");
                    }}
                    className={revoked ? btn.primary : btn.danger}
                  >
                    {revoked ? "Restore access" : "Remove access"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
        <Card title="Activity" description="Every lesson, video, download and quiz.">
          {!st.activity.length ? (
            <p className="text-sm text-ink/55">No activity yet.</p>
          ) : (
            <ol className="relative flex flex-col gap-4 border-l border-ink/10 pl-4">
              {st.activity.map((a, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                  <p className="text-ink/80">{a.text}</p>
                  <p className="text-xs text-ink/45">
                    {relTime(a.at)} · {new Date(a.at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── course editor ───────────────────────── */

export function CourseEditor() {
  const params = useSearchParams();
  const { s, rows } = useRows();
  const c = findCourse(params.get("c")) ?? COURSES[0];
  const [price, setPriceText] = useState("");
  const [extra, setExtra] = useState<{ title: string; kind: string }[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("video");
  const enrolled = rows.filter((r) => r.e.courseId === c.id);
  const hidden = !!s.hidden[c.id];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={c.title}
        description={`${lessonsOf(c).length} lessons · ${formatMinutes(courseMinutes(c))} · ${c.access} access`}
        actions={
          <Link href={`${BASE}/course/?c=${c.id}`} className={btn.secondary}>
            View as student
          </Link>
        }
      />
      <div className="flex gap-2 overflow-x-auto">
        {COURSES.map((x) => (
          <Link
            key={x.id}
            href={`${A}/course/?c=${x.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${x.id === c.id ? "bg-ink text-paper" : "bg-paper text-ink/70 shadow-sm"}`}
          >
            {x.title}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card title="Lessons" description="Upload videos, add guides and quizzes. Drag to reorder in the real academy.">
          <div className="flex flex-col gap-4">
            {c.modules.map((m) => (
              <div key={m.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">{m.title}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm">
                      <span className="w-12 text-[11px] font-semibold uppercase text-ink/45">{l.kind}</span>
                      <span className="flex-1 text-ink">{l.title}</span>
                      {l.free && <Badge tone="amber">Free preview</Badge>}
                      <span className="text-xs text-ink/45">{l.minutes} min</span>
                      <button type="button" onClick={() => toast("In the real academy this opens the lesson editor")} className={btn.ghost}>
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {extra.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Added now (demo)</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {extra.map((l, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-dashed border-brand/40 bg-brand/[0.03] px-3 py-2.5 text-sm">
                      <span className="w-12 text-[11px] font-semibold uppercase text-ink/45">{l.kind}</span>
                      <span className="flex-1 text-ink">{l.title}</span>
                      <Badge tone="blue">Draft</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                setExtra((x) => [...x, { title: title.trim(), kind }]);
                setTitle("");
                toast("Lesson added (demo — real videos upload to secure hosting)");
              }}
              className="flex flex-col gap-2 rounded-xl bg-[#f6f7fb] p-3 sm:flex-row"
            >
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New lesson title" className={inputClass} aria-label="New lesson title" />
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputClass} sm:w-32`} aria-label="Lesson type">
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
              </select>
              <button type="submit" className={btn.primary}>
                Add
              </button>
            </form>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Price & visibility">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(price.replace(/[^\d]/g, ""));
                if (!n) return toast("Enter a price", false);
                setPrice(c.id, n);
                setPriceText("");
                toast(`Price saved: ${formatNaira(n)}`);
              }}
            >
              <label className="text-xs font-medium text-ink/55" htmlFor="price">
                Price (now {formatNaira(priceOf(s, c))})
              </label>
              <div className="mt-1.5 flex gap-2">
                <input id="price" inputMode="numeric" value={price} onChange={(e) => setPriceText(e.target.value)} placeholder={String(priceOf(s, c))} className={inputClass} />
                <button type="submit" className={btn.primary}>
                  Save
                </button>
              </div>
            </form>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
              <div>
                <p className="text-sm font-semibold text-ink">{hidden ? "Hidden" : "Published"}</p>
                <p className="text-xs text-ink/50">{hidden ? "Students can't see or buy it." : "Shown on the academy page."}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHidden(c.id, !hidden);
                  toast(hidden ? "Course published" : "Course hidden from the academy page");
                }}
                className={hidden ? btn.primary : btn.secondary}
              >
                {hidden ? "Publish" : "Hide"}
              </button>
            </div>
          </Card>
          <Card title={`Students (${enrolled.length})`}>
            <ul className="flex flex-col gap-3">
              {enrolled.map((r) => (
                <li key={r.student.id}>
                  <Link href={`${A}/student/?s=${r.student.id}`} className="text-sm font-semibold text-ink hover:text-brand">
                    {r.student.name}
                  </Link>
                  <Progress pct={r.e.progress} />
                </li>
              ))}
              {!enrolled.length && <p className="text-sm text-ink/55">No students yet.</p>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
