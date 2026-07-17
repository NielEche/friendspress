export type HairStyle = "side-part" | "curly" | "ponytail" | "slick" | "neat";
export type PropType = "orbit-ring" | "id-badge" | "coffee-cup" | "medallion" | "telescope";
export type AccentType =
  | "collar-block"
  | "id-badge"
  | "collar-knot"
  | "chain"
  | "vest-diamond"
  | "track-stripes"
  | "turtleneck-fold";
export type TopStyle = "tshirt" | "jacket" | "turtleneck";

export interface BustParams {
  hairStyle: HairStyle;
  hairColor: string;
  glasses: boolean;
  topStyle: TopStyle;
  topColor: string;
  topColorSecondary?: string; // for two-tone looks (e.g. red-on-red, jacket trim)
  accent: AccentType;
  prop: PropType;
}

export interface CharacterDef {
  slug: string;
  numeral: string;
  name: string;
  epithet: string;
  accent: string;
  accentDark: string;
  tell: string;
  bio: string[];
  bust: BustParams;
}

// Shared claymation material/lighting treatment applied across all busts.
// Consumed by the renderer: soft rounding on all silhouettes, mild surface
// noise so nothing reads as perfectly CAD-smooth, and a warm rim light to
// sell the handmade-set look.
export const CLAY_STYLE = {
  material: "matte" as const,
  cornerRounding: 0.35, // 0 = sharp primitives, 1 = fully blobby
  surfaceNoise: {
    enabled: true,
    amplitude: 0.06, // subtle displacement, not melty
    scale: 3.2,
  },
  asymmetryJitter: 0.04, // slight left/right imperfection per bust
  rimLight: {
    color: "#F4C77A",
    intensity: 0.6,
    angleDeg: 135,
  },
  ambientOcclusionStrength: 0.25,
};

export const characters: CharacterDef[] = [
  {
    slug: "sheldon",
    numeral: "I",
    name: "Sheldon",
    epithet: "The Theorist",
    accent: "#C0483A",
    accentDark: "#8E3227",
    tell: "Assigned seating, a whiteboard mind, and a knock that comes in threes.",
    bio: [
      "Every friend group has a self-appointed keeper of the rules, and this is his statue. He did not choose the spot on the couch so much as discover it, the way a physicist discovers a constant that was always going to be there.",
      "He treats a doorbell like an experiment worth repeating for statistical significance. Ask him a simple question and you will receive a taxonomy, a caveat, and a mild sense that you should have already known better.",
      "Underneath the precision is real devotion, delivered sideways: a spreadsheet instead of a hug, a relationship agreement instead of small talk. His friends learned to read both as the same thing.",
    ],
    bust: {
      hairStyle: "side-part",
      hairColor: "#3B3126",
      glasses: true,
      topStyle: "tshirt",
      topColor: "#D8352A", // red tee
      accent: "collar-block",
      prop: "orbit-ring",
    },
  },
  {
    slug: "leonard",
    numeral: "II",
    name: "Leonard",
    epithet: "The Experimentalist",
    accent: "#3E5C76",
    accentDark: "#2A4054",
    tell: "The reasonable one, right up until the moment he isn't.",
    bio: [
      "Someone has to be the diplomat of the group, translating between genius and general audience, and that job fell to him early and never quite let go.",
      "He is the one who actually asks how your day was, remembers the answer, and shows up with soup. His patience is not infinite, but it is impressively renewable.",
      "Ambitious in the lab, tentative everywhere else, he spent years working up the nerve to talk to the woman across the hall — proof that even careful people leave some things to chance.",
    ],
    bust: {
      hairStyle: "side-part",
      hairColor: "#4A3626",
      glasses: true,
      topStyle: "jacket",
      topColor: "#6B4A30", // brown jacket
      accent: "id-badge",
      prop: "id-badge",
    },
  },
  {
    slug: "penny",
    numeral: "III",
    name: "Penny",
    epithet: "The Newcomer",
    accent: "#C77B4A",
    accentDark: "#96572F",
    tell: "Moved in across the hall and rearranged the furniture of everyone's life.",
    bio: [
      "She arrived with two suitcases and left with an honorary physics vocabulary she never asked for and mostly tolerates. Every group needs one person who says the thing everyone else is only thinking.",
      "Underestimated more than once for the wrong reasons, she built a life on hustle, timing, and the specific bravery required to move to a new city knowing exactly no one.",
      "Her gift is translation in the other direction: turning a room of overthinkers back into people who remember to have fun on a Tuesday.",
    ],
    bust: {
      hairStyle: "ponytail",
      hairColor: "#C9A24B",
      glasses: false,
      topStyle: "tshirt",
      topColor: "#E28FA8", // pink
      accent: "collar-knot",
      prop: "coffee-cup",
    },
  },
  {
    slug: "howard",
    numeral: "IV",
    name: "Howard",
    epithet: "The Engineer",
    accent: "#8B6F3E",
    accentDark: "#5F4A28",
    tell: "No advanced degree, no shortage of confidence, one actual trip to space.",
    bio: [
      "He built things that left the atmosphere while his friends were still finishing their dissertations, and he will absolutely bring that up again.",
      "The wardrobe reads louder than the résumé, which is exactly the point — a little armor for the one guy in the room without a doctorate to hide behind.",
      "Underneath the routine is someone who studied people as carefully as machinery, and eventually got both right.",
    ],
    bust: {
      hairStyle: "slick",
      hairColor: "#1F1B16",
      glasses: false,
      topStyle: "turtleneck",
      topColor: "#A32A2A", // red turtleneck
      topColorSecondary: "#7A1D1D", // darker red overlay/trim, still red-on-red
      accent: "turtleneck-fold",
      prop: "medallion",
    },
  },
  {
    slug: "raj",
    numeral: "V",
    name: "Raj",
    epithet: "The Astrophysicist",
    accent: "#4A5B7A",
    accentDark: "#31405A",
    tell: "Can describe a galaxy in detail, could not, for a long time, describe his feelings out loud to a woman in the room.",
    bio: [
      "He studies distances of unimaginable scale for a living and spent years struggling with the six feet between himself and easy conversation.",
      "The sharpest dresser of the group and the softest heart, he narrates the night sky the way other people narrate sports, with total, unembarrassed devotion.",
      "His arc is the quiet one: less about a single dramatic leap, more about slowly turning the volume up on his own voice until the room finally heard it.",
    ],
    bust: {
      hairStyle: "neat",
      hairColor: "#241A12",
      glasses: false,
      topStyle: "jacket",
      topColor: "#1E2A3D", // navy track jacket base
      topColorSecondary: "#FFFFFF", // white stripes
      accent: "track-stripes",
      prop: "telescope",
    },
  },
];

export function getCharacter(slug: string) {
  return characters.find((c) => c.slug === slug);
}