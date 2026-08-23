export type ElementName = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export type ElementProfile = {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  element: ElementName;
  description: string[];
};

const ELEMENTS: ElementName[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

const DESCRIPTIONS: Record<ElementName, string[]> = {
  Wood: ["You tend to move toward growth, possibility, and forward motion.", "In relationships, stagnation can feel more threatening than disagreement.", "You often show care by helping a person become more of who they could be.", "Your recurring tension is learning when support becomes pressure."],
  Fire: ["You tend to process life through intensity, expression, and immediate emotional truth.", "Connection feels real when it is visible, responsive, and alive.", "You often create momentum in relationships that would otherwise stay unspoken.", "Your recurring tension is separating genuine closeness from constant stimulation."],
  Earth: ["You tend to create stability by noticing what needs to be held together.", "In relationships, reliability often matters more than dramatic chemistry.", "You show care through presence, practical support, and emotional containment.", "Your recurring tension is carrying responsibility that was never actually yours."],
  Metal: ["You tend to look for clarity, standards, and a clean line through emotional noise.", "In relationships, respect and consistency are often prerequisites for vulnerability.", "You show care by being precise, dependable, and willing to name what is not working.", "Your recurring tension is protecting your boundaries without becoming unreachable."],
  Water: ["You tend to notice subtext, shifts, and possibilities before other people name them.", "In relationships, emotional depth matters more than surface-level agreement.", "You show care by adapting, listening, and making room for complexity.", "Your recurring tension is staying connected to your own needs while reading everyone else's."],
};

export function calculateElementProfile(birthDate: string, birthTime = "", birthPlace = ""): ElementProfile {
  const digits = birthDate.replace(/\D/g, "").split("").map(Number);
  const checksum = digits.reduce((sum, digit, index) => sum + digit * (index + 1), 0);
  const element = ELEMENTS[Math.abs(checksum) % ELEMENTS.length];
  return { birthDate, birthTime, birthPlace, element, description: DESCRIPTIONS[element] };
}

export const RELATIONSHIP_SUMMARIES: Record<string, string> = {
  "Wood-Wood": "You amplify each other's need for growth. The recurring tension is deciding whose direction sets the pace.",
  "Fire-Fire": "The connection can build momentum quickly. The same intensity that creates chemistry can also shorten the path to conflict.",
  "Earth-Earth": "Stability comes naturally, but unspoken obligations can accumulate until the relationship feels heavier than either person intended.",
  "Metal-Metal": "You understand each other's standards and boundaries. Repair becomes difficult when both people wait for the other to soften first.",
  "Water-Water": "Emotional subtext is rarely missed. The challenge is turning mutual sensitivity into a clear decision instead of prolonged uncertainty.",
};

export function getRelationshipSummary(first: ElementName, second: ElementName) {
  const same = RELATIONSHIP_SUMMARIES[`${first}-${second}`];
  if (same) return same;
  const cycle: Record<ElementName, ElementName> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
  if (cycle[first] === second) return `${first} naturally feeds ${second}. Support can feel effortless, but the ${first} person may eventually wonder whether the exchange is mutual.`;
  if (cycle[second] === first) return `${second} naturally feeds ${first}. Attraction builds through complementary roles, with a recurring question around who receives more energy.`;
  return `Your ${first}-${second} pattern creates productive friction: you notice different signals, move at different speeds, and repeatedly expose each other's blind spots.`;
}
