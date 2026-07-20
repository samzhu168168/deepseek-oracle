import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "familiar-vs-safe";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "Why does someone familiar feel safe even when they're not?";
const META_DESC = "Familiarity is not safety. It is recognition. And recognition can be trained by repetition — even when the repetition is harmful.";

export default function FamiliarVsSafePage() {
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
        Familiarity is not safety. It is recognition. The reason someone can feel like home while also being wrong for you is that your nervous system does not distinguish between what is familiar and what is safe — it treats them as the same signal. If a certain dynamic was present in your early environment or repeated across past relationships, your system learned to predict it. Predictability, even of something painful, creates a sense of control. That sense of control is what gets labeled as comfort.
      </p>

      <p>
        The pattern here is subtle because it is so effective. You do not feel drawn to someone who feels familiar and also unavailable. You feel drawn to someone who feels familiar. The unavailability is a feature of the pattern, not a contradiction within it. The two arrive together. Many people do not realize they have been equating familiarity with safety until they enter a relationship that is consistently present and calm — and find that the absence of familiar tension feels wrong.
      </p>

      <p>
        A concrete example helps clarify this. Someone who grew up with a caregiver whose attention was inconsistent may find that steady, predictable attention from a partner does not feel like love. It feels empty. It lacks the familiar texture of reaching, guessing, and being received. That does not mean the steady partner is wrong. It means the nervous system has learned to read the reaching-and-guessing dynamic as intimacy. The quiet presence of someone who simply stays does not activate the same familiarity.
      </p>

      <p>
        Untangling familiarity from safety is not about forcing yourself to trust what feels foreign. It is about recognizing that the feeling of safety you chase may be the feeling of a pattern repeating itself successfully. Identifying the pattern is what makes it possible to choose something else.
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
              "text": "Familiarity is not safety. It is recognition. Your nervous system does not distinguish between what is familiar and what is safe — it treats them as the same signal. If a certain dynamic was present in your early environment, your system learned to predict it. Predictability, even of something painful, creates a sense of control. That sense of control is what gets labeled as comfort. Many people do not realize they have been equating familiarity with safety until they enter a relationship that is consistently calm and find the absence of familiar tension feels wrong."
            }
          }]
        })}
      </script>
    </div>
  );
}
