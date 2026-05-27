/**
 * BaZi Element constants and pair content generator
 * Used by ElementCompatibility.tsx for 25 programmatic SEO pages
 */

export const ELEMENTS = ["wood", "fire", "earth", "metal", "water"] as const;
export type Element = (typeof ELEMENTS)[number];

export const ELEMENT_LABELS: Record<Element, string> = {
  wood: "Wood",
  fire: "Fire",
  earth: "Earth",
  metal: "Metal",
  water: "Water",
};

export const ELEMENT_CHINESE: Record<Element, string> = {
  wood: "Wood (木, Mù)",
  fire: "Fire (火, Huǒ)",
  earth: "Earth (土, Tǔ)",
  metal: "Metal (金, Jīn)",
  water: "Water (水, Shuǐ)",
};

const ELEMENT_KEYWORDS: Record<Element, string[]> = {
  wood: ["visionary", "growth", "expansion", "planning", "creative"],
  fire: ["passionate", "charismatic", "radiant", "expressive", "warm"],
  earth: ["grounded", "nurturing", "stable", "reliable", "patient"],
  metal: ["precise", "principled", "strong-willed", "structured", "refined"],
  water: ["intuitive", "deep", "wise", "adaptive", "emotional"],
};

const ELEMENT_STRENGTHS: Record<Element, string> = {
  wood: "They bring vision, ambition, and an unstoppable drive to grow. Wood personalities see the big picture and inspire others to build toward it.",
  fire: "They light up every room. Fire personalities radiate warmth, charisma, and infectious enthusiasm that draws people to them naturally.",
  earth: "They are the bedrock of any relationship. Earth personalities provide unwavering stability, patience, and nurturing care.",
  metal: "They operate with integrity and clarity. Metal personalities bring structure, high standards, and a refined sense of quality to everything they do.",
  water: "They feel everything deeply. Water personalities possess extraordinary emotional intelligence, adaptability, and profound inner wisdom.",
};

// Generative cycle: Wood → Fire → Earth → Metal → Water → Wood
export const GENERATIVE_CYCLE: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

// Controlling cycle: Wood → Earth → Water → Fire → Metal → Wood
export const CONTROLLING_CYCLE: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

const REVERSE_GENERATIVE: Record<Element, Element> = {
  fire: "wood",
  earth: "fire",
  metal: "earth",
  water: "metal",
  wood: "water",
};

const REVERSE_CONTROLLING: Record<Element, Element> = {
  earth: "wood",
  water: "earth",
  fire: "water",
  metal: "fire",
  wood: "metal",
};

export type RelationshipType = "same" | "generates" | "generated_by" | "controls" | "controlled_by";

export function getRelationship(e1: Element, e2: Element): RelationshipType {
  if (e1 === e2) return "same";
  if (GENERATIVE_CYCLE[e1] === e2) return "generates";
  if (REVERSE_GENERATIVE[e1] === e2) return "generated_by";
  if (CONTROLLING_CYCLE[e1] === e2) return "controls";
  if (REVERSE_CONTROLLING[e1] === e2) return "controlled_by";
  return "same"; // fallback (shouldn't happen with valid elements)
}

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  same: "Same Element Pair",
  generates: "Generative Cycle (Nourishing)",
  generated_by: "Generative Cycle (Nourished By)",
  controls: "Controlling Cycle (Structuring)",
  controlled_by: "Controlling Cycle (Structured By)",
};

const RELATIONSHIP_DESCRIPTIONS: Record<RelationshipType, string> = {
  same: "Two people who share the same element understand each other intuitively. They speak the same emotional language and naturally align on values and priorities. The risk is reinforcing each other's blind spots — too much of the same energy without balance.",
  generates:
    "This pair is connected through the generative (Sheng) cycle — one element naturally creates and nourishes the other. This creates a flow of mutual support where each partner helps the other grow. It is one of the most naturally harmonious pairings in BaZi.",
  generated_by:
    "This pair benefits from the generative cycle flowing toward them. Their partner's energy naturally nourishes and supports their own. This creates a sense of being understood and cared for at a fundamental level.",
  controls:
    "This pair operates through the controlling (Ke) cycle — one element naturally regulates and structures the other. This creates productive tension: the controlling partner brings discipline, while the controlled partner brings flexibility. Healthy when balanced.",
  controlled_by:
    "In this pairing, one partner's energy naturally brings structure and boundaries to the other's. The controlling partner provides stability and focus; the receiving partner brings warmth and expansiveness. This can create a powerful complementary dynamic.",
};

const RELATIONSHIP_STRENGTHS: Record<RelationshipType, string> = {
  same: "Deep intuitive understanding, shared values, natural rhythm, effortless communication.",
  generates: "Natural harmony, mutual growth, instinctive support, complementary energies that build on each other.",
  generated_by: "Being deeply understood, receiving natural support, feeling nourished by your partner's presence.",
  controls: "Productive tension, complementary structure, balanced growth, clear roles and boundaries.",
  controlled_by: "Receiving healthy structure, being grounded by your partner, learning discipline through love.",
};

const RELATIONSHIP_CHALLENGES: Record<RelationshipType, string> = {
  same: "Risk of amplifying each other's weaknesses, lack of outside perspective, potential for stagnation, difficulty breaking patterns.",
  generates: "Risk of the nourishing partner feeling drained if giving is not reciprocated. Need to maintain individual identity.",
  generated_by: "Risk of dependency or taking the supportive partner for granted. Must actively nurture the relationship.",
  controls: "The controlling partner may become domineering; the controlled partner may feel restricted. Requires conscious balance.",
  controlled_by: "Risk of resentment if structure feels like criticism. The controlling partner must lead with love, not rigidity.",
};

type PairContent = {
  title: string;
  description: string;
  keywords: string;
  relationshipSummary: string;
  strengthPoints: string;
  challengePoints: string;
  compatibilityNote: string;
  faqQuestions: { q: string; a: string }[];
};

const PAIR_CONTENT_CACHE = new Map<string, PairContent>();

export function getElementPairContent(e1: Element, e2: Element): PairContent {
  const key = `${e1}-${e2}`;
  if (PAIR_CONTENT_CACHE.has(key)) return PAIR_CONTENT_CACHE.get(key)!;

  const rel = getRelationship(e1, e2);
  const label1 = ELEMENT_LABELS[e1];
  const label2 = ELEMENT_LABELS[e2];
  const relLabel = RELATIONSHIP_LABELS[rel];
  const keywords1 = ELEMENT_KEYWORDS[e1].slice(0, 3).join(", ");
  const keywords2 = ELEMENT_KEYWORDS[e2].slice(0, 3).join(", ");

  const content: PairContent = {
    title: `${label1} and ${label2} BaZi Compatibility — ${relLabel} | Elemental Bond`,
    description: `${label1} (${ELEMENT_CHINESE[e1].split(" (")[1]?.replace(")", "") || e1}) and ${label2} (${ELEMENT_CHINESE[e2].split(" (")[1]?.replace(")", "") || e2}) in BaZi: ${RELATIONSHIP_DESCRIPTIONS[rel]} Discover strengths, challenges, and your 2026 compatibility windows.`,
    keywords: `${e1} ${e2} bazi compatibility, ${e1} element ${e2} element relationship, ${e1} ${e2} five element love match, ${e1} ${e2} chinese astrology`,
    relationshipSummary: RELATIONSHIP_DESCRIPTIONS[rel],
    strengthPoints: RELATIONSHIP_STRENGTHS[rel],
    challengePoints: RELATIONSHIP_CHALLENGES[rel],
    compatibilityNote: `A ${label1}-${label2} pairing in BaZi is a "${relLabel}" relationship through the Five Element (Wu Xing) cycle. ${RELATIONSHIP_DESCRIPTIONS[rel]}`,
    faqQuestions: [
      {
        q: `Are ${label1} and ${label2} compatible in BaZi?`,
        a: `${label1} and ${label2} form a "${relLabel}" relationship in the Five Element cycle. ${RELATIONSHIP_DESCRIPTIONS[rel]} ${ELEMENT_STRENGTHS[e1]} ${ELEMENT_STRENGTHS[e2]} Their compatibility depends on the specific balance of elements in both birth charts — enter your birth details for a personalized analysis.`,
      },
      {
        q: `What makes ${label1}-${label2} relationships unique?`,
        a: `${label1} types are ${keywords1}. ${label2} types are ${keywords2}. Together, they create a dynamic where ${rel === "same" ? "both partners naturally understand each other's core nature" : rel === "generates" ? `${label1} energy naturally nourishes and amplifies ${label2} energy` : rel === "generated_by" ? `${label2} energy naturally supports and enhances ${label1} energy` : rel === "controls" ? `${label1} energy brings structure and healthy boundaries to ${label2} energy` : `${label2} energy provides grounding direction for ${label1} energy`}. This creates a relationship dynamic that is distinct from any other elemental pairing.`,
      },
    ],
  };

  PAIR_CONTENT_CACHE.set(key, content);
  return content;
}

export function formatElement(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
