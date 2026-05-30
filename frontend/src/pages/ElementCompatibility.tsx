/** Element Compatibility Page — 25 programmatic SEO pages for BaZi element pairs */
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { InkButton } from "../components/InkButton";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ELEMENTS, ELEMENT_LABELS, ELEMENT_CHINESE, getElementPairContent, formatElement, getRelationship } from "../constants/elements";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function ElementCompatibilityPage() {
  const navigate = useNavigate();
  const { element1: rawE1, element2: rawE2 } = useParams();

  const e1 = rawE1?.toLowerCase().trim() || "";
  const e2 = rawE2?.toLowerCase().trim() || "";

  const isValid = ELEMENTS.includes(e1 as never) && ELEMENTS.includes(e2 as never);

  if (!isValid) {
    return (
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-text)", marginBottom: "12px" }}>
          Element Combination Not Found
        </h1>
        <p style={{ color: "var(--oracle-text-muted)", marginBottom: "24px" }}>
          "{formatElement(e1)}" and "{formatElement(e2)}" is not a valid BaZi element pair.
        </p>
        <InkButton type="button" full onClick={() => navigate("/")}>
          Try a Compatibility Reading
        </InkButton>
      </div>
    );
  }

  const content = getElementPairContent(e1 as never, e2 as never);
  const label1 = ELEMENT_LABELS[e1 as never];
  const label2 = ELEMENT_LABELS[e2 as never];
  const rel = getRelationship(e1 as never, e2 as never);
  const pageUrl = `${SITE_URL}/compatibility/elements/${e1}-and-${e2}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqQuestions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    })),
  };

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.description} />
        <meta name="keywords" content={content.keywords} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.title} />
        <meta name="twitter:description" content={content.description} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[
        { label: "Home", path: "/" },
        { label: "Elements", path: "/elements/wood" },
        { label: `${label1} & ${label2}` },
      ]} />

      {/* Relationship badge */}
      <section className="landing-hero">
        <span className="landing-hero__badge">{rel === "same" ? "Same Element " : rel === "generates" || rel === "generated_by" ? "Generative Cycle " : "Controlling Cycle "}Pair</span>
        <h1 className="landing-hero__title">
          {label1} &amp; {label2}
        </h1>
        <p className="landing-hero__subtitle">
          {ELEMENT_CHINESE[e1 as never]} meets {ELEMENT_CHINESE[e2 as never]}.{" "}
          {content.compatibilityNote}
        </p>

        {/* Element traits */}
        <div className="element-traits-grid" style={{ display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap", justifyContent: "center" }}>
          <div className="element-trait-card" style={{ flex: "1 1 200px", maxWidth: "280px", padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ fontSize: "14px", color: "var(--oracle-accent)", marginBottom: "8px" }}>{label1}</h3>
            <p style={{ fontSize: "13px", color: "var(--oracle-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {ELEMENT_STRENGTHS_SHORT[e1 as never]}
            </p>
          </div>
          <div className="element-trait-card" style={{ flex: "1 1 200px", maxWidth: "280px", padding: "20px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ fontSize: "14px", color: "var(--oracle-accent)", marginBottom: "8px" }}>{label2}</h3>
            <p style={{ fontSize: "13px", color: "var(--oracle-text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {ELEMENT_STRENGTHS_SHORT[e2 as never]}
            </p>
          </div>
        </div>

        {/* Relationship details */}
        <div className="element-relationship-detail" style={{ marginTop: "32px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          <h2 style={{ fontSize: "15px", color: "var(--oracle-accent)", marginBottom: "12px", fontWeight: 600 }}>
            🌓 Relationship Dynamic
          </h2>
          <p style={{ fontSize: "14px", color: "var(--oracle-text-secondary)", lineHeight: 1.7, margin: 0 }}>
            {content.relationshipSummary}
          </p>

          <div className="element-detail-columns" style={{ display: "flex", gap: "24px", marginTop: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <h3 style={{ fontSize: "13px", color: "var(--oracle-teal)", marginBottom: "8px", fontWeight: 600 }}>Strengths</h3>
              <p style={{ fontSize: "13px", color: "var(--oracle-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {content.strengthPoints}
              </p>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <h3 style={{ fontSize: "13px", color: "var(--oracle-nebula-pink)", marginBottom: "8px", fontWeight: 600 }}>Challenges</h3>
              <p style={{ fontSize: "13px", color: "var(--oracle-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {content.challengePoints}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="landing-hero__actions" style={{ marginTop: "36px" }}>
          <InkButton type="button" full onClick={() => navigate("/")}>
            Reveal Your Elemental Pattern
          </InkButton>
        </div>

        {/* Cross-link to element personality pages */}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`/elements/${e1}`} className="oracle-button oracle-button--secondary" style={{ fontSize: "13px", padding: "8px 20px", textDecoration: "none" }}>
            Explore {label1} Personality →
          </a>
          <a href={`/elements/${e2}`} className="oracle-button oracle-button--secondary" style={{ fontSize: "13px", padding: "8px 20px", textDecoration: "none" }}>
            Explore {label2} Personality →
          </a>
        </div>
      </section>
    </div>
  );
}

const ELEMENT_STRENGTHS_SHORT: Record<string, string> = {
  wood: "Visionary and growth-oriented. They see the big picture and inspire others to build toward it.",
  fire: "Passionate and charismatic. They radiate warmth and draw people to them naturally.",
  earth: "Grounded and nurturing. They provide unwavering stability and patient care.",
  metal: "Precise and principled. They bring structure, integrity, and refined quality.",
  water: "Deep and intuitive. They possess extraordinary emotional intelligence and adaptability.",
};
