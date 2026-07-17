import { notFound } from "next/navigation";
import { characters, getCharacter } from "@/lib/characters";
import ChapterClient from "./ChapterClient";

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export default function ChapterPage({ params }: { params: { slug: string } }) {
  const character = getCharacter(params.slug);
  if (!character) notFound();
  return <ChapterClient character={character} />;
}
