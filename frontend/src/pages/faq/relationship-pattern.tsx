import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "relationship-pattern";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "What is a relationship pattern and how do I identify mine?";
const META_DESC = "A relationship pattern is a recurring dynamic that plays out across different partners. It does not change when the person changes because it was never about the person.";

export default function RelationshipPatternPage() {
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
        A relationship pattern is a recurring dynamic that plays out across different partners, often without your awareness. It does not change when the person changes because it was never about the person. The pattern lives in what you are drawn to, what you tolerate, and the point at which things begin to feel familiar enough to feel like love.
      </p>

      <p>
        Identifying a pattern requires looking not at the surface details — job, appearance, how you met — but at the emotional architecture that repeats. Three signs can help you recognize one. First, the same conflict type surfaces in relationship after relationship, sometimes with the same timing. Second, the feeling of dissatisfaction arrives at a predictable point — three months in, six months in, the exact moment commitment becomes available. Third, you find yourself saying "I have been here before" while inside a situation that appears completely new on paper.
      </p>

      <p>
        You can test whether a pattern is running by asking two questions. The first: across your last few relationships, what was the one feeling that kept returning? Not the circumstances — the feeling. The second: if you describe the relationships to a close friend, do they use the same words each time? If the story sounds the same even when the names change, the pattern is the structure beneath the story.
      </p>

      <p>
        Recognizing a pattern does not require years of analysis. It requires a clear lens. The same dynamics that look like "bad luck" or "wrong timing" often reveal a consistent shape when you step far enough back to see it. That shape is the pattern — and once you can name it, you are no longer inside it blindly. Naming it is not a cure. It is the condition under which change becomes possible.
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
              "text": "A relationship pattern is a recurring dynamic that plays out across different partners, often without your awareness. It does not change when the person changes because it was never about the person. Three signs can help you recognize one. First, the same conflict type surfaces with the same timing. Second, the feeling of dissatisfaction arrives at a predictable point. Third, you find yourself saying 'I have been here before.' The same dynamics that look like bad luck often reveal a consistent shape when you step far enough back to see it."
            }
          }]
        })}
      </script>
    </div>
  );
}
