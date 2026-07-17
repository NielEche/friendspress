# The Friend Group Archive

A small Next.js app in the spirit of the Stripe Press "Poor Charlie's Almanack"
reader: a table of contents, then one chapter per friend, each with a
low-poly marble bust that turns to follow your cursor. The bust is stylized
on purpose — same neutral "marble" figure for everyone, with the hair,
one shirt/collar detail, and one floating prop swapped per character so
you can tell who's who without it being a literal likeness.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

- `lib/characters.ts` — all five character definitions: name, epithet, bio
  copy, accent color, and the bust parameters (hair style/color, glasses,
  shirt color, accent detail, floating prop).
- `components/CharacterBust.tsx` — the three.js sculpture. Everything is
  built from primitives at runtime, no external models or textures. The
  `head` group is what rotates toward the pointer.
- `app/page.tsx` — the contents/list page.
- `app/chapter/[slug]/` — the per-character reading page, with the sticky
  bust on the left and scrolling bio on the right, plus a live scroll
  progress readout in the top bar.

## Extending it

To add or edit a character, just add an entry to the `characters` array in
`lib/characters.ts` — pick an accent color, a `hairStyle`
(`side-part` / `curly` / `ponytail` / `slick` / `neat`), whether they wear
glasses, an `accent` type, and a `prop` type. No changes to the 3D
component are needed for a new character that reuses existing styles; if
you want a genuinely new silhouette or prop, extend the `switch`
statements in `CharacterBust.tsx`.
