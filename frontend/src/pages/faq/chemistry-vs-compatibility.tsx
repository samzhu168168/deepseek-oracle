import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "chemistry-vs-compatibility";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "Is chemistry the same as compatibility?";
const META_DESC = "Chemistry is intense, immediate, and often familiar. Compatibility reveals itself over time through consistency. The two are not the same.";

export default function ChemistryVsCompatibilityPage() {
  return (
    <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <Helmet>
        <title>{QUESTION} | Elemental Bond</title>
        <meta name="description" content={META_DESC} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={`${QUESTION} | Elemental Bond`} />
        <meta property="og:description" content={META_DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <h1>{QUESTION}</h1>

      <p>
        No. Chemistry is the recognition of something familiar, not the promise of something sustainable. Two people can have electric chemistry and be entirely misaligned in how they give and receive love. The confusion between the two is one of the most common reasons people repeat the same dynamic with different partners. The pull feels meaningful — and it is — but meaning and durability are not the same thing.
      </p>

      <p>
        Chemistry tends to arrive fast. It feels automatic, magnetic, almost beyond explanation. That automatic feeling is often the first clue that a pattern is being activated — your system recognizes a relational dynamic you have experienced before, and it responds with intensity because the dynamic is familiar, not because it is good for you. The intensity of chemistry comes from recognition, not from depth. Depth requires time. Chemistry requires only a match.
      </p>

      <p>
        Compatibility, by contrast, is quiet. It does not announce itself with adrenaline. It shows up in how disagreements resolve, how space is handled, how consistency holds when the initial intensity fades. Compatibility is not a feeling you chase — it is a pattern you observe. It is present in the dynamic that remains after chemistry settles into its normal rhythm. The quiet ones are the ones that last, but quiet has no hook, so most people do not notice it until the pattern has already run its course.
      </p>

      <p>
        Confusing the two keeps the cycle running. When intensity is mistaken for depth, the end of a relationship looks like a loss of magic rather than the exposure of a mismatch. The question is not whether the feeling was real. The question is whether the feeling was pointing toward something durable or something familiar. The same nervous system can produce both. Learning to tell the difference is what changes the pattern.
      </p>

      <div style={{ marginTop: "32px", padding: "24px", background: "#f5f3f0", borderRadius: "8px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>
          See the pattern behind your choices — free reading at elemental.bond
        </p>
        <Link to="/" style={{ display: "inline-block", padding: "12px 32px", background: "#1a1a2e", color: "#fff", borderRadius: "6px", textDecoration: "none", fontWeight: 600 }}>
          Take the Free Reading
        </Link>
      </div>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": QUESTION,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Chemistry is the recognition of something familiar, not the promise of something sustainable. Chemistry tends to arrive fast and intense. Compatibility, by contrast, is quiet. It shows up in how disagreements resolve and how consistency holds when the initial intensity fades. Confusing the two keeps the cycle running. When intensity is mistaken for depth, the end of a relationship looks like a loss of magic rather than the exposure of a mismatch."
            }
          }]
        })}
      </script>
    </div>
  );
}
