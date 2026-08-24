export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

export type RelationshipPatternArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  directAnswer: string;
  sections: ArticleSection[];
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ label: string; url: string; note: string }>;
  relatedSlugs: string[];
};

export const RELATIONSHIP_PATTERN_ARTICLES: Record<string, RelationshipPatternArticle> = {
  "why-do-i-keep-attracting-the-same-type-of-partner": {
    slug: "why-do-i-keep-attracting-the-same-type-of-partner",
    title: "Why Do I Keep Attracting the Same Type of Partner?",
    metaTitle: "Why Do I Keep Attracting the Same Type of Partner? | Elemental Bond",
    metaDescription: "Why can different partners create the same relationship pattern? Explore familiarity, compatibility, repeated dynamics, and what to notice next time.",
    directAnswer: "You may keep meeting different people while repeating a familiar relationship structure: the same pursuit, uncertainty, emotional role, or point of disappointment. This does not prove that one hidden cause explains every relationship. It does suggest that attraction is shaped by what feels recognizable as well as by what works. The useful question is not only “Why are they the same?” but “What role do I repeatedly enter when this begins?”",
    sections: [
      {
        heading: "What This Pattern Often Feels Like",
        paragraphs: [
          "The surface details change. One person is outgoing, another quiet. One relationship begins online, another through friends. Yet a familiar sequence returns: you wait for clarity, carry the emotional work, pursue someone who becomes less available, or stay because the next conversation might finally change things.",
          "The recognition moment often arrives late: this is a new person, but you are doing the same job inside the relationship.",
        ],
        callout: "Different person. Familiar role. The repeated part may be what the relationship asks you to become.",
      },
      {
        heading: "Why Familiar Can Feel Attractive",
        paragraphs: [
          "Familiar does not mean healthy or unhealthy by itself. It means recognizable. A dynamic that is easy to read can create an early sense of fluency, even when that fluency comes from having managed something similar before.",
          "The counterintuitive point is that immediate comfort is not always evidence of long-term fit. Sometimes it is evidence that you already know the script.",
        ],
      },
      {
        heading: "Familiarity vs Compatibility",
        paragraphs: [
          "Familiarity answers: “Do I recognize this feeling?” Compatibility asks different questions: Can we communicate directly? Do effort and care move both ways? Can disagreement lead to repair? Do stated intentions become repeated behavior?",
          "Strong attraction and workable compatibility can coexist, but one does not prove the other. Compatibility becomes visible through patterns over time rather than through intensity alone.",
        ],
      },
      {
        heading: "What To Notice Next Time",
        paragraphs: ["Use the beginning of a connection as an observation period, not a verdict."],
        bullets: [
          "Name the emotional role you enter first: pursuer, explainer, stabilizer, rescuer, or observer.",
          "Compare words with repeated behavior after the first uncertainty or disagreement.",
          "Ask whether you feel known, or mainly useful, activated, needed, or intrigued.",
        ],
      },
      {
        heading: "A Five Elements Reflection",
        paragraphs: [
          "Elemental Bond uses the Five Elements as a symbolic vocabulary for noticing relationship roles. Wood may emphasize growth, Fire intensity, Earth stability, Metal clarity, and Water emotional subtext. These are editorial reflection prompts, not fixed identities or scientific relationship diagnoses.",
          "A personal reading starts with your birth date, maps it to one simplified element lens, and translates that lens into questions you can compare with your lived experience.",
        ],
      },
    ],
    faq: [
      { question: "Does repeating a type mean something is wrong with me?", answer: "No. Repetition is common in human decision-making and relationships, and a short article cannot identify a single cause. The practical value is noticing what repeats without turning it into a defect or diagnosis." },
      { question: "How can I tell whether attraction is compatibility?", answer: "Look beyond the initial feeling. Over time, compatibility is better reflected in mutual effort, direct communication, repair after conflict, aligned expectations, and behavior that remains consistent." },
    ],
    sources: [
      { label: "Laurenceau, Barrett & Pietromonaco (1998), Intimacy as an interpersonal process", url: "https://doi.org/10.1037/0022-3514.74.5.1238", note: "Research on disclosure, perceived partner responsiveness, and intimacy in daily interactions." },
      { label: "Christensen & Heavey (1990), Gender and social structure in demand/withdraw interaction", url: "https://doi.org/10.1037/0022-3514.59.1.73", note: "A foundational study of recurring demand/withdraw communication patterns in couples." },
    ],
    relatedSlugs: ["why-do-i-always-care-more", "why-does-he-pull-away-when-we-get-close"],
  },
  "why-do-i-always-care-more": {
    slug: "why-do-i-always-care-more",
    title: "Why Do I Always Care More in Relationships?",
    metaTitle: "Why Do I Always Care More in Relationships? | Elemental Bond",
    metaDescription: "Feeling as if you care more may involve uneven emotional labor, uncertainty, reassurance, or reciprocity. Learn what to observe without self-diagnosis.",
    directAnswer: "Feeling as if you always care more may mean affection is uneven, but it can also mean you are doing more of the work that keeps the relationship moving: initiating conversations, monitoring distance, planning repair, and seeking reassurance. The difference matters. Love is difficult to measure, while effort is easier to observe. Instead of proving who feels more, look at who repeatedly notices, initiates, follows through, and responds.",
    sections: [
      {
        heading: "What Caring More Can Look Like",
        paragraphs: [
          "You send the follow-up text, reopen the difficult conversation, remember what matters to them, and translate silence into possible explanations. None of those actions is automatically a problem. The strain appears when one person becomes responsible for nearly all movement and repair.",
          "You may feel loved during good moments but alone in maintaining the conditions that make those moments possible.",
        ],
        callout: "Caring more may not mean feeling more. It may mean doing more of the work that keeps the connection alive.",
      },
      {
        heading: "Overfunctioning and Emotional Labor",
        paragraphs: [
          "Overfunctioning is useful here as a plain-language description, not a diagnosis: one person starts doing tasks the relationship could distribute between two people. They initiate, anticipate, explain, soothe, and compensate until their effort becomes the relationship's operating system.",
          "The counterintuitive risk is that extra effort can hide the imbalance. If you always fill the gap quickly, you never learn whether the other person would notice it or step into it.",
        ],
      },
      {
        heading: "Uncertainty, Clarity, and Reassurance",
        paragraphs: [
          "Uncertainty can produce more checking, explaining, and attempts to secure clarity. Reassurance may calm the moment, but repeated reassurance without clearer behavior can leave the underlying question unchanged.",
          "A useful distinction is whether a conversation produces new information and mutual action, or only enough relief to restart the same cycle.",
        ],
      },
      {
        heading: "What Reciprocity Looks Like",
        paragraphs: ["Reciprocity does not require identical personalities or a perfect 50/50 split every day. It does require evidence that both people can notice and respond."],
        bullets: [
          "Pause one routine act of maintenance and observe whether the relationship still moves toward you.",
          "Make one clear request without adding a long argument for why you deserve it.",
          "Review a month of behavior rather than one unusually warm or disappointing day.",
        ],
      },
      {
        heading: "A Five Elements Reflection",
        paragraphs: [
          "The Five Elements offer symbolic roles for reflection. Earth may recognize the stabilizer, Wood the improver, Fire the initiator, Metal the standard-setter, and Water the emotional interpreter. A person can recognize several roles regardless of their element result.",
          "Elemental Bond uses these roles to generate questions, not to diagnose attachment, trauma, or personality. Your lived evidence remains more important than the label.",
        ],
      },
    ],
    faq: [
      { question: "Is caring more the same as loving more?", answer: "Not necessarily. One person may perform more visible maintenance while both people experience care differently. Look at responsiveness, follow-through, and willingness to share relational work rather than trying to measure an internal feeling." },
      { question: "Should every relationship always be equal?", answer: "Daily effort naturally changes with health, work, and circumstances. The relevant pattern is whether imbalance can be named, understood, and rebalanced over time." },
    ],
    sources: [
      { label: "Sprecher (2001), Equity and social exchange in dating couples", url: "https://doi.org/10.1207/S15327957PSPR0501_4", note: "A review of equity, exchange, and relationship outcomes." },
      { label: "Laurenceau, Barrett & Pietromonaco (1998), Intimacy as an interpersonal process", url: "https://doi.org/10.1037/0022-3514.74.5.1238", note: "Research on responsiveness and intimacy in everyday couple interactions." },
    ],
    relatedSlugs: ["why-do-i-keep-attracting-the-same-type-of-partner", "why-does-he-pull-away-when-we-get-close"],
  },
  "why-does-he-pull-away-when-we-get-close": {
    slug: "why-does-he-pull-away-when-we-get-close",
    title: "Why Does He Pull Away When We Get Closer?",
    metaTitle: "Why Does He Pull Away When We Get Closer? | Elemental Bond",
    metaDescription: "Pulling away after closeness can reflect pacing, space, uncertainty, communication, expectations, or commitment readiness—not one universal motive.",
    directAnswer: "There is no single reason someone pulls away when a relationship gets closer. Possible factors include a different preferred pace, a need for space, uncertainty about expectations, difficulty communicating, competing life demands, or limited readiness for commitment. Distance does not reliably prove secret love, rejection, or a plan to return. The clearest evidence comes from what the person communicates and whether their later behavior supports it.",
    sections: [
      {
        heading: "What The Shift Can Feel Like",
        paragraphs: [
          "A connection becomes warmer and more regular, then replies slow down or plans become vague. Because the change follows closeness, it is easy to treat the timing as a message and search for the one explanation that makes it feel controllable.",
          "The painful part is often not space itself. It is being left to interpret space without shared language for what it means.",
        ],
        callout: "Distance is information. It is not a complete explanation until communication and behavior give it context.",
      },
      {
        heading: "Several Explanations Can Fit the Same Behavior",
        paragraphs: [
          "One person may need slower pacing after an intense start. Another may be uncertain about commitment. Someone else may avoid difficult conversations, feel overwhelmed by unrelated demands, or realize that expectations do not align. The same visible behavior can come from very different internal situations.",
          "That is why confident mind-reading is risky. “He is scared because he loves you” and “he never cared” can both exceed the available evidence.",
        ],
      },
      {
        heading: "Space vs Communication Mismatch",
        paragraphs: [
          "Space can be compatible with closeness when it is communicated clearly and does not repeatedly erase agreed expectations. A communication mismatch appears when one person treats silence as self-regulation while the other experiences it as an unanswered relationship question.",
          "The counterintuitive point is that more pursuit does not always create more clarity. It can produce more interaction while leaving the original question untouched.",
        ],
      },
      {
        heading: "What To Do With Uncertainty",
        paragraphs: ["The goal is not to force an immediate emotional disclosure. It is to ask for information you can compare with later behavior."],
        bullets: [
          "Ask one neutral question about pace or expectations instead of sending several interpretive messages.",
          "Notice whether the response contains a clear preference, a realistic next step, or only temporary reassurance.",
          "Decide how much ambiguity you can accept without suspending your own plans and needs.",
        ],
      },
      {
        heading: "A Five Elements Reflection",
        paragraphs: [
          "A symbolic Five Elements lens may frame this as different relational tempos: Fire seeks visible engagement, Water processes privately, Metal wants definition, Earth protects stability, and Wood looks for forward movement. These prompts can help name a mismatch without claiming to explain another person's mind.",
          "This framework is for reflection rather than scientific prediction. Direct communication and observed behavior remain the stronger evidence.",
        ],
      },
    ],
    faq: [
      { question: "Does pulling away mean he is afraid because he loves me?", answer: "There is no reliable way to infer that from distance alone. It may reflect many different motives. Ask directly when appropriate and evaluate whether the answer is followed by consistent behavior." },
      { question: "Should I give someone space?", answer: "Space can be reasonable when expectations are communicated. You can respect another person's pace while also deciding what level of uncertainty and contact works for you." },
    ],
    sources: [
      { label: "Christensen & Heavey (1990), Demand/withdraw interaction in couples", url: "https://doi.org/10.1037/0022-3514.59.1.73", note: "Research on pursue/withdraw communication dynamics rather than presumed private motives." },
      { label: "Knobloch & Solomon (2002), Intimacy and relationship uncertainty", url: "https://doi.org/10.1111/j.1460-2466.2002.tb02531.x", note: "Research examining uncertainty and communication within close relationships." },
    ],
    relatedSlugs: ["why-do-i-keep-attracting-the-same-type-of-partner", "why-do-i-always-care-more"],
  },
};

export function getRelationshipPatternArticle(slug: string) {
  return RELATIONSHIP_PATTERN_ARTICLES[slug];
}
