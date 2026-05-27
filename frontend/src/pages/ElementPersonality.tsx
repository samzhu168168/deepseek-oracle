/** Element Personality Page — SEO-optimized landing page for each of the 5 elements */
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Breadcrumbs } from "../components/Breadcrumbs";
import { RelatedArticles } from "../components/RelatedArticles";
import { InkButton } from "../components/InkButton";
import { ELEMENTS, ELEMENT_LABELS, formatElement } from "../constants/elements";
import { getElementPersonalityContent } from "../constants/elementPersonality";
import { MONTHS } from "../constants/monthlyHoroscopes";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function ElementPersonalityPage() {
  const navigate = useNavigate();
  const { element: rawElement } = useParams();
  const element = rawElement?.toLowerCase().trim() || "";
  const isValid = ELEMENTS.includes(element as never);

  if (!isValid) {
    return (
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-text)", marginBottom: "12px" }}>
          Element Not Found
        </h1>
        <p style={{ color: "var(--oracle-text-muted)", marginBottom: "24px" }}>
          &ldquo;{formatElement(element)}&rdquo; is not a valid BaZi element.
          Choose from Wood, Fire, Earth, Metal, or Water.
        </p>
        <InkButton type="button" full onClick={() => navigate("/")}>
          Try a Compatibility Reading
        </InkButton>
      </div>
    );
  }

  const content = getElementPersonalityContent(element as never);
  const label = ELEMENT_LABELS[element as never];
  const pageUrl = `${SITE_URL}/elements/${element}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.metaTitle,
    description: content.metaDescription,
    url: pageUrl,
    author: { "@type": "Person", name: "Elemental Bond Oracle" },
    datePublished: "2026-05-01",
    dateModified: "2026-05-19",
    publisher: { "@type": "Organization", name: "Elemental Bond" },
  };

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Elements", path: "/elements/wood" },
    { label },
  ];

  const bestPairUrl = `/compatibility/elements/${element}-and-${content.bestMatch.element}`;
  const challengePairUrl = `/compatibility/elements/${element}-and-${content.challengingMatch.element}`;

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>{content.metaTitle}</title>
        <meta name="description" content={content.metaDescription} />
        <meta name="keywords" content={content.metaKeywords} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.metaTitle} />
        <meta name="twitter:description" content={content.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={breadcrumbItems} />

      {/* ── Hero ── */}
      <section className="element-personality-hero">
        <span className="landing-hero__badge">{label} Element</span>
        <div className="element-personality-hero__symbol" style={{ color: content.elementColor }}>
          {content.symbol}
        </div>
        <h1 className="element-personality-hero__title">
          The {label} Element in BaZi
        </h1>
        <p className="element-personality-hero__chinese">{content.chineseName}</p>
        <p className="element-personality-hero__subtitle">{content.subtitle}</p>
        <p className="element-personality-hero__dm">
          <strong>Day Masters:</strong> {content.dayMasterTypes}
        </p>
      </section>

      {/* ── Strengths & Weaknesses ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          {label} Personality Traits
        </h2>
        <div className="element-personality-traits-grid">
          <div className="element-personality-card element-personality-card--strengths">
            <h3 className="element-personality-card__title">Strengths</h3>
            <ul className="element-personality-card__list">
              {content.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="element-personality-card element-personality-card--weaknesses">
            <h3 className="element-personality-card__title">Challenges</h3>
            <ul className="element-personality-card__list">
              {content.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Relationship Patterns ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          {label} in Relationships
        </h2>
        <p className="element-personality-section__text">{content.relationshipDynamic}</p>
        <div className="element-personality-matches">
          <div className="element-personality-card element-personality-card--match">
            <span className="element-personality-card__badge">Best Match</span>
            <h3 className="element-personality-card__title">
              {content.bestMatch.label}
            </h3>
            <p className="element-personality-card__text">{content.bestMatch.reason}</p>
            <InkButton type="button" full onClick={() => navigate(bestPairUrl)}>
              Explore {label} &amp; {content.bestMatch.label} →
            </InkButton>
          </div>
          <div className="element-personality-card element-personality-card--match-challenge">
            <span className="element-personality-card__badge">Growth Pair</span>
            <h3 className="element-personality-card__title">
              {content.challengingMatch.label}
            </h3>
            <p className="element-personality-card__text">{content.challengingMatch.reason}</p>
            <InkButton type="button" full onClick={() => navigate(challengePairUrl)}>
              Explore {label} &amp; {content.challengingMatch.label} →
            </InkButton>
          </div>
        </div>
      </section>

      {/* ── Career ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          Career &amp; Life Path
        </h2>
        <p className="element-personality-section__text">
          {label} personalities naturally gravitate toward careers that align with their elemental nature.
        </p>
        <ul className="element-personality-section__list">
          {content.careerTraits.map((t, i) => (
            <li key={i} className="element-personality-section__list-item">{t}</li>
          ))}
        </ul>
      </section>

      {/* ── 2026 Snake Year Outlook ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          2026 Snake Year Outlook for {label}
        </h2>
        <div className="element-personality-2026-card">
          <p className="element-personality-2026-card__outlook">
            {content.year2026Outlook}
          </p>
          <div className="element-personality-2026-card__advice">
            <strong>Advice:</strong> {content.year2026Advice}
          </div>
        </div>
        <div style={{ marginTop: "var(--space-md)" }}>
          <InkButton
            type="button"
            full
            onClick={() => navigate(`/articles/${content.dayMaster2026Slug}`)}
          >
            Read Full 2026 Element Guide →
          </InkButton>
        </div>
      </section>

      {/* ── Explore Other Elements ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          Explore All Elements
        </h2>
        <div className="element-personality-explore-grid">
          {ELEMENTS.filter((e) => e !== element).map((e) => (
            <a
              key={e}
              href={`/elements/${e}`}
              className="element-personality-explore-link"
            >
              <span className="element-personality-explore-link__name">
                {ELEMENT_LABELS[e]}
              </span>
              <span className="element-personality-explore-link__arrow">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Monthly Horoscopes ── */}
      <section className="element-personality-section">
        <h2 className="element-personality-section__title">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          {label} Monthly Horoscopes
        </h2>
        <p className="element-personality-section__text">
          See how the {label} element interacts with each month's energy. Your elemental nature
          responds differently to each Chinese zodiac animal month — some nourish you, others
          challenge you, and some reflect your own energy back at you.
        </p>
        <div className="element-personality-explore-grid">
          {MONTHS.map((m) => (
            <a
              key={m.slug}
              href={`/elements/${element}/${m.slug}`}
              className="element-personality-explore-link"
            >
              <span className="element-personality-explore-link__name">
                {m.label}
              </span>
              <span className="element-personality-explore-link__arrow">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-footnote" style={{ marginTop: "var(--space-2xl)" }}>
        <details open>
          <summary>FAQ: {label} Element Personality</summary>
          {content.faq.map((q, i) => (
            <div key={i}>
              <p><strong>{q.q}</strong></p>
              <p>{q.a}</p>
            </div>
          ))}
        </details>
      </section>

      {/* ── Related Articles ── */}
      <RelatedArticles slugs={content.relatedArticleSlugs} title={`More About ${label}`} />

      {/* ── CTA ── */}
      <section className="element-personality-cta">
        <p className="element-personality-cta__text">
          Discover your own elemental blueprint. What does your birth chart reveal about you?
        </p>
        <InkButton type="button" full onClick={() => navigate("/bazi")}>
          Get Your Personal BaZi Reading →
        </InkButton>
      </section>
    </div>
  );
}
