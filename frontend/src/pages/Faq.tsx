import { Helmet } from "react-helmet-async";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const QUESTIONS = [
  ["What is a BaZi / five-element compatibility test?", "A BaZi compatibility test compares patterns derived from two birth records using concepts from the Chinese Five Elements and Four Pillars traditions. Elemental Bond first provides a simplified element-level preview; a full traditional chart would also consider year, month, day, hour, and their interactions."],
  ["How is this different from Western astrology compatibility?", "Western astrology commonly compares planetary placements and zodiac signs. BaZi uses a Chinese calendrical framework organized around heavenly stems, earthly branches, yin-yang, and the Five Elements. The systems use different inputs and interpretive rules, so their results are not directly interchangeable."],
  ["Do I need my exact birth time?", "No. The free core-element and relationship previews can run from birth dates alone. An exact birth time supplies the hour pillar in a full BaZi chart, so time-dependent interpretations are necessarily less specific when the hour is unknown."],
  ["Is this based on real Chinese astrology methodology?", "The product vocabulary and relationship framework draw from BaZi and Five Elements traditions. The instant free result is deliberately simplified and should not be represented as a complete professional Four Pillars calculation. It is an interpretive reflection tool, not a scientifically validated assessment."],
  ["How accurate is elemental.bond compared to Co–Star or The Pattern?", "There is no independent accuracy dataset that supports a numerical comparison among these products. Co–Star is associated with Western astrology, The Pattern presents astrology-based personality and timing content, and Elemental Bond uses a BaZi-inspired Five Elements framework. Their outputs should be compared by method and scope, not by an unsupported accuracy score."],
] as const;

export default function FaqPage() {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: QUESTIONS.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  return <div className="funnel-page content-page"><Helmet><title>What Is BaZi Compatibility? — Five-Element Test FAQ</title><meta name="description" content="What is BaZi compatibility, is birth time required, and how does a five-element test differ from Western astrology apps? Direct, factual answers." /><link rel="canonical" href={`${SITE_URL}/faq`} /><script type="application/ld+json">{JSON.stringify(schema)}</script></Helmet>
    <header><p className="funnel-eyebrow">Elemental Bond FAQ</p><h1>What is a BaZi compatibility test?</h1><p className="extract-summary">A BaZi compatibility test compares two birth records through the Chinese Five Elements and Four Pillars framework. Elemental Bond offers a simplified free pattern preview and a separate full report. It is designed for reflection and entertainment, not as a scientifically validated personality, relationship, medical, legal, or financial assessment.</p></header>
    {QUESTIONS.map(([question, answer]) => <section key={question}><h2>{question}</h2><p>{answer}</p></section>)}
  </div>;
}
