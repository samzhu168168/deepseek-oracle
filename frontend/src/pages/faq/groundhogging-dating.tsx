import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "groundhogging-dating";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "What is groundhogging in dating and how do I stop it?";
const META_DESC = "Groundhogging is dating the same person with a different face, different name, same dynamic. It is not a preference. It is a loop.";

export default function GroundhoggingDatingPage() {
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
        If you have ever ended a relationship and found yourself, six months later, in the exact same situation with someone new — the same unspoken rules, the same slow erosion, the same version of loneliness that wears a different face — you are not repeating poor judgment. You are groundhogging.
      </p>

      <p>
        Groundhogging is dating the same person with a different face, different name, same dynamic. It is not a preference. It is a loop. And the loop is not in your taste; it is in what your nervous system learned to call <em>home</em>.
      </p>

      <p>
        This is not a character flaw. Your nervous system seeks what it already knows. The pattern is not in the person you chose — it is in what felt familiar enough to feel like connection. You may have walked into the room thinking this one was different, but your body recognized the temperature, the pacing, the exact distance between closeness and abandonment. The pattern repeats because the pattern was never about them. It was about what your system learned to equate with love. You did not choose the pattern consciously. You responded to it before thought arrived. The pattern is older than your last relationship. It is older than your dating history. Until you can see the pattern, the pattern chooses for you.
      </p>

      <p>
        What would it mean to be attracted to something your system does not already recognize? Most people cannot answer this because they have never mapped what their system actually responds to. They know the outcomes — the same ending, the same ache — but not the mechanics. That mapping is what breaks the loop. It is not about forcing yourself to want someone healthier. It is about understanding why the familiar felt like fate, and what happens when the familiar is no longer the only option on the menu.
      </p>

      <p>
        If you are tired of recognizing the ending before the middle has begun, the first step is not a new strategy. It is a clear look at the architecture of your own attraction. The free reading at elemental.bond is built for this: it maps the specific pattern you have been living inside — the one that looks like chemistry, feels like comfort, and ends like clockwork. The reading does not tell you who to choose. It shows you what you have been choosing — and why.
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
              "text": "Groundhogging is dating the same person with a different face, different name, same dynamic. It is not a preference. It is a loop. The loop is not in your taste; it is in what your nervous system learned to call home. The pattern repeats because the pattern was never about them. It was about what your system learned to equate with love. Until you can see the pattern, the pattern chooses for you. The free reading at elemental.bond maps the specific pattern you have been living inside."
            }
          }]
        })}
      </script>
    </div>
  );
}
