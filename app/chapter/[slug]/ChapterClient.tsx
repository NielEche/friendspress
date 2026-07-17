"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CharacterDef } from "@/lib/characters";
import { characters } from "@/lib/characters";
import CharacterBust from "@/components/CharacterBust";

export default function ChapterClient({ character }: { character: CharacterDef }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      setProgress(pct);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const idx = characters.findIndex((c) => c.slug === character.slug);
  const next = characters[(idx + 1) % characters.length];

  return (
    <main className="min-h-screen bg-page text-ink">
      {/* top chrome, echoes the reference reader's tab/progress bar */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-rule sticky top-0 bg-page/95 backdrop-blur z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="font-mono text-[11px] small-caps tracking-widest text-ink/70 shrink-0 hover:text-ink">
            ← Contents
          </Link>
          <span className="text-rule hidden sm:inline">|</span>
          <span className="font-mono text-[11px] small-caps tracking-widest text-ink/50 truncate hidden sm:inline">
            The Friend Group Archive
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[11px] small-caps tracking-widest text-ink/50">
            Chapter {character.numeral}
          </span>
          <span className="font-mono text-[11px] tabular-nums border border-rule rounded-full px-2.5 py-1 text-ink/60">
            {progress.toFixed(2)}%
          </span>
        </div>
      </div>

      <div ref={articleRef} className="grid md:grid-cols-[1fr_1.15fr]">
        {/* sculpture stage */}
        <div className="md:sticky md:top-[57px] md:h-[calc(100vh-57px)] flex flex-col items-center justify-center px-6 py-10 border-b md:border-b-0 md:border-r border-rule">
          <div className="w-full max-w-sm aspect-[4/5]">
            <CharacterBust params={character.bust} accent={character.accent} />
          </div>
          <p className="font-mono text-[10px] small-caps tracking-widest text-ink/35 mt-2">
            move your cursor
          </p>
        </div>

        {/* copy */}
        <article className="px-6 md:px-14 py-14 md:py-20 max-w-2xl">
          <p className="font-mono text-xs small-caps tracking-[0.25em] mb-5" style={{ color: character.accent }}>
            Chapter {character.numeral}
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.02] mb-1">
            {character.name}
          </h1>
          <p className="font-display italic text-2xl text-ink/50 mb-10">{character.epithet}</p>

          {character.bio.map((p, i) => (
            <p
              key={i}
              className={`text-[17px] leading-[1.85] text-ink/85 mb-6 ${i === 0 ? "drop-cap" : ""}`}
            >
              {p}
            </p>
          ))}

          <div className="mt-16 pt-8 border-t border-rule flex items-center justify-between">
            <span className="font-mono text-[11px] small-caps tracking-widest text-ink/40">
              End of chapter {character.numeral}
            </span>
            <Link
              href={`/chapter/${next.slug}`}
              className="font-mono text-[11px] small-caps tracking-widest hover:text-ink text-ink/60"
            >
              Next — {next.name} →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
