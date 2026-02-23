export type ElementKey = "wood" | "fire" | "earth" | "metal" | "water";

export interface ElementMeta {
  key: ElementKey;
  label: string;
  icon: string;
}

export interface ConstellationInfo {
  nameCn: string;
  nameEn: string;
  element: ElementKey;
  summary: string;
  verse: string;
}

export const ELEMENT_METAS: Record<ElementKey, ElementMeta> = {
  wood: { key: "wood", label: "Wood", icon: "W" },
  fire: { key: "fire", label: "Fire", icon: "F" },
  earth: { key: "earth", label: "Earth", icon: "E" },
  metal: { key: "metal", label: "Metal", icon: "M" },
  water: { key: "water", label: "Water", icon: "W" },
};

export const ELEMENT_SEQUENCE: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

export const CONSTELLATION_SWITCH_INTERVAL_MS = 9000;

export const CONSTELLATION_INFOS: ConstellationInfo[] = [
  {
    nameCn: "Tian Ji Track",
    nameEn: "Tian Ji",
    element: "wood",
    summary: "Strategy and judgment, highlighting rhythm and timing in relationships.",
    verse: "The star moves; clarity follows.",
  },
  {
    nameCn: "Tai Yin Track",
    nameEn: "Tai Yin",
    element: "water",
    summary: "Emotion and inner needs, mapping security and warmth over time.",
    verse: "Moonlight soft; emotions settle.",
  },
  {
    nameCn: "Zi Wei Track",
    nameEn: "Zi Wei",
    element: "earth",
    summary: "Leadership and structure, pointing to direction and core responsibilities.",
    verse: "The palace steadies; the heart finds its place.",
  },
];
