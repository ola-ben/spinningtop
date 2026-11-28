"use client";

import { useSyncExternalStore } from "react";

/* Academy PROTOTYPE (/academy-preview) — demo data only.
   Nothing here touches Supabase, Paystack or video hosting. The visitor's own
   clicks (enrol, watch, quiz, admin edits) are kept in this browser's
   localStorage so the client can click through and see tracking work. */

export type LessonKind = "video" | "pdf" | "quiz";
export type QuizQuestion = { q: string; options: string[]; answer: number };
export type Lesson = { id: string; title: string; kind: LessonKind; minutes: number; free?: boolean; quiz?: QuizQuestion[] };
export type Module = { title: string; lessons: Lesson[] };
export type Course = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  instructor: string;
  access: string;
  modules: Module[];
  outcomes: string[];
};

const quizBasics: QuizQuestion[] = [
  { q: "What should you always check before cleaning a garment?", options: ["The colour", "The care label", "The brand", "The price"], answer: 1 },
  { q: "Which solvent is most common in modern dry cleaning?", options: ["Water", "Bleach", "Hydrocarbon", "Vinegar"], answer: 2 },
  { q: "Why test a hidden area first?", options: ["To save time", "To check for colour run or damage", "It is the law", "To warm the fabric"], answer: 1 },
];
const quizStains: QuizQuestion[] = [
  { q: "Blood stains should be treated with…", options: ["Hot water", "Cold water", "Iron heat", "Bleach first"], answer: 1 },
  { q: "Oil-based stains need…", options: ["A solvent or degreaser", "Only water", "Salt", "Sunlight"], answer: 0 },
  { q: "When removing a stain you should…", options: ["Rub hard", "Blot from the outside in", "Scrub in circles", "Use a brush first"], answer: 1 },
];
const quizBusiness: QuizQuestion[] = [
  { q: "The biggest running cost for most laundries is usually…", options: ["Detergent", "Labour and power", "Hangers", "Bags"], answer: 1 },
  { q: "A good pricing method starts from…", options: ["Competitor prices only", "Your cost per item plus margin", "Guessing", "Customer budget"], answer: 1 },
];

export const COURSES: Course[] = [
  {
    id: "dry-cleaning-fundamentals",
    title: "Professional Dry Cleaning Fundamentals",
    tagline: "Clean, press and finish garments to a professional standard.",
    description:
      "A complete beginner course on how a professional dry cleaner works: reading care labels, sorting, cleaning methods, pressing and finishing, and handing back a garment the customer is proud of.",
    price: 45000,
    level: "Beginner",
    image: "/images/photos/home-workshop.jpg",
    instructor: "Spinning Top Academy",
    access: "6 months",
    outcomes: ["Read any care label with confidence", "Choose the right cleaning method", "Press shirts, suits and native wear neatly", "Run quality checks before hand-back"],
    modules: [
      {
        title: "Getting started",
        lessons: [
          { id: "dcf-1", title: "Welcome and how this course works", kind: "video", minutes: 4, free: true },
          { id: "dcf-2", title: "Reading care labels", kind: "video", minutes: 12 },
          { id: "dcf-3", title: "Care label cheat sheet", kind: "pdf", minutes: 5 },
        ],
      },
      {
        title: "Cleaning methods",
        lessons: [
          { id: "dcf-4", title: "Sorting garments the right way", kind: "video", minutes: 10 },
          { id: "dcf-5", title: "Dry cleaning vs wet cleaning", kind: "video", minutes: 14 },
          { id: "dcf-6", title: "Quiz: cleaning basics", kind: "quiz", minutes: 5, quiz: quizBasics },
        ],
      },
      {
        title: "Pressing and finishing",
        lessons: [
          { id: "dcf-7", title: "Pressing shirts and trousers", kind: "video", minutes: 16 },
          { id: "dcf-8", title: "Finishing native wear and suits", kind: "video", minutes: 18 },
          { id: "dcf-9", title: "Quality check before hand-back", kind: "video", minutes: 8 },
        ],
      },
    ],
  },
  {
    id: "stain-removal",
    title: "Stain Removal Masterclass",
    tagline: "Remove the stains other cleaners give up on.",
    description: "Hands-on methods for the stains you see every day — oil, blood, ink, wine, sweat and rust — and how to treat them without damaging the fabric.",
    price: 25000,
    level: "Intermediate",
    image: "/images/photos/home-garments-rail.jpg",
    instructor: "Spinning Top Academy",
    access: "6 months",
    outcomes: ["Identify a stain by type", "Pick the right chemical and method", "Avoid colour run and fabric damage"],
    modules: [
      {
        title: "Know your stains",
        lessons: [
          { id: "sr-1", title: "The four stain families", kind: "video", minutes: 9, free: true },
          { id: "sr-2", title: "Spotting board and tools", kind: "video", minutes: 11 },
        ],
      },
      {
        title: "Treatments",
        lessons: [
          { id: "sr-3", title: "Oil and grease", kind: "video", minutes: 13 },
          { id: "sr-4", title: "Blood, sweat and protein stains", kind: "video", minutes: 12 },
          { id: "sr-5", title: "Stain chart (download)", kind: "pdf", minutes: 4 },
          { id: "sr-6", title: "Quiz: stain treatments", kind: "quiz", minutes: 5, quiz: quizStains },
        ],
      },
    ],
  },
  {
    id: "laundry-business",
    title: "Starting a Laundry Business",
    tagline: "Plan, price and run a profitable laundry in Nigeria.",
    description: "From choosing a location and equipment to pricing, staff and getting your first 100 customers. Built from how Spinning Top runs its own outlets.",
    price: 60000,
    level: "Beginner",
    image: "/images/photos/home-folded-laundry.jpg",
    instructor: "Spinning Top Academy",
    access: "Lifetime",
    outcomes: ["Work out your start-up budget", "Set prices that make a profit", "Hire and train staff", "Win and keep customers"],
    modules: [
      {
        title: "Planning",
        lessons: [
          { id: "lb-1", title: "Is a laundry business right for you?", kind: "video", minutes: 7, free: true },
          { id: "lb-2", title: "Location, equipment and budget", kind: "video", minutes: 15 },
          { id: "lb-3", title: "Start-up budget template", kind: "pdf", minutes: 6 },
        ],
      },
      {
        title: "Running it",
        lessons: [
          { id: "lb-4", title: "Pricing for profit", kind: "video", minutes: 14 },
          { id: "lb-5", title: "Staff, shifts and training", kind: "video", minutes: 12 },
          { id: "lb-6", title: "Quiz: business basics", kind: "quiz", minutes: 4, quiz: quizBusiness },
        ],
      },
    ],
  },
];

export const lessonsOf = (c: Course) => c.modules.flatMap((m) => m.lessons);
export const courseMinutes = (c: Course) => lessonsOf(c).reduce((n, l) => n + l.minutes, 0);
export const findCourse = (id: string | null) => COURSES.find((c) => c.id === id) ?? null;
export const formatMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m} min`);

/* ───────────────────────── the visitor's own demo progress ───────────────────────── */

export const ME = { id: "me", name: "You (demo student)", email: "demo.student@example.com" };

export type Activity = { at: number; text: string };
type State = {
  enrolled: Record<string, number>; // courseId → enrolled at
  watched: Record<string, number>; // lessonId → % watched
  completed: Record<string, number>; // lessonId → completed at
  quiz: Record<string, number>; // lessonId → best score %
  last: Record<string, string>; // courseId → last lesson id
  activity: Activity[];
  hidden: Record<string, boolean>; // admin: courseId unpublished
  prices: Record<string, number>; // admin: price overrides
  revoked: Record<string, boolean>; // admin: studentId:courseId access removed
};

const KEY = "st-academy-preview-v1";
const EMPTY: State = { enrolled: {}, watched: {}, completed: {}, quiz: {}, last: {}, activity: [], hidden: {}, prices: {}, revoked: {} };
let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* private mode — progress just isn't remembered */
  }
}
function save(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function useAcademy() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => EMPTY,
  );
}

const log = (s: State, text: string): Activity[] => [{ at: Date.now(), text }, ...s.activity].slice(0, 60);

export const priceOf = (s: State, c: Course) => s.prices[c.id] ?? c.price;
export const isEnrolled = (s: State, courseId: string) => !!s.enrolled[courseId] && !s.revoked[`me:${courseId}`];

export function enrol(c: Course) {
  save({ ...state, enrolled: { ...state.enrolled, [c.id]: Date.now() }, activity: log(state, `Paid and enrolled in “${c.title}”`) });
}
export function openLesson(c: Course, l: Lesson) {
  if (state.last[c.id] === l.id) return;
  save({ ...state, last: { ...state.last, [c.id]: l.id }, activity: log(state, `Opened “${l.title}”`) });
}
export function setWatched(l: Lesson, pct: number) {
  const prev = state.watched[l.id] ?? 0;
  if (pct <= prev) return;
  save({ ...state, watched: { ...state.watched, [l.id]: Math.min(100, Math.round(pct)) } });
}
export function completeLesson(l: Lesson) {
  if (state.completed[l.id]) return;
  save({ ...state, completed: { ...state.completed, [l.id]: Date.now() }, activity: log(state, `Completed “${l.title}”`) });
}
export function saveQuiz(l: Lesson, score: number) {
  const best = Math.max(score, state.quiz[l.id] ?? 0);
  save({
    ...state,
    quiz: { ...state.quiz, [l.id]: best },
    completed: score >= 50 ? { ...state.completed, [l.id]: state.completed[l.id] ?? Date.now() } : state.completed,
    activity: log(state, `Scored ${score}% on “${l.title}”`),
  });
}
export function resetDemo() {
  save({ ...EMPTY, hidden: state.hidden, prices: state.prices });
}
/* admin */
export function setHidden(courseId: string, hidden: boolean) {
  save({ ...state, hidden: { ...state.hidden, [courseId]: hidden } });
}
export function setPrice(courseId: string, price: number) {
  save({ ...state, prices: { ...state.prices, [courseId]: price } });
}
export function setRevoked(studentId: string, courseId: string, revoked: boolean) {
  save({ ...state, revoked: { ...state.revoked, [`${studentId}:${courseId}`]: revoked } });
}

export function courseProgress(s: State, c: Course) {
  const ls = lessonsOf(c);
  const done = ls.filter((l) => s.completed[l.id]).length;
  return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
}

/* ───────────────────────── demo students (admin view) ───────────────────────── */

export type Enrolment = { courseId: string; enrolledAt: string; progress: number; quizAvg: number | null; watchMinutes: number; lastActive: string };
export type Student = { id: string; name: string; email: string; phone: string; enrolments: Enrolment[]; activity: { at: string; text: string }[] };

const d = (daysAgo: number, h = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - daysAgo);
  t.setHours(h, (daysAgo * 17) % 60, 0, 0);
  return t.toISOString();
};

export const STUDENTS: Student[] = [
  {
    id: "s1", name: "Adaeze Okonkwo", email: "adaeze.o@example.com", phone: "0803 000 1101",
    enrolments: [
      { courseId: "dry-cleaning-fundamentals", enrolledAt: d(24), progress: 100, quizAvg: 92, watchMinutes: 96, lastActive: d(1, 19) },
      { courseId: "stain-removal", enrolledAt: d(9), progress: 50, quizAvg: null, watchMinutes: 31, lastActive: d(0, 9) },
    ],
    activity: [
      { at: d(0, 9), text: "Watched 80% of “Oil and grease”" },
      { at: d(1, 19), text: "Downloaded certificate — Dry Cleaning Fundamentals" },
      { at: d(1, 18), text: "Completed “Quality check before hand-back”" },
      { at: d(3, 20), text: "Scored 92% on “Quiz: cleaning basics”" },
    ],
  },
  {
    id: "s2", name: "Tunde Bakare", email: "tunde.b@example.com", phone: "0805 000 2202",
    enrolments: [{ courseId: "laundry-business", enrolledAt: d(15), progress: 67, quizAvg: 50, watchMinutes: 41, lastActive: d(2, 21) }],
    activity: [
      { at: d(2, 21), text: "Scored 50% on “Quiz: business basics” (retake available)" },
      { at: d(4, 20), text: "Completed “Pricing for profit”" },
      { at: d(6, 8), text: "Downloaded “Start-up budget template”" },
    ],
  },
  {
    id: "s3", name: "Fatima Sule", email: "fatima.s@example.com", phone: "0812 000 3303",
    enrolments: [{ courseId: "dry-cleaning-fundamentals", enrolledAt: d(30), progress: 22, quizAvg: null, watchMinutes: 16, lastActive: d(19, 14) }],
    activity: [
      { at: d(19, 14), text: "Watched 40% of “Sorting garments the right way”" },
      { at: d(28, 12), text: "Completed “Reading care labels”" },
    ],
  },
  {
    id: "s4", name: "Chinedu Eze", email: "chinedu.e@example.com", phone: "0701 000 4404",
    enrolments: [
      { courseId: "stain-removal", enrolledAt: d(5), progress: 83, quizAvg: 100, watchMinutes: 45, lastActive: d(0, 13) },
      { courseId: "laundry-business", enrolledAt: d(5), progress: 17, quizAvg: null, watchMinutes: 7, lastActive: d(3, 22) },
    ],
    activity: [
      { at: d(0, 13), text: "Scored 100% on “Quiz: stain treatments”" },
      { at: d(1, 12), text: "Completed “Blood, sweat and protein stains”" },
      { at: d(3, 22), text: "Opened “Is a laundry business right for you?”" },
    ],
  },
  {
    id: "s5", name: "Blessing Adeyemi", email: "blessing.a@example.com", phone: "0816 000 5505",
    enrolments: [{ courseId: "dry-cleaning-fundamentals", enrolledAt: d(2), progress: 0, quizAvg: null, watchMinutes: 0, lastActive: d(2, 16) }],
    activity: [{ at: d(2, 16), text: "Paid and enrolled in “Professional Dry Cleaning Fundamentals”" }],
  },
  {
    id: "s6", name: "Ibrahim Musa", email: "ibrahim.m@example.com", phone: "0909 000 6606",
    enrolments: [{ courseId: "laundry-business", enrolledAt: d(40), progress: 100, quizAvg: 100, watchMinutes: 58, lastActive: d(12, 11) }],
    activity: [
      { at: d(12, 11), text: "Downloaded certificate — Starting a Laundry Business" },
      { at: d(12, 10), text: "Scored 100% on “Quiz: business basics”" },
    ],
  },
  {
    id: "s7", name: "Kemi Olatunji", email: "kemi.o@example.com", phone: "0802 000 7707",
    enrolments: [{ courseId: "stain-removal", enrolledAt: d(11), progress: 33, quizAvg: null, watchMinutes: 20, lastActive: d(8, 20) }],
    activity: [{ at: d(8, 20), text: "Completed “Spotting board and tools”" }],
  },
];

/** Students with no activity for this many days are flagged "stalled". */
export const STALL_DAYS = 7;
export const daysSince = (iso: string | number) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
export function relTime(iso: string | number) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** The visitor, as the admin sees them (live from their own clicks). */
export function meAsStudent(s: State): Student | null {
  const ids = Object.keys(s.enrolled);
  if (!ids.length) return null;
  const enrolments = ids
    .map((id) => findCourse(id))
    .filter((c): c is Course => !!c)
    .map((c) => {
      const ls = lessonsOf(c);
      const quizzes = ls.filter((l) => l.kind === "quiz" && s.quiz[l.id] !== undefined).map((l) => s.quiz[l.id]);
      const watchMinutes = Math.round(ls.reduce((n, l) => n + (l.kind === "video" ? ((s.watched[l.id] ?? 0) / 100) * l.minutes : 0), 0));
      const last = s.activity[0]?.at ?? s.enrolled[c.id];
      return {
        courseId: c.id,
        enrolledAt: new Date(s.enrolled[c.id]).toISOString(),
        progress: courseProgress(s, c).pct,
        quizAvg: quizzes.length ? Math.round(quizzes.reduce((a, b) => a + b, 0) / quizzes.length) : null,
        watchMinutes,
        lastActive: new Date(last).toISOString(),
      };
    });
  return { ...ME, phone: "—", enrolments, activity: s.activity.map((a) => ({ at: new Date(a.at).toISOString(), text: a.text })) };
}
