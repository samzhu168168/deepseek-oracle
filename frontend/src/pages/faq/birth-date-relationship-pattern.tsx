import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const SLUG = "birth-date-relationship-pattern";
const CANONICAL = `${SITE_URL}/faq/${SLUG}`;
const QUESTION = "How does birth date affect relationship patterns?";
const META_DESC = "Birth date alone does not decide your choices. But the elemental composition associated with your birth timing can shape how you give love, receive it, and what you are drawn to.";

export default function BirthDatePatternPage() {
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
        Birth date alone does not decide your choices, but it can reveal something important about how you tend to give and receive love. The date carries a specific elemental composition — drawn from a tradition that maps time into five core energies (BaZi). These energies are not instructions. They are tendencies. Like a native language, they shape what feels natural, what feels like effort, and what you are drawn to before you have a chance to think about it.
      </p>

      <p>
        The practical effect of this composition is not mysterious. People with different elemental patterns tend to repeat specific relational dynamics. One pattern may have a natural pull toward partners who require care and support. Another may be drawn to people who offer intensity but little stability. A third may gravitate toward relationships that feel safe at first but slowly begin to constrain. None of these are choices made in bad faith. They are expressions of a pattern that operates beneath conscious preference.
      </p>

      <p>
        Knowing your elemental makeup does not tell you who to choose. It tells you what you have been choosing and why it has felt inevitable. The same relational loop that looked like a series of coincidences begins to show a clear shape once you have a framework for seeing it. This is not about prediction. It is about recognition.
      </p>

      <p>
        The value of this lens is that it separates the pattern from the person. When you can see that your attraction to a certain kind of relationship is not a mistake but an expression of a deeper structure, you stop blaming yourself for repeating it and start understanding what would need to shift for the pattern to change. The pattern does not define you. It describes what has been running unnoticed. Once noticed, it can be engaged with rather than acted out.
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
              "text": "Birth date alone does not decide your choices, but it can reveal how you tend to give and receive love. The date carries a specific elemental composition that shapes what feels natural and what you are drawn to before you have time to think. Knowing your elemental makeup tells you what you have been choosing and why it has felt inevitable. The pattern does not define you. It describes what has been running unnoticed. Once noticed, it can be engaged with rather than acted out."
            }
          }]
        })}
      </script>
    </div>
  );
}
