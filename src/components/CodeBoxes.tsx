"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent, type RefObject } from "react";
import { CODE_LENGTH } from "@/lib/user-store";

/* One box per digit. Typing moves to the next box, Backspace goes back,
   and pasting (or the phone's "fill code from email") fills every box. */
export default function CodeBoxes({
  value,
  onChange,
  disabled,
  firstRef,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  firstRef?: RefObject<HTMLInputElement | null>;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();

  // Puts digits in from box `at` (one typed digit, or a whole pasted code).
  function fill(at: number, typed: string) {
    const digits = typed.replace(/\D/g, "");
    if (!digits) return;
    // Changing one box that already has a digit: replace just that digit.
    if (digits.length === 1 && at < value.length) {
      onChange(value.slice(0, at) + digits + value.slice(at + 1));
      focus(at + 1);
      return;
    }
    const start = digits.length >= CODE_LENGTH ? 0 : Math.min(at, value.length); // no gaps
    const next = (value.slice(0, start) + digits).slice(0, CODE_LENGTH);
    onChange(next);
    focus(next.length);
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length: CODE_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
            if (i === 0 && firstRef) firstRef.current = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          disabled={disabled}
          value={value[i] ?? ""}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            // If the box already had a digit and another was typed after it, keep the new one.
            const v = e.target.value;
            fill(i, value[i] && v.length === 2 && v.startsWith(value[i]) ? v.slice(1) : v);
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData("text"));
          }}
          className="h-14 w-full min-w-0 rounded-xl border border-ink/15 bg-paper text-center font-mono text-2xl font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60 sm:h-16"
        />
      ))}
    </div>
  );
}
