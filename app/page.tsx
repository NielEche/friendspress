import Link from "next/link";
import { characters } from "@/lib/characters";

export default function Home() {
  return (
    <main className="min-h-screen bg-page text-ink">
      <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-rule">
        <span className="font-mono text-[11px] small-caps tracking-widest text-ink/70">
          Eche&apos;s friends Press
        </span>
        <span className="font-mono text-[11px] small-caps tracking-widest text-ink/50">
          Field Guide, Vol. I
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-12">
        <p className="font-mono text-xs small-caps tracking-[0.25em] text-gold mb-5">
          Contents
        </p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4">
          The Friend Group <em className="font-normal not-italic italic">Archive</em>
        </h1>
        <p className="text-ink/70 max-w-xl leading-relaxed">
          Five chapters, five busts carved from the same block of marble, each finished
          with the one or two details that give it away. Choose a chapter to begin.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-28">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
          {characters.map((c) => (
            <Link
              key={c.slug}
              href={`/chapter/${c.slug}`}
              className="group relative aspect-square rounded-2xl border border-rule overflow-hidden flex flex-col justify-end p-4 md:p-5 transition-colors hover:border-transparent"
              style={{ backgroundColor: `${c.accent}12` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pt-10"
                style={{ backgroundColor: `${c.accent}20` }}
              />
              <div className="relative flex items-center justify-between mb-2">
                <span className="font-display italic text-lg text-ink/40">{c.numeral}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.accent }}
                />
              </div>
              <span className="relative font-display text-2xl md:text-3xl leading-tight group-hover:italic transition-all">
                {c.name}
              </span>
              <span className="relative font-mono text-[11px] small-caps tracking-widest text-ink/45 mt-1.5">
                {c.epithet}
              </span>
              <span className="relative text-sm text-ink/55 mt-2 leading-snug">
                {c.tell}
              </span>
              <span className="relative font-mono text-ink/30 group-hover:text-ink group-hover:translate-x-1 transition-all self-end mt-3">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}