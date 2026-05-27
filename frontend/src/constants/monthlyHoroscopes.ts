/**
 * Monthly Horoscope Data — 5 elements × 12 months = 60 SEO pages
 * Content generated programmatically from element + month combinations.
 * Zero backend dependency — all content is compile-time constant.
 */

import { ELEMENT_LABELS, getRelationship } from "./elements";
import type { Element, RelationshipType } from "./elements";

export interface MonthInfo {
  slug: string;          // "2026-june"
  label: string;         // "June 2026"
  year: number;
  lunarMonth: number;    // 1-12 in Chinese lunar calendar
  animal: string;        // "snake", "horse", etc.
  animalElement: Element;
}

export interface MonthlyHoroscopeContent {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  loveForecast: string;
  careerForecast: string;
  healthForecast: string;
  advice: string;
  elementColor: string;
  relationshipLabel: string;
}

const MONTH_COLORS: Record<string, string> = {
  wood: "#4ade80",
  fire: "#fb7185",
  earth: "#fbbf24",
  metal: "#e0e0e0",
  water: "#60a5fa",
};

const ANIMAL_EMOJIS: Record<string, string> = {
  rat: "🐀", ox: "🐂", tiger: "🐅", rabbit: "🐇",
  dragon: "🐉", snake: "🐍", horse: "🐎", goat: "🐐",
  monkey: "🐒", rooster: "🐓", dog: "🐕", pig: "🐖",
};

/**
 * 12 months starting from June 2026
 * Lunar months mapped to approximate Gregorian months
 */
export const MONTHS: MonthInfo[] = [
  { slug: "2026-june",   label: "June 2026",   year: 2026, lunarMonth: 4,  animal: "snake",   animalElement: "fire" },
  { slug: "2026-july",   label: "July 2026",   year: 2026, lunarMonth: 5,  animal: "horse",   animalElement: "fire" },
  { slug: "2026-august", label: "August 2026", year: 2026, lunarMonth: 6,  animal: "goat",    animalElement: "earth" },
  { slug: "2026-september", label: "September 2026", year: 2026, lunarMonth: 7,  animal: "monkey", animalElement: "metal" },
  { slug: "2026-october",   label: "October 2026",   year: 2026, lunarMonth: 8,  animal: "rooster", animalElement: "metal" },
  { slug: "2026-november",  label: "November 2026",  year: 2026, lunarMonth: 9,  animal: "dog",     animalElement: "earth" },
  { slug: "2026-december",  label: "December 2026",  year: 2026, lunarMonth: 10, animal: "pig",     animalElement: "water" },
  { slug: "2027-january",   label: "January 2027",   year: 2027, lunarMonth: 11, animal: "rat",     animalElement: "water" },
  { slug: "2027-february",  label: "February 2027",  year: 2027, lunarMonth: 12, animal: "ox",      animalElement: "earth" },
  { slug: "2027-march",     label: "March 2027",     year: 2027, lunarMonth: 1,  animal: "tiger",   animalElement: "wood" },
  { slug: "2027-april",     label: "April 2027",     year: 2027, lunarMonth: 2,  animal: "rabbit",  animalElement: "wood" },
  { slug: "2027-may",       label: "May 2027",       year: 2027, lunarMonth: 3,  animal: "dragon",  animalElement: "earth" },
];

const ELEMENT_MONTH_TRAITS: Record<Element, Record<string, string>> = {
  wood: {
    love_harmony: "Your visionary nature is your greatest relationship asset this month. You see potential where others see problems, and your partner will feel inspired by your optimism. The key is not to push your vision too fast — let relationships unfold at their own pace.",
    love_stress: "Wood's natural drive for growth can feel like pressure in relationships this month. You want to move forward; they want to sit still. This is not rejection — it's a different pace. Breathe. Give space. Growth happens in the gaps.",
    love_same: "Another Wood brings understanding without explanation. You both see the big picture and want to build something meaningful. The risk: reinforcing each other's blind spots. Make time for outside perspectives.",
    career: "Your expansion energy is your career superpower. You see opportunities others miss. Use this month to plant seeds — new projects, new connections, new skills. The groundwork you lay now will pay off in the next quarter.",
    career_challenge: "This month tests your patience. Growth feels blocked, ideas hit walls, decisions get delayed. This is not a sign to give up — it's a sign to pivot. The obstacle is the way. Find the crack and grow through it.",
    health: "Wood energy thrives on movement. Stagnation is your enemy. Even 15 minutes of stretching or walking will shift your energy more than you expect. Your mind needs motion as much as your body.",
    health_challenge: "Your tendency to push through fatigue catches up with you this month. Wood burns bright but needs rest. Sleep is not optional — it's strategy. Protect your recovery time.",
  },
  fire: {
    love_harmony: "Your natural warmth is magnetic this month. People feel seen and energized around you. In relationships, your passion creates momentum — but be careful not to overwhelm. Let them come to you sometimes.",
    love_stress: "Fire's intensity can scorch when tensions run high. You feel everything deeply and express it immediately. This month, practice the pause. A moment of stillness between feeling and speaking will save you hours of repair.",
    love_same: "Two Fires create a blaze — passionate, intense, and impossible to ignore. This is exhilarating but exhausting. You need an external cooling element to balance the heat. Date nights in, quiet mornings, intentional stillness.",
    career: "Your charisma is a career weapon this month. People want to work with you, follow your lead, invest in your ideas. Lead with warmth, not heat. The difference between a fire that inspires and a fire that burns is how you wield it.",
    career_challenge: "You want to move fast; the world is moving slow. Frustration builds when systems, people, or red tape block your momentum. Channel that fire into preparation — when the gates open, you'll be ready to sprint.",
    health: "Fire needs an outlet. If your energy has no creative or physical release, it turns inward as anxiety or restlessness. Movement, creative expression, and meaningful conversation are your medicine this month.",
    health_challenge: "Burnout is your specific risk. You can run on passion for weeks, then crash hard. Watch for the signs: irritability, poor sleep, loss of joy. Your energy is a renewable resource — if you let it renew.",
  },
  earth: {
    love_harmony: "Your stability is a gift. While others are reactive and scattered, you remain grounded. Your partner knows they can count on you. This month, your steady presence is more valuable than grand gestures.",
    love_stress: "Earth can become rigid when stressed. You dig in, resist change, and withdraw into stubborn silence. This month, flexibility is your edge. You don't have to abandon your ground — just leave room for someone else to stand on it.",
    love_same: "Two Earths create a foundation that can weather any storm. The challenge: too much stability becomes stagnation. You need someone to challenge you, to invite growth and change. Comfort is not the same as fulfillment.",
    career: "Your reliability pays off this month. The projects you've been methodically building start to show results. Earth energy rewards patience — keep showing up, keep refining, keep building. Your consistency is your competitive advantage.",
    career_challenge: "The world is changing faster than you'd like, and your natural inclination is to hold on tighter. This month, try letting go of one thing you've been gripping. The ground doesn't disappear when you open your hands.",
    health: "Earth types carry tension in the body — shoulders, jaw, digestive system. This month, your body is asking you to slow down enough to feel what you've been carrying. Gentle movement, warm food, and rest are non-negotiable.",
    health_challenge: "You absorb stress from others like a sponge. Without boundaries, you carry the weight of everyone around you. This month, practice saying no to things that aren't yours to carry. Guard your energy like sacred ground.",
  },
  metal: {
    love_harmony: "Your precision and integrity set you apart. You don't make promises you can't keep, and your partner knows this. This month, your clarity cuts through confusion — in the best way. You see what's real and name it.",
    love_stress: "Metal can cut when it feels threatened. Your sharp edges come out as criticism, judgment, or withdrawal. This month, ask yourself: am I protecting or attacking? Precision without warmth is just a blade. Soften your edges.",
    love_same: "Two Metal signs create a relationship of mutual respect and high standards. You push each other to be better. The risk: you hold each other to impossible standards. Perfection is the enemy of connection. Leave room for imperfection.",
    career: "This is your season. Structure, discipline, and high standards are rewarded. Your ability to see flaws and fix them before they become problems makes you invaluable. Lead with your precision — but communicate it with care.",
    career_challenge: "Your standards are your superpower and your weakness. When things don't meet your bar, you shut down. This month, practice distinguishing between 'not good enough' and 'different than I expected.' They are not the same thing.",
    health: "Metal governs the lungs and skin. This month, pay attention to your breath — literally. Shallow breathing is a sign of accumulated tension. Deep breaths, time in fresh air, and skin care routines are more than self-care; they're elemental balance.",
    health_challenge: "You hold tension in your jaw, neck, and shoulders. This is where Metal stores its stress. If you wake up clenching your teeth or feel tightness across your upper back, your body is asking for release. Stretch. Breathe. Let go.",
  },
  water: {
    love_harmony: "Your depth is your gift. You feel what others only think. This month, your emotional intelligence creates a container where real intimacy can grow. You don't just hear words — you hear what's underneath them.",
    love_stress: "Water's depth becomes overwhelm when you absorb too much. You feel their mood, their stress, their unspoken fears. This month, boundaries are essential. You can care deeply without drowning in someone else's ocean.",
    love_same: "Two Water signs create an ocean of emotional depth. You understand each other without words. The risk: you can get lost in each other's currents. Remember solid ground. Maintain your individual identity outside the relationship.",
    career: "Your intuition is your career edge this month. You sense shifts before they happen, read people accurately, and navigate complex situations with ease. Trust your gut — it's picking up signals your conscious mind hasn't processed yet.",
    career_challenge: "You feel the weight of everyone's expectations. Your empathy makes you a great collaborator but a poor boundary-setter. This month, practice separating what's yours to carry from what isn't. Clarity is kindness — to yourself and others.",
    health: "Water governs the kidneys and adrenal system. You're especially sensitive to burnout this month. If you feel exhausted despite sleeping enough, your adrenals are asking for support. Rest, hydration, and reducing stimulants will help restore balance.",
    health_challenge: "Your emotional sensitivity has a physical cost. If you've been carrying stress for others, your body will demand payment this month. Listen to fatigue as a signal, not a failure. Water that doesn't flow becomes stagnant.",
  },
};

function getMonthAdvice(element: Element, month: MonthInfo): string {
  const animal = month.animal;
  const animalEl = month.animalElement;
  const rel = getRelationship(element, animalEl);
  const elLabel = ELEMENT_LABELS[element];
  const monthLabel = month.label;
  const emoji = ANIMAL_EMOJIS[animal] || "";

  switch (rel) {
    case "generates":
      return `This ${monthLabel} ${emoji} ${animal} month generates energy that feeds your ${elLabel} nature. You'll feel supported by the universe. The key: receive it. Don't just keep giving — let this month nourish you. Take the help. Accept the compliment. Let yourself be held. Growth happens when you stop doing everything alone.`;
    case "generated_by":
      return `Your ${elLabel} energy is feeding the ${monthLabel} ${emoji} ${animal} month — which means you may feel depleted if you're not refilling your reserves. This is not a sign of weakness. It's a sign that you need to prioritize your own energy before giving to others. Protect your boundaries. Your fuel is finite. Spend it wisely.`;
    case "controls":
      return `You're in a position of natural authority this ${monthLabel} ${emoji} ${animal}. Your ${elLabel} energy structures and guides the month's current. People will look to you for direction. Lead with clarity, not dominance. The goal is to build systems that help everyone, not to control outcomes. Power wielded with wisdom creates lasting impact.`;
    case "controlled_by":
      return `The ${monthLabel} ${emoji} ${animal} energy brings structure to your ${elLabel} nature. You may feel constrained — but this is not punishment. This month's friction is refining you. Like water shaped by a riverbank, you're being directed toward something greater. Trust the process. Resistance is growth in disguise.`;
    default:
      return `This ${monthLabel} ${emoji} ${animal} month mirrors your own ${elLabel} energy. You'll see yourself reflected in the world around you — your strengths amplified, your patterns exposed. Use this clarity wisely. The gift of a same-element month is seeing what you normally miss. Pay attention to what feels familiar. That's where your growth edge lives.`;
  }
}

function getRelationshipLabel(rel: RelationshipType): string {
  switch (rel) {
    case "generates": return "Nourishing Energy ✦";
    case "generated_by": return "Supportive Flow ✦";
    case "controls": return "Structuring Force ✦";
    case "controlled_by": return "Refining Pressure ✦";
    default: return "Mirror Energy ✦";
  }
}

export function getMonthlyHoroscope(element: Element, month: MonthInfo): MonthlyHoroscopeContent {
  const elLabel = ELEMENT_LABELS[element];
  const animal = month.animal;
  const animalEmoji = ANIMAL_EMOJIS[animal] || "";
  const rel = getRelationship(element, month.animalElement);
  const traits = ELEMENT_MONTH_TRAITS[element];
  const label = month.label;

  let love: string;
  switch (rel) {
    case "generates":
    case "generated_by":
      love = `${traits.love_harmony} The ${animal} ${animalEmoji} energy this month supports emotional flow and authentic connection. ${rel === "generates" ? "Your natural warmth creates a safe container for vulnerability." : "This month's energy helps you receive love without guarding yourself."}`;
      break;
    case "controls":
    case "controlled_by":
      love = `${traits.love_stress} The ${animal} ${animalEmoji} energy creates productive tension in relationships this ${label}. ${rel === "controls" ? "You have the clarity to set boundaries that actually serve the relationship." : "You're being asked to trust instead of control. Let go, even when it's uncomfortable."}`;
      break;
    default:
      love = `${traits.love_same} The ${animal} ${animalEmoji} month mirrors your own relational patterns back to you. What you see may not always be comfortable — but it will be honest. Use this reflection as a compass, not a judgment.`;
  }

  let career: string;
  switch (rel) {
    case "generates":
    case "generated_by":
      career = `${traits.career} The ${animal} ${animalEmoji} energy amplifies your natural career strengths. Trust your momentum — but don't let it rush you into decisions that need more thought. Growth and stability can coexist.`;
      break;
    case "controls":
    case "controlled_by":
      career = `${traits.career_challenge} This ${label} ${animalEmoji} asks you to adapt. Your usual approach may not work this month — and that's the lesson. Flexibility is not weakness; it's strategy. The most successful people are not the strongest; they're the most adaptable.`;
      break;
    default:
      career = `Your ${elLabel} energy is in full focus this ${label}. This is a month for alignment — are your daily actions matching your long-term vision? The ${animal} ${animalEmoji} asks you to be honest with yourself about what's working and what's not. Clarity is the first step to change.`;
  }

  let health: string;
  switch (rel) {
    case "generates":
    case "generated_by":
      health = `${traits.health} The ${animal} ${animalEmoji} energy supports healing and restoration. Your body will respond well to care this month. Listen to what it's asking for — rest, movement, different food, more water. The answers are already there. You just need to be quiet enough to hear them.`;
      break;
    case "controls":
    case "controlled_by":
      health = `${traits.health_challenge} This ${label} ${animalEmoji} month demands more from your body than usual. You may feel the accumulated weight of previous months. Slow down before your body forces you to. Prevention is always less painful than recovery.`;
      break;
    default:
      health = `Your ${elLabel} element governs specific systems in your body. This ${label}, pay extra attention to them. The ${animal} ${animalEmoji} energy amplifies whatever is already present — good habits yield greater returns, and neglected areas demand attention. Choose one small practice and commit to it for this month.`;
  }

  return {
    metaTitle: `${elLabel} Element ${label} Horoscope — BaZi Monthly Forecast | Elemental Bond`,
    metaDescription: `${elLabel} (${animal.charAt(0).toUpperCase() + animal.slice(1)}) ${label} BaZi monthly horoscope. Love, career, and health forecast for ${elLabel} element types. 2026-2027 Chinese astrology guidance.`,
    metaKeywords: `${element} element horoscope ${label.toLowerCase()}, ${elLabel} ${label} forecast, bazi monthly ${label.toLowerCase()} ${element}, ${elLabel} element ${month.animal} month, chinese astrology ${label.toLowerCase()} ${element}`,
    loveForecast: love,
    careerForecast: career,
    healthForecast: health,
    advice: getMonthAdvice(element, month),
    elementColor: MONTH_COLORS[element],
    relationshipLabel: getRelationshipLabel(rel),
  };
}

export function findMonthBySlug(slug: string): MonthInfo | undefined {
  return MONTHS.find((m) => m.slug === slug);
}

export function getMonthSlugs(): string[] {
  return MONTHS.map((m) => m.slug);
}
