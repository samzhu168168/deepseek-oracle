import type { ElementName } from "./elementProfile";

export type EmotionalInsight = {
  patternTitle: string;
  patternSummary: string;
  familiarPattern: string[];
  hiddenNeed: {
    label: string;
    explanation: string;
  };
  chemistryTrap: {
    headline: string;
    explanation: string;
  };
  nextMove: string[];
};

const INSIGHTS: Record<ElementName, EmotionalInsight> = {
  Wood: {
    patternTitle: "The Relationship Project",
    patternSummary: "You may show love by seeing what a connection could become. That hope can keep you investing after the present relationship has stopped matching its potential.",
    familiarPattern: [
      "You explain the future you can see, hoping the other person will start building it with you.",
      "You may treat stalled progress as a problem that more effort or better communication can solve.",
      "You sometimes stay loyal to potential longer than the current evidence deserves.",
    ],
    hiddenNeed: {
      label: "Reciprocity",
      explanation: "Growth feels safer when both people initiate it. You may need someone who contributes momentum instead of only agreeing with yours.",
    },
    chemistryTrap: {
      headline: "Potential can feel like partnership before it becomes one.",
      explanation: "A shared vision can be exciting. Notice whether it is supported by repeated action in the present.",
    },
    nextMove: [
      "Notice who initiates the next honest conversation without being prompted.",
      "Compare what has actually changed with what has repeatedly been promised.",
      "Ask whether the relationship is growing together or mainly through your effort.",
    ],
  },
  Fire: {
    patternTitle: "The Intensity Signal",
    patternSummary: "You may recognize connection through energy, responsiveness, and emotional immediacy. When the signal becomes quieter, you can wonder whether the bond itself has disappeared.",
    familiarPattern: [
      "Fast replies and visible enthusiasm can make a new connection feel unusually meaningful.",
      "You may push for an immediate answer when uncertainty starts to cool the emotional temperature.",
      "Calm periods can sometimes feel like distance, even when nothing is actually wrong.",
    ],
    hiddenNeed: {
      label: "Reassurance",
      explanation: "You may not need constant excitement. You may need clear signs that warmth and interest remain present when the moment is less intense.",
    },
    chemistryTrap: {
      headline: "Intensity can prove attraction without proving consistency.",
      explanation: "A strong spark is real information, but it does not yet show how someone communicates, repairs, or follows through.",
    },
    nextMove: [
      "Notice whether warmth remains when there is no dramatic moment to sustain it.",
      "Watch how both people respond after a misunderstanding, not only during attraction.",
      "Separate the speed of the connection from the reliability of the person.",
    ],
  },
  Earth: {
    patternTitle: "The Emotional Stabilizer",
    patternSummary: "You may become the person who remembers, reassures, and keeps the relationship functioning. Being dependable can slowly turn into carrying work that was meant to be shared.",
    familiarPattern: [
      "You notice what needs doing before the other person asks and often handle it quietly.",
      "You may wait for your effort to be recognized instead of naming that the balance feels uneven.",
      "Leaving can feel difficult when someone has come to rely on the stability you provide.",
    ],
    hiddenNeed: {
      label: "Consistency",
      explanation: "You may need care that arrives without being managed. Reliability feels different when it is offered back to you, not only supplied by you.",
    },
    chemistryTrap: {
      headline: "Feeling needed can resemble feeling securely loved.",
      explanation: "Being important to someone can create closeness. Notice whether they also make room for your needs and emotional weight.",
    },
    nextMove: [
      "Notice what happens when you stop anticipating one small need for them.",
      "Track whether support moves in both directions during an ordinary week.",
      "Name one need directly and observe the response without explaining it away.",
    ],
  },
  Metal: {
    patternTitle: "The Clarity Threshold",
    patternSummary: "You may feel safest when words, standards, and intentions line up. When they do not, you can protect yourself by becoming precise, self-contained, or difficult to reach.",
    familiarPattern: [
      "You may keep reviewing mixed signals until you can form a clean explanation for them.",
      "When trust slips, you can withdraw before the other person realizes repair is needed.",
      "You sometimes communicate the standard clearly while keeping the softer need underneath it private.",
    ],
    hiddenNeed: {
      label: "Clarity",
      explanation: "You may need direct information and dependable boundaries, plus enough emotional safety to say why those things matter to you.",
    },
    chemistryTrap: {
      headline: "Being hard to read can look like emotional strength.",
      explanation: "Composure and independence can be attractive. Notice whether they make honest communication easier or keep both people guessing.",
    },
    nextMove: [
      "Notice whether direct questions receive direct answers without punishment or evasion.",
      "Say the feeling beneath one boundary instead of communicating only the rule.",
      "Watch whether repair happens through mutual conversation or prolonged silence.",
    ],
  },
  Water: {
    patternTitle: "The Unspoken Current",
    patternSummary: "You may notice shifts in tone and emotional distance before they are named. Reading the current can help you adapt, but it can also keep you waiting for clarity that only a conversation can provide.",
    familiarPattern: [
      "You can spend time interpreting a small change instead of asking what has changed.",
      "You may make room for complexity until your own preference becomes difficult to locate.",
      "Ambiguous connections can hold your attention because there is always another layer to understand.",
    ],
    hiddenNeed: {
      label: "Emotional Safety",
      explanation: "You may need space for nuance without having to decode everything alone. Safety includes being able to ask and receive a clear response.",
    },
    chemistryTrap: {
      headline: "Mystery can feel like depth before trust has been built.",
      explanation: "Complexity can be compelling. Notice whether curiosity is gradually becoming mutual understanding or remaining uncertainty.",
    },
    nextMove: [
      "Turn one interpretation into a direct, neutral question.",
      "Notice whether uncertainty decreases as the connection develops.",
      "Check what you want before adapting to what the other person may want.",
    ],
  },
};

export function getEmotionalInsight(element: ElementName): EmotionalInsight {
  return INSIGHTS[element];
}
