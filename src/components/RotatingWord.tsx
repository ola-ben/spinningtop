"use client";

import { useEffect, useState } from "react";

/** Cycles through words every 3s with the storefront's scroll-up-fade animation. */
export default function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 3000);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span key={index} className={`inline-block animate-scroll-up-fade ${className}`}>
      {words[index]}
    </span>
  );
}
