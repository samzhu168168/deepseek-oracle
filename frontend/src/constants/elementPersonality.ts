/**
 * Element Personality — SEO content generator for 5 element personality pages.
 * Mirrors the pattern from elements.ts (getElementPairContent).
 */
import {
  ELEMENTS,
  ELEMENT_LABELS,
  ELEMENT_CHINESE,
  GENERATIVE_CYCLE,
  CONTROLLING_CYCLE,
  type Element,
} from "./elements";

export interface ElementPersonalityContent {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  subtitle: string;
  chineseName: string;
  dayMasterTypes: string;
  symbol: string;
  elementColor: string;
  strengths: string[];
  weaknesses: string[];
  bestMatch: { element: Element; label: string; reason: string };
  challengingMatch: { element: Element; label: string; reason: string };
  relationshipDynamic: string;
  careerTraits: string[];
  recommendedPaths: string[];
  year2026Outlook: string;
  year2026Advice: string;
  faq: { q: string; a: string }[];
  relatedArticleSlugs: string[];
  relatedPairSlugs: string[];
  dayMaster2026Slug: string;
}

const ELEMENT_SYMBOLS: Record<Element, string> = {
  wood: "🌱",
  fire: "🔥",
  earth: "⛰️",
  metal: "⚔️",
  water: "🌊",
};

const ELEMENT_COLORS: Record<Element, string> = {
  wood: "#4ECDC4",
  fire: "#F0B34B",
  earth: "#C4956A",
  metal: "#EDEDF0",
  water: "#8B6FE8",
};

const DAY_MASTER_TYPES: Record<Element, string> = {
  wood: "Jia (甲, Yang Wood) and Yi (乙, Yin Wood)",
  fire: "Bing (丙, Yang Fire) and Ding (丁, Yin Fire)",
  earth: "Wu (戊, Yang Earth) and Ji (己, Yin Earth)",
  metal: "Geng (庚, Yang Metal) and Xin (辛, Yin Metal)",
  water: "Ren (壬, Yang Water) and Gui (癸, Yin Water)",
};

const ELEMENT_SUBTITLES: Record<Element, string> = {
  wood: "Visionary, expansive, and driven by growth. Wood personalities see the big picture and inspire everyone around them to build toward it.",
  fire: "Passionate, radiant, and magnetic. Fire personalities light up every room and draw people to them with irresistible warmth.",
  earth: "Grounded, nurturing, and deeply reliable. Earth personalities are the bedrock of every relationship and every team.",
  metal: "Precise, principled, and refined. Metal personalities bring structure, integrity, and uncompromising quality to everything they touch.",
  water: "Deep, intuitive, and profoundly wise. Water personalities possess extraordinary emotional intelligence and adaptability.",
};

const PERSONALITY_STRENGTHS: Record<Element, string[]> = {
  wood: [
    "Visionary thinking — they see possibilities others miss and map a path forward",
    "Natural growth mindset — they constantly evolve, learn, and expand their horizons",
    "Inspirational leadership — their enthusiasm is contagious and draws people to their cause",
    "Resilient optimism — setbacks fuel their determination rather than deflating it",
    "Generous spirit — they share credit freely and lift others as they rise",
  ],
  fire: [
    "Charismatic presence — people are naturally drawn to their warmth and energy",
    "Expressive communicators — they articulate ideas and emotions with vivid clarity",
    "Creative innovators — their imagination constantly generates new possibilities",
    "Inspiring motivators — they ignite passion and action in everyone around them",
    "Quick adaptability — they pivot fast when circumstances change",
  ],
  earth: [
    "Unshakeable reliability — follow-through is their superpower; they never drop the ball",
    "Nurturing patience — they create safe spaces for others to grow at their own pace",
    "Practical wisdom — their solutions are grounded, realistic, and built to last",
    "Steady presence — they remain calm and composed when everyone else panics",
    "Generous service — they find deep fulfillment in supporting others' success",
  ],
  metal: [
    "Uncompromising integrity — their word is their bond; they operate with total honesty",
    "Refined taste — they bring elegance, precision, and high standards to everything",
    "Disciplined focus — they pursue goals with methodical determination",
    "Analytical clarity — they cut through noise to find the core truth of any situation",
    "Protective loyalty — they stand fiercely by the people they commit to",
  ],
  water: [
    "Emotional intelligence — they read people and situations with uncanny accuracy",
    "Deep intuition — they know things without being told; their gut rarely lies",
    "Extraordinary adaptability — they flow around obstacles and thrive in change",
    "Wise counsel — others seek them out for their penetrating insights and advice",
    "Resilient depth — they process profound emotions and emerge stronger",
  ],
};

const PERSONALITY_WEAKNESSES: Record<Element, string[]> = {
  wood: [
    "Can overextend — their reach sometimes exceeds their grasp, leading to burnout",
    "Stubborn in conviction — once they've decided a path is right, redirecting them is difficult",
    "Impatient with slow progress — they want growth now, not later",
    "May neglect details while chasing the big vision",
  ],
  fire: [
    "Can be overwhelming — their intensity sometimes exhausts more reserved types",
    "Risk of burnout — they burn bright but may not pace themselves sustainably",
    "Impulsive decisions — passion can override prudence in the moment",
    "May struggle with routine — consistency is not their natural habitat",
  ],
  earth: [
    "Resistant to change — once settled, they prefer the familiar over the unknown",
    "Can be overly self-sacrificing — they give so much that they forget their own needs",
    "Slow to act — their caution sometimes costs them opportunities",
    "May enable others' dependency by being too accommodating",
  ],
  metal: [
    "Can be rigid — their high standards sometimes become inflexible rules",
    "Prone to criticism — their precision can come across as harsh or judgmental",
    "Difficulty with vulnerability — they guard their emotions behind stoic walls",
    "May struggle with ambiguity — they want things decided and settled",
  ],
  water: [
    "Overly sensitive — they absorb others' emotions and can become overwhelmed",
    "Tendency toward withdrawal — when hurt, they retreat into silence rather than confront",
    "Can be too indirect — their subtlety may frustrate those who prefer direct communication",
    "Risk of emotional overwhelm — their depth can sometimes feel like a burden",
  ],
};

const RELATIONSHIP_DYNAMICS: Record<Element, string> = {
  wood:
    "In relationships, Wood personalities seek growth partners — someone who challenges them to expand and builds alongside them. They thrive with partners who share their vision but ground it in practical reality. The generative (Wood → Fire) pairings feel most natural, while controlling (Wood → Earth) dynamics create the most productive growth tension.",
  fire:
    "In relationships, Fire personalities crave passionate connection and mutual inspiration. They need partners who appreciate their intensity without being consumed by it. The generative (Fire → Earth) pairings ground their flame in lasting stability, while controlling (Fire → Metal) dynamics teach them the value of boundaries and structure.",
  earth:
    "In relationships, Earth personalities seek stability and mutual care above all. They love deeply through acts of service and consistent presence. The generative (Earth → Metal) pairings create refinement and shared purpose, while controlling (Earth → Water) dynamics help them learn flexibility and emotional flow.",
  metal:
    "In relationships, Metal personalities value integrity, loyalty, and shared standards. They love with fierce protection and expect the same commitment in return. The generative (Metal → Water) pairings create emotional depth and mutual understanding, while controlling (Metal → Wood) dynamics challenge them to be less rigid and more compassionate.",
  water:
    "In relationships, Water personalities seek emotional depth and authentic connection. They need partners who can meet them in the depths without drowning. The generative (Water → Wood) pairings create growth and shared vision, while controlling (Water → Fire) dynamics challenge them to express rather than withdraw.",
};

const CAREER_TRAITS: Record<Element, string[]> = {
  wood: [
    "Natural entrepreneur — excels at building ventures from the ground up",
    "Strategic planner — sees 3-5 year horizons clearly",
    "People developer — thrives in mentoring, coaching, and team leadership roles",
  ],
  fire: [
    "Creative performer — excels in roles that require presence, energy, and inspiration",
    "Sales and influence — natural talent for persuasion and motivation",
    "Innovation driver — thrives in fast-paced creative and startup environments",
  ],
  earth: [
    "Operations and management — excels at building reliable systems and teams",
    "Healthcare and service — natural caregiver in medicine, therapy, or social work",
    "Real estate and agriculture — drawn to tangible, grounded industries",
  ],
  metal: [
    "Finance and law — excels in precision-driven, high-stakes environments",
    "Engineering and architecture — thrives in structured, design-oriented fields",
    "Quality assurance and audit — natural eye for refinement and standards",
  ],
  water: [
    "Counseling and therapy — deep empathy makes them exceptional listeners and healers",
    "Research and analysis — thrives on uncovering hidden patterns and insights",
    "Arts and writing — their emotional depth fuels creative expression",
  ],
};

const YEAR_2026_OUTLOOK: Record<Element, string> = {
  wood: "2026 is the Bing Wu (丙午) Fire Horse year — Fire consumes Wood in the Five Element cycle, making this an intense year of creative combustion. For Wood Day Masters, this is a year of inspired action: your ideas catch fire and demand to be built. Career opportunities accelerate, but burnout risk is real. Relationships entered this year burn hot and fast — passion is off the charts, but sustainability requires conscious pacing. Key months: June (peak creative energy) and October (relationship reckoning).",
  fire: "2026 is YOUR year, Fire. The Bing Wu (丙午) year doubles your natural element — two Yang Fire pillars burning together. This is a once-in-60-years peak of personal power, visibility, and charisma. Everything you touch this year has amplified energy. Launch the project. Make the ask. Step into the spotlight. The risk is overconfidence — check your impulses before making life-altering commitments. Financially, this is a high-voltage year with spectacular highs and potential lows. Guard your health in July and August.",
  earth: "The 2026 Bing Wu (丙午) Fire year brings a powerful generative cycle for Earth — Fire creates Earth, so this year you are being nourished by cosmic forces. Things that felt stuck will begin to move. Opportunities arrive through creative people and inspired collaborations. This is a year to receive: let others support you, invest in you, and help you grow. Relationships deepen naturally without force. Career-wise, the first half of the year is for laying foundations; the second half brings harvest. Watch for over-giving in September.",
  metal: "2026's Bing Wu (丙午) Fire year creates a controlling dynamic for Metal — Fire melts Metal, which means this year challenges your structures and demands flexibility. What worked before may not work now. This is a year of refinement through pressure: old systems break so better ones can form. In relationships, power dynamics shift — expect negotiations and rebalancing. Career-wise, this is not a year to force your agenda but to listen and adapt. The fourth quarter brings clarity and renewed strength. Your resilience is being forged.",
  water: "The 2026 Bing Wu (丙午) Fire year creates a controlling dynamic for Water — Water controls Fire, which means you have unusual influence this year. Your calm depth can extinguish chaos and guide others through turbulence. In relationships, you hold the emotional center — people depend on your stability. Career-wise, this is a year of strategic positioning: you can shape outcomes without forcing them. The danger is emotional exhaustion from absorbing others' intensity. Prioritize solitude. June and December are your power months.",
};

const YEAR_2026_ADVICE: Record<Element, string> = {
  wood: "Pace yourself. Say yes to the big opportunities, but build recovery time into your schedule. Partner with someone who grounds your vision (Earth types are your 2026 anchor).",
  fire: "Channel the intensity. Say yes to visibility, but build in reflection periods. Partner with someone who brings structure (Metal types help you edit your impulses this year).",
  earth: "Receive openly. Let others nurture you for a change. Partner with someone who inspires action (Fire types are your 2026 catalysts). Your foundation is secure enough to grow.",
  metal: "Stay flexible. What breaks down is making room for something stronger. Partner with someone who brings warmth (Water types help you soften without losing your edge).",
  water: "Lead from depth. Your intuition is amplified — trust it. Partner with someone who grounds your vision (Earth types help you build structures around your insights).",
};

const FAQS: Record<Element, { q: string; a: string }[]> = {
  wood: [
    {
      q: "What are Wood Day Masters like in relationships?",
      a: "Wood Day Masters (Jia 甲 and Yi 乙) are visionary partners who invest heavily in shared growth. They believe relationships should evolve, expand, and become more than the sum of their parts. Jia Wood is the assertive pioneer — direct, ambitious, and goal-oriented in love. Yi Wood is the flexible nurturer — diplomatic, artistic, and deeply attuned to their partner's needs. Both types need partners who respect their independence while offering emotional grounding.",
    },
    {
      q: "Which careers suit Wood element personalities?",
      a: "Wood personalities thrive in careers that involve growth, creativity, and long-term vision. Entrepreneurship, strategic consulting, education, nonprofit leadership, environmental work, and creative direction all align with Wood's natural strengths. They excel when given autonomy and struggle in rigid, micromanaged environments.",
    },
    {
      q: "What is the Wood element's role in the Five Element cycle?",
      a: "Wood is the initiating force in the generative (Sheng) cycle — Wood feeds Fire, which creates Earth, which bears Metal, which carries Water, which nourishes Wood. In the controlling (Ke) cycle, Wood parts Earth (roots breaking soil), while Metal chops Wood. This dual role makes Wood both a starter and a subject of control — a dynamic that mirrors the growth-and-boundary tension in Wood personalities.",
    },
  ],
  fire: [
    {
      q: "How do Fire Day Masters behave in love?",
      a: "Fire Day Masters (Bing 丙 and Ding 丁) love with spectacular intensity. Bing Fire is the blazing sun — generous, charismatic, and impossible to ignore. They court with grand gestures and need a partner who appreciates their spotlight. Ding Fire is the candle flame — more subtle, warm, and intimately focused. They create cozy, deeply personal connections. Both types need admiration and authentic emotional engagement. A Fire personality without enthusiasm is a fire without fuel.",
    },
    {
      q: "What careers do Fire elements excel at?",
      a: "Fire personalities excel in roles that demand presence, persuasion, and creative energy. Performance arts, sales, marketing, public speaking, entertainment, event planning, and any role where they can inspire others. They thrive on visibility and recognition and wilt in isolation or behind-the-scenes roles.",
    },
    {
      q: "How does the 2026 Fire Horse year affect Fire elements?",
      a: "2026 is a double-fire year (Bing Wu 丙午), and for Fire Day Masters, this is a once-in-60-years peak. It amplifies everything — charisma, creativity, risk-taking, and also impulsiveness. This is the year to launch bold projects and step into public roles. The key is channeling the intensity rather than being consumed by it. Health and nervous system care are critical this year.",
    },
  ],
  earth: [
    {
      q: "What makes Earth Day Masters unique in relationships?",
      a: "Earth Day Masters (Wu 戊 and Ji 己) love through presence and reliability. Wu Earth is the mountain — solid, protective, and quietly commanding respect. They are the partner everyone leans on. Ji Earth is the fertile soil — nurturing, adaptable, and deeply attuned to their partner's needs. Earth types don't chase drama; they build lasting structures. Their love language is consistency: showing up, following through, and being there without fanfare.",
    },
    {
      q: "Which professions align with Earth element strengths?",
      a: "Earth personalities thrive in roles that require stability, systems thinking, and care for others. Healthcare, education, real estate, agriculture, operations management, HR, counseling, and community leadership all draw on Earth's natural gifts. They excel at building and maintaining structures that serve people.",
    },
    {
      q: "Why is 2026 a good year for Earth Day Masters?",
      a: "Because Fire creates Earth in the generative cycle, 2026's Fire energy nourishes Earth types directly. Things that require patience begin to materialize. Relationships deepen without force. Career groundwork laid in earlier years begins to pay off. The message for Earth types this year: receive. Let the universe support you for a change.",
    },
  ],
  metal: [
    {
      q: "How do Metal Day Masters approach relationships?",
      a: "Metal Day Masters (Geng 庚 and Xin 辛) approach relationships with the same precision they bring to everything. Geng Metal is the weapon — direct, powerful, and fiercely protective. They love with intensity and expect total loyalty. Xin Metal is the jewel — refined, elegant, and sensitive. They seek beauty and quality in their connections. Metal types require integrity above all; broken trust is nearly impossible to rebuild with them. They may appear cold but feel deeply — they simply express love through action rather than words.",
    },
    {
      q: "What careers suit Metal element personalities?",
      a: "Metal personalities excel in precision-driven, high-stakes fields. Finance, law, engineering, architecture, quality assurance, surgery, data science, and any role demanding analytical rigor. They thrive on structure, clear standards, and the satisfaction of refinement. They struggle in chaotic, poorly-defined environments.",
    },
    {
      q: "How does the 2026 Fire year challenge Metal elements?",
      a: "Fire melts Metal in the controlling cycle, making 2026 a year of structural pressure for Metal types. What feels like resistance is actually refinement — old systems breaking down so stronger ones can form. Career-wise, this is a year to listen and adapt rather than force outcomes. Relationships may feel intense as power dynamics shift. By Q4, the pressure produces clarity and renewed strength.",
    },
  ],
  water: [
    {
      q: "What are Water Day Masters like in love?",
      a: "Water Day Masters (Ren 壬 and Gui 癸) love with extraordinary depth. Ren Water is the ocean — vast, powerful, and mysterious. They need partners who aren't afraid of emotional depth and can handle their intensity. Gui Water is the rain — gentle, receptive, and nourishing. They connect through subtle understanding rather than grand declarations. Both types lead with intuition and need a partner who respects their need for solitude. Pushing a Water type to open up before they're ready creates resistance; patience invites depth.",
    },
    {
      q: "Which careers bring out Water element strengths?",
      a: "Water personalities thrive in roles that demand emotional intelligence, pattern recognition, and strategic depth. Counseling, therapy, research, data analysis, writing, art, diplomacy, and any role requiring nuanced understanding of human behavior. Their ability to read situations makes them exceptional strategists and advisors.",
    },
    {
      q: "Why do Water types have unusual influence in 2026?",
      a: "Water controls Fire in the Five Element cycle, so the intense Fire energy of 2026 (Bing Wu year) gives Water types unusual leverage. Their calm depth can extinguish chaos and guide others through turbulence. This is a year for Water personalities to step into leadership roles — not through force, but through wisdom and presence. The risk is emotional drain from absorbing others' intensity.",
    },
  ],
};

const RELATED_ARTICLES: Record<Element, string[]> = {
  wood: ["wood-element-personality-bazi", "bazi-five-elements-guide", "wood-fire-compatibility-bazi"],
  fire: ["fire-element-personality-bazi", "bazi-five-elements-guide", "fire-and-earth-bazi-compatibility"],
  earth: ["earth-element-personality-bazi", "bazi-five-elements-guide", "earth-fire-bazi-relationship"],
  metal: ["metal-element-personality-bazi", "bazi-five-elements-guide", "metal-fire-bazi-compatibility-controlling-cycle"],
  water: ["water-element-personality-bazi", "bazi-five-elements-guide", "water-metal-compatibility-bazi"],
};

const CACHE = new Map<string, ElementPersonalityContent>();

export function getElementPersonalityContent(element: Element): ElementPersonalityContent {
  const key = element;
  if (CACHE.has(key)) return CACHE.get(key)!;

  const label = ELEMENT_LABELS[element];
  const chinese = ELEMENT_CHINESE[element];

  // Best match: the element generated by this element (generative cycle partner)
  const genPartner = GENERATIVE_CYCLE[element];
  // Challenging match: the element that controls this element
  const controlPartner = CONTROLLING_CYCLE[element];

  // Pair slugs for cross-linking
  const pairSlugs: string[] = [];
  for (const e2 of ELEMENTS) {
    if (e2 !== element) {
      pairSlugs.push(`${element}-and-${e2}`);
    }
  }

  const content: ElementPersonalityContent = {
    metaTitle: `${label} Element Personality — What It Means in BaZi | Elemental Bond`,
    metaDescription: `What does the ${label.toLowerCase()} element mean in BaZi? Discover how ${label.toLowerCase()} personalities love, work, and navigate 2026. Complete guide to ${label.toLowerCase()} Day Masters (${DAY_MASTER_TYPES[element]}).`,
    metaKeywords: `${element.toLowerCase()} element personality, ${element.toLowerCase()} bazi, ${element.toLowerCase()} element chinese astrology, ${element.toLowerCase()} day master, ${element.toLowerCase()} element relationships, what is ${element.toLowerCase()} element, ${element.toLowerCase()} element 2026, ${element.toLowerCase()} personality traits, ${element.toLowerCase()} chinese astrology`,
    subtitle: ELEMENT_SUBTITLES[element],
    chineseName: chinese,
    dayMasterTypes: DAY_MASTER_TYPES[element],
    symbol: ELEMENT_SYMBOLS[element],
    elementColor: ELEMENT_COLORS[element],
    strengths: PERSONALITY_STRENGTHS[element],
    weaknesses: PERSONALITY_WEAKNESSES[element],
    bestMatch: {
      element: genPartner,
      label: ELEMENT_LABELS[genPartner],
      reason: `${label} generates ${ELEMENT_LABELS[genPartner]} in the Five Element cycle — this is a nourishing, supportive pairing where ${element.toLowerCase()} energy naturally feeds and amplifies ${genPartner} energy.`,
    },
    challengingMatch: {
      element: controlPartner,
      label: ELEMENT_LABELS[controlPartner],
      reason: `${ELEMENT_LABELS[controlPartner]} controls ${label} in the Five Element cycle — this pair creates productive tension where ${controlPartner} brings structure and ${element.toLowerCase()} brings flexibility. Requires balance but drives growth.`,
    },
    relationshipDynamic: RELATIONSHIP_DYNAMICS[element],
    careerTraits: CAREER_TRAITS[element],
    recommendedPaths: CAREER_TRAITS[element],
    year2026Outlook: YEAR_2026_OUTLOOK[element],
    year2026Advice: YEAR_2026_ADVICE[element],
    faq: FAQS[element],
    relatedArticleSlugs: RELATED_ARTICLES[element],
    relatedPairSlugs: pairSlugs,
    dayMaster2026Slug: `2026-snake-year-bazi-element-types`,
  };

  CACHE.set(key, content);
  return content;
}
