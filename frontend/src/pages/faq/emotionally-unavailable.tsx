import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "emotionally-unavailable";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "Why do I keep attracting emotionally unavailable people?";
const META_DESC = "It does not feel like poor judgment when you are inside it. The attraction to someone emotionally unavailable often feels more like depth than distance.";

export default function EmotionallyUnavailablePage() {
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
        It does not feel like poor judgment when you are inside it. The attraction to someone emotionally unavailable often feels more like depth than distance. Their inconsistency reads as complexity. Their withdrawal reads as something you have not yet earned. The feeling is familiar, which is precisely the problem.
      </p>

      <p>
        The pattern is not about your taste in people. It is about what your nervous system learned to interpret as connection. If emotional availability was scarce in your early relationships — not only romantic ones — your system may have learned to associate distance with safety, because closeness required work and distance offered relief. That relief becomes the baseline. And people who offer steady presence feel strangely uninteresting because they do not trigger the familiar loop of reaching, waiting, and finally receiving.
      </p>

      <p>
        This pattern has a specific shape. It looks like choosing people who are present in flashes and absent in stretches. It looks like feeling confused about where you stand more often than you feel certain. It looks like excusing inconsistency because the moments of connection are intense enough to overwrite the long gaps between them. That is not chemistry working in your favor. That is a pattern that knows how to keep itself hidden by calling itself hope. The hope is real, but it is being deployed in service of a loop that depends on intermittent reward to stay alive.
      </p>

      <p>
        You cannot interrupt this loop by trying harder. Trying harder within a familiar pattern usually deepens it. The interruption happens when you can see the architecture of the attraction itself — what it responds to, what it mistakes for love, and what it has been repeating on your behalf without your awareness.
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
              "text": "It does not feel like poor judgment when you are inside it. The attraction to someone emotionally unavailable often feels more like depth than distance. Their inconsistency reads as complexity. Their withdrawal reads as something you have not yet earned. The pattern is not about your taste in people. It is about what your nervous system learned to interpret as connection. You cannot interrupt this loop by trying harder. The interruption happens when you can see the architecture of the attraction itself."
            }
          }]
        })}
      </script>
    </div>
  );
}
