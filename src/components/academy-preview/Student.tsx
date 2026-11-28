"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  COURSES,
  ME,
  completeLesson,
  courseMinutes,
  courseProgress,
  enrol,
  findCourse,
  formatMinutes,
  isEnrolled,
  lessonsOf,
  openLesson,
  priceOf,
  saveQuiz,
  setWatched,
  useAcademy,
  type Course,
  type Lesson,
} from "@/lib/academy-preview";
import { formatNaira } from "@/lib/shop-data";
import { toast } from "@/components/admin/Toast";

export const BASE = "/academy-preview";

/* ───────────────────────── shared bits ───────────────────────── */

export function PreviewBar({ admin = false }: { admin?: boolean }) {
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 text-xs sm:px-6">
        <p>
          <span className="mr-2 rounded-full bg-accent px-2 py-0.5 font-bold text-ink">PROTOTYPE</span>
          Demo data only — no real payments or videos.
        </p>
        <nav className="flex items-center gap-1" aria-label="Prototype views">
          <Link href={`${BASE}/`} className={`rounded-full px-3 py-1 font-semibold ${admin ? "text-paper/70 hover:text-paper" : "bg-paper text-ink"}`}>
            Student view
          </Link>
          <Link href={`${BASE}/admin/`} className={`rounded-full px-3 py-1 font-semibold ${admin ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}>
            Admin view
          </Link>
        </nav>
      </div>
    </div>
  );
}

function Bar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-ink/10 ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

const KIND_LABEL = { video: "Video", pdf: "PDF", quiz: "Quiz" } as const;

function KindIcon({ kind, className = "h-4 w-4" }: { kind: Lesson["kind"]; className?: string }) {
  const d =
    kind === "video"
      ? "M5.25 5.65c0-.86.92-1.4 1.67-.98l11.54 6.35a1.13 1.13 0 0 1 0 1.96L6.92 19.33c-.75.42-1.67-.12-1.67-.98V5.65Z"
      : kind === "pdf"
        ? "M19.5 14.25v-2.63a3.38 3.38 0 0 0-3.38-3.37h-1.5a1.13 1.13 0 0 1-1.12-1.13v-1.5A3.38 3.38 0 0 0 10.13 2.25H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.63c-.62 0-1.13.5-1.13 1.13v17.25c0 .62.5 1.12 1.13 1.12h12.75c.62 0 1.12-.5 1.12-1.12V11.25a9 9 0 0 0-9-9Z"
        : "M9.88 7.52c1.17-1.03 3.07-1.03 4.24 0 1.17 1.02 1.17 2.69 0 3.71-.2.18-.43.33-.67.44-.73.36-1.45.98-1.45 1.78v.8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.01v.01H12v-.01Z";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Lock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

/* ───────────────────────── catalogue ───────────────────────── */

export function Catalogue() {
  const s = useAcademy();
  const courses = COURSES.filter((c) => !s.hidden[c.id]);
  const mine = COURSES.filter((c) => isEnrolled(s, c.id));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs uppercase tracking-wider text-brand">Spinning Top Academy</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Learn professional fabric care, online.</h1>
          <p className="mt-3 text-ink/60">Pay once, learn at your own pace, and get a certificate when you finish. Lessons unlock as soon as you enrol.</p>
        </div>
        {mine.length > 0 && (
          <Link href={`${BASE}/my-courses/`} className="btn-ink rounded-full">
            My courses ({mine.length})
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const enrolled = isEnrolled(s, c.id);
          const prog = courseProgress(s, c);
          return (
            <Link key={c.id} href={`${BASE}/course/?c=${c.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/10] overflow-hidden bg-tint">
                <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-semibold text-ink">{c.level}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{c.title}</h2>
                <p className="mt-1.5 flex-1 text-sm text-ink/60">{c.tagline}</p>
                <p className="mt-4 text-xs text-ink/50">
                  {lessonsOf(c).length} lessons · {formatMinutes(courseMinutes(c))} · {c.access} access
                </p>
                {enrolled ? (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-ink/60">
                      <span>Enrolled</span>
                      <span>{prog.pct}%</span>
                    </div>
                    <Bar pct={prog.pct} className="mt-1.5" />
                  </div>
                ) : (
                  <p className="mt-4 font-display text-xl font-semibold text-ink">{formatNaira(priceOf(s, c))}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── course page ───────────────────────── */

export function CoursePage() {
  const params = useSearchParams();
  const router = useRouter();
  const s = useAcademy();
  const c = findCourse(params.get("c"));
  const [paying, setPaying] = useState(false);
  if (!c || s.hidden[c.id]) return <NotFound />;
  const enrolled = isEnrolled(s, c.id);
  const prog = courseProgress(s, c);
  const first = lessonsOf(c)[0];
  const resume = s.last[c.id] ?? first.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href={`${BASE}/`} className="text-sm font-semibold text-brand">
        ← All courses
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-brand">{c.level}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-ink/65">{c.description}</p>

          <div className="mt-8 rounded-2xl border border-ink/10 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">What you&apos;ll learn</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {c.outcomes.map((o) => (
                <li key={o} className="flex gap-2 text-sm text-ink/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Course content</h2>
          <p className="mt-1 text-sm text-ink/55">
            {c.modules.length} sections · {lessonsOf(c).length} lessons · {formatMinutes(courseMinutes(c))}
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10">
            {c.modules.map((m, i) => (
              <div key={m.title} className={i ? "border-t border-ink/10" : ""}>
                <p className="bg-[#f6f7fb] px-5 py-3 text-sm font-semibold text-ink">{m.title}</p>
                <ul>
                  {m.lessons.map((l) => {
                    const open = enrolled || l.free;
                    const done = !!s.completed[l.id];
                    const row = (
                      <>
                        <KindIcon kind={l.kind} className="h-4 w-4 shrink-0 text-ink/45" />
                        <span className="flex-1">{l.title}</span>
                        {l.free && !enrolled && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-[#a65a00]">Free preview</span>}
                        {done && <span className="text-xs font-semibold text-emerald-700">✓ Done</span>}
                        <span className="w-14 text-right text-xs text-ink/45">{l.minutes} min</span>
                        {!open && <Lock className="h-4 w-4 text-ink/35" />}
                      </>
                    );
                    return (
                      <li key={l.id} className="border-t border-ink/[0.06] first:border-0">
                        {open ? (
                          <Link href={`${BASE}/learn/?c=${c.id}&l=${l.id}`} className="flex items-center gap-3 px-5 py-3 text-sm text-ink/80 hover:bg-tint">
                            {row}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 px-5 py-3 text-sm text-ink/50">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-sm lg:sticky lg:top-6">
          <div className="relative aspect-[16/10] bg-tint">
            <Image src={c.image} alt="" fill sizes="22rem" className="object-cover" />
          </div>
          <div className="p-5">
            {enrolled ? (
              <>
                <p className="text-sm font-semibold text-ink">Your progress</p>
                <Bar pct={prog.pct} className="mt-2" />
                <p className="mt-1.5 text-xs text-ink/55">
                  {prog.done} of {prog.total} lessons complete
                </p>
                <Link href={`${BASE}/learn/?c=${c.id}&l=${resume}`} className="btn-primary mt-5 w-full rounded-full">
                  {prog.done ? "Continue learning" : "Start course"}
                </Link>
                {prog.pct === 100 && (
                  <Link href={`${BASE}/certificate/?c=${c.id}`} className="btn-ghost mt-2 w-full rounded-full">
                    View certificate
                  </Link>
                )}
              </>
            ) : (
              <>
                <p className="font-display text-3xl font-semibold text-ink">{formatNaira(priceOf(s, c))}</p>
                <p className="mt-1 text-xs text-ink/55">One-time payment · {c.access} access · certificate on completion</p>
                <button type="button" onClick={() => setPaying(true)} className="btn-primary mt-5 w-full cursor-pointer rounded-full">
                  Enrol now
                </button>
                {first.free && (
                  <Link href={`${BASE}/learn/?c=${c.id}&l=${first.id}`} className="btn-ghost mt-2 w-full rounded-full">
                    Watch free preview
                  </Link>
                )}
              </>
            )}
            <ul className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-xs text-ink/60">
              <li>✓ {lessonsOf(c).filter((l) => l.kind === "video").length} video lessons</li>
              <li>✓ Downloadable guides</li>
              <li>✓ Quizzes to check your learning</li>
              <li>✓ Spinning Top certificate</li>
            </ul>
          </div>
        </aside>
      </div>

      {paying && (
        <PayModal
          course={c}
          amount={priceOf(s, c)}
          onClose={() => setPaying(false)}
          onPaid={() => {
            enrol(c);
            setPaying(false);
            toast("Payment received — you're enrolled!");
            router.push(`${BASE}/learn/?c=${c.id}&l=${first.id}`);
          }}
        />
      )}
    </div>
  );
}

function PayModal({ course, amount, onClose, onPaid }: { course: Course; amount: number; onClose: () => void; onPaid: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label="Demo payment">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0ba4db]">Paystack · demo</p>
        <p className="mt-3 text-sm text-ink/60">{course.title}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink">{formatNaira(amount)}</p>
        <p className="mt-3 rounded-xl bg-tint p-3 text-xs text-ink/65">
          In the real academy this opens Paystack&apos;s secure page. In this prototype no money moves — tap pay to see what happens next.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setTimeout(onPaid, 900);
          }}
          className="mt-5 w-full cursor-pointer rounded-full bg-[#0ba4db] px-4 py-3 text-sm font-bold text-paper disabled:opacity-60"
        >
          {busy ? "Confirming payment…" : `Pay ${formatNaira(amount)}`}
        </button>
        <button type="button" onClick={onClose} disabled={busy} className="mt-2 w-full cursor-pointer py-2 text-sm font-semibold text-ink/55">
          Cancel
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="font-display text-xl font-semibold text-ink">Course not found</p>
      <Link href={`${BASE}/`} className="btn-primary mt-6 rounded-full">
        See all courses
      </Link>
    </div>
  );
}

/* ───────────────────────── lesson player ───────────────────────── */

export function Learn() {
  const params = useSearchParams();
  const s = useAcademy();
  const c = findCourse(params.get("c"));
  const all = c ? lessonsOf(c) : [];
  const lesson = all.find((l) => l.id === params.get("l")) ?? all[0];
  const enrolled = c ? isEnrolled(s, c.id) : false;
  const allowed = !!lesson && (enrolled || !!lesson.free);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (c && lesson && allowed) openLesson(c, lesson);
  }, [c, lesson, allowed]);

  if (!c || !lesson) return <NotFound />;
  const i = all.indexOf(lesson);
  const next = all[i + 1];
  const prev = all[i - 1];
  const prog = courseProgress(s, c);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`${BASE}/course/?c=${c.id}`} className="text-sm font-semibold text-brand">
          ← {c.title}
        </Link>
        {enrolled && (
          <div className="flex w-full items-center gap-3 sm:w-64">
            <Bar pct={prog.pct} className="flex-1" />
            <span className="text-xs font-semibold text-ink/60">{prog.pct}%</span>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0">
          {!allowed ? (
            <LockedLesson course={c} />
          ) : lesson.kind === "video" ? (
            <VideoLesson key={lesson.id} lesson={lesson} watched={s.watched[lesson.id] ?? 0} />
          ) : lesson.kind === "pdf" ? (
            <PdfLesson lesson={lesson} done={!!s.completed[lesson.id]} />
          ) : (
            <QuizLesson key={lesson.id} lesson={lesson} best={s.quiz[lesson.id]} />
          )}

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-ink/50">
                Lesson {i + 1} of {all.length} · {KIND_LABEL[lesson.kind]} · {lesson.minutes} min
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{lesson.title}</h1>
            </div>
            {allowed && enrolled && lesson.kind !== "quiz" && (
              <button
                type="button"
                onClick={() => {
                  completeLesson(lesson);
                  toast("Lesson marked complete");
                }}
                disabled={!!s.completed[lesson.id]}
                className="cursor-pointer rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:cursor-default disabled:opacity-70"
              >
                {s.completed[lesson.id] ? "✓ Completed" : "Mark complete"}
              </button>
            )}
          </div>

          <div className="mt-6 flex justify-between gap-3 border-t border-ink/10 pt-5">
            {prev ? (
              <Link href={`${BASE}/learn/?c=${c.id}&l=${prev.id}`} className="btn-ghost rounded-full">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`${BASE}/learn/?c=${c.id}&l=${next.id}`} className="btn-primary rounded-full">
                Next lesson →
              </Link>
            ) : prog.pct === 100 ? (
              <Link href={`${BASE}/certificate/?c=${c.id}`} className="btn-primary rounded-full">
                Get certificate →
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-ink/10 bg-paper">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-ink lg:cursor-default">
            Course content
            <span className="text-ink/45 lg:hidden">{menuOpen ? "▲" : "▼"}</span>
          </button>
          <div className={`${menuOpen ? "block" : "hidden"} max-h-[70vh] overflow-y-auto border-t border-ink/10 lg:block`}>
            {c.modules.map((m) => (
              <div key={m.title}>
                <p className="bg-[#f6f7fb] px-4 py-2 text-xs font-semibold text-ink/60">{m.title}</p>
                {m.lessons.map((l) => {
                  const open = enrolled || l.free;
                  const active = l.id === lesson.id;
                  const done = !!s.completed[l.id];
                  return open ? (
                    <Link
                      key={l.id}
                      href={`${BASE}/learn/?c=${c.id}&l=${l.id}`}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${active ? "bg-brand/[0.07] font-semibold text-brand" : "text-ink/75 hover:bg-tint"}`}
                    >
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${done ? "border-emerald-500 bg-emerald-500 text-paper" : "border-ink/25"}`}>{done ? "✓" : ""}</span>
                      <span className="flex-1">{l.title}</span>
                      <span className="text-[11px] text-ink/40">{l.minutes}m</span>
                    </Link>
                  ) : (
                    <div key={l.id} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink/40">
                      <Lock className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{l.title}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LockedLesson({ course }: { course: Course }) {
  return (
    <div className="grid aspect-video place-items-center rounded-2xl bg-ink p-6 text-center text-paper">
      <div>
        <Lock className="mx-auto h-10 w-10 text-paper/70" />
        <p className="mt-3 font-display text-xl font-semibold">This lesson is for enrolled students</p>
        <p className="mt-1 text-sm text-paper/65">Enrol to unlock every lesson, guide and quiz.</p>
        <Link href={`${BASE}/course/?c=${course.id}`} className="mt-5 inline-flex rounded-full bg-paper px-5 py-2.5 text-sm font-bold text-ink">
          Enrol in this course
        </Link>
      </div>
    </div>
  );
}

/** Pretend video: plays a fake timeline so watch-tracking can be shown. */
function VideoLesson({ lesson, watched }: { lesson: Lesson; watched: number }) {
  const [pos, setPos] = useState(watched >= 100 ? 0 : watched);
  const [playing, setPlaying] = useState(false);
  const posRef = useRef(pos);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const next = Math.min(100, posRef.current + 2);
      posRef.current = next;
      setPos(next);
      setWatched(lesson, next);
      if (next >= 100) {
        setPlaying(false);
        completeLesson(lesson);
        toast("Video finished — lesson complete");
      }
    }, 250);
    return () => clearInterval(t);
  }, [playing, lesson]);

  const total = lesson.minutes * 60;
  const at = Math.round((pos / 100) * total);
  const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#0d0f1a] text-paper">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,254,0.35),transparent_60%)]" />
      {/* Watermark: the real academy prints the student's email so leaked recordings can be traced. */}
      <p className="pointer-events-none absolute right-4 top-4 select-none text-[11px] font-semibold text-paper/30">{ME.email}</p>
      <button
        type="button"
        onClick={() => {
          if (posRef.current >= 100) {
            posRef.current = 0;
            setPos(0);
          }
          setPlaying((v) => !v);
        }}
        aria-label={playing ? "Pause" : "Play"}
        className="absolute inset-0 grid cursor-pointer place-items-center"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-paper/95 text-ink shadow-xl transition-transform hover:scale-105">
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            </svg>
          ) : (
            <KindIcon kind="video" className="ml-1 h-7 w-7" />
          )}
        </span>
      </button>
      <p className="pointer-events-none absolute left-4 top-4 text-xs font-semibold text-paper/70">Demo video · {lesson.title}</p>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-paper/25">
          <div className="h-full bg-accent transition-all" style={{ width: `${pos}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-paper/75">
          <span>
            {clock(at)} / {clock(total)}
          </span>
          <span>Watched {Math.max(watched, Math.round(pos))}% · tracked</span>
        </div>
      </div>
    </div>
  );
}

function PdfLesson({ lesson, done }: { lesson: Lesson; done: boolean }) {
  return (
    <div className="grid aspect-video place-items-center rounded-2xl border border-ink/10 bg-tint p-6 text-center">
      <div>
        <KindIcon kind="pdf" className="mx-auto h-12 w-12 text-brand" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">{lesson.title}</p>
        <p className="mt-1 text-sm text-ink/55">PDF guide · download to keep</p>
        <button
          type="button"
          onClick={() => {
            completeLesson(lesson);
            toast("Download tracked (demo — no file in the prototype)");
          }}
          className="btn-primary mt-5 cursor-pointer rounded-full"
        >
          {done ? "Download again" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

function QuizLesson({ lesson, best }: { lesson: Lesson; best?: number }) {
  const qs = lesson.quiz ?? [];
  const [answers, setAnswers] = useState<number[]>(() => qs.map(() => -1));
  const [score, setScore] = useState<number | null>(null);
  const submit = () => {
    const right = qs.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((right / qs.length) * 100);
    setScore(pct);
    saveQuiz(lesson, pct);
    toast(pct >= 50 ? `Passed with ${pct}%` : `${pct}% — try again to pass`, pct >= 50);
  };
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">Quiz · pass mark 50%</p>
        {best !== undefined && <span className="rounded-full bg-tint px-3 py-1 text-xs font-semibold text-brand">Best score: {best}%</span>}
      </div>
      <ol className="mt-5 space-y-6">
        {qs.map((q, i) => (
          <li key={q.q}>
            <p className="text-sm font-semibold text-ink">
              {i + 1}. {q.q}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, j) => {
                const picked = answers[i] === j;
                const show = score !== null;
                const tone = show && j === q.answer ? "border-emerald-400 bg-emerald-50" : show && picked ? "border-red-300 bg-red-50" : picked ? "border-brand bg-brand/[0.06]" : "border-ink/15";
                return (
                  <label key={o} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${tone}`}>
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={picked}
                      disabled={show}
                      onChange={() => setAnswers((a) => a.map((v, k) => (k === i ? j : v)))}
                      className="accent-brand"
                    />
                    {o}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {score === null ? (
        <button type="button" disabled={answers.includes(-1)} onClick={submit} className="btn-primary mt-6 cursor-pointer rounded-full">
          Submit answers
        </button>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className={`text-sm font-semibold ${score >= 50 ? "text-emerald-700" : "text-red-700"}`}>
            You scored {score}% {score >= 50 ? "— passed" : "— not passed yet"}
          </p>
          <button
            type="button"
            onClick={() => {
              setAnswers(qs.map(() => -1));
              setScore(null);
            }}
            className="btn-ghost cursor-pointer rounded-full"
          >
            Retake quiz
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── my courses ───────────────────────── */

export function MyCourses() {
  const s = useAcademy();
  const mine = COURSES.filter((c) => isEnrolled(s, c.id));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">My courses</h1>
      <p className="mt-1 text-sm text-ink/55">Signed in as {ME.email} (demo)</p>
      {!mine.length ? (
        <div className="mt-8 rounded-2xl border border-ink/10 p-8 text-center">
          <p className="font-semibold text-ink">You haven&apos;t enrolled in a course yet.</p>
          <Link href={`${BASE}/`} className="btn-primary mt-5 rounded-full">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {mine.map((c) => {
            const p = courseProgress(s, c);
            const resume = s.last[c.id] ?? lessonsOf(c)[0].id;
            const lastTitle = lessonsOf(c).find((l) => l.id === resume)?.title;
            return (
              <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-ink/10 p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-tint sm:w-44">
                  <Image src={c.image} alt="" fill sizes="11rem" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold text-ink">{c.title}</p>
                  <p className="mt-0.5 text-xs text-ink/55">Up next: {lastTitle}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Bar pct={p.pct} className="flex-1" />
                    <span className="text-xs font-semibold text-ink/60">{p.pct}%</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Link href={`${BASE}/learn/?c=${c.id}&l=${resume}`} className="btn-primary flex-1 rounded-full">
                    {p.done ? "Continue" : "Start"}
                  </Link>
                  {p.pct === 100 && (
                    <Link href={`${BASE}/certificate/?c=${c.id}`} className="btn-ghost flex-1 rounded-full">
                      Certificate
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── certificate ───────────────────────── */

export function Certificate() {
  const params = useSearchParams();
  const s = useAcademy();
  const c = findCourse(params.get("c"));
  if (!c) return <NotFound />;
  const p = courseProgress(s, c);
  const doneAt = Math.max(0, ...lessonsOf(c).map((l) => s.completed[l.id] ?? 0));
  if (p.pct < 100)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-xl font-semibold text-ink">Finish the course to unlock your certificate</p>
        <p className="mt-2 text-sm text-ink/55">
          {p.done} of {p.total} lessons complete.
        </p>
        <Link href={`${BASE}/course/?c=${c.id}`} className="btn-primary mt-6 rounded-full">
          Back to course
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border-[10px] border-double border-brand/70 bg-paper p-8 text-center shadow-sm sm:p-14">
        <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="mx-auto h-12 w-auto" />
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-accent">Certificate of completion</p>
        <p className="mt-6 text-sm text-ink/55">This certifies that</p>
        <p className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">Demo Student</p>
        <p className="mt-4 text-sm text-ink/55">has successfully completed</p>
        <p className="mt-2 font-display text-xl font-semibold text-brand sm:text-2xl">{c.title}</p>
        <p className="mt-6 text-xs text-ink/50">
          {formatMinutes(courseMinutes(c))} of training · completed{" "}
          {new Date(doneAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} · ID ST-DEMO-{c.id.slice(0, 4).toUpperCase()}
        </p>
        <p className="mt-10 text-sm font-semibold text-ink">Spinning Top Academy</p>
      </div>
      <div className="mt-6 flex justify-center gap-3 print:hidden">
        <button type="button" onClick={() => window.print()} className="btn-primary cursor-pointer rounded-full">
          Download / print
        </button>
        <Link href={`${BASE}/my-courses/`} className="btn-ghost rounded-full">
          My courses
        </Link>
      </div>
    </div>
  );
}
