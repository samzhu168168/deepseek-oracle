/** Monthly Horoscope Page — 5 elements × 12 months = 60 SEO pages */
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Breadcrumbs } from "../components/Breadcrumbs";
import { InkButton } from "../components/InkButton";
import { ELEMENTS, ELEMENT_LABELS, formatElement } from "../constants/elements";
import { findMonthBySlug, getMonthlyHoroscope } from "../constants/monthlyHoroscopes";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

const MONTH_NAV_ORDER = [
  "2026-june", "2026-july", "2026-august", "2026-september",
  "2026-october", "2026-november", "2026-december",
  "2027-january", "2027-february", "2027-march", "2027-april", "2027-may",
];

function getAdjacentMonths(currentSlug: string): { prev: string | null; next: string | null } {
  const idx = MONTH_NAV_ORDER.indexOf(currentSlug);
  return {
    prev: idx > 0 ? MONTH_NAV_ORDER[idx - 1] : null,
    next: idx < MONTH_NAV_ORDER.length - 1 ? MONTH_NAV_ORDER[idx + 1] : null,
  };
}

export default function MonthlyHoroscopePage() {
  const navigate = useNavigate();
  const { element: rawElement, slug } = useParams<{ element: string; slug: string }>();
  const element = rawElement?.toLowerCase().trim() || "";
  const isValid = ELEMENTS.includes(element as never);

  if (!isValid || !slug) {
    return (
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-text)", marginBottom: "12px" }}>
          Horoscope Not Found
        </h1>
        <p style={{ color: "var(--oracle-text-muted)", marginBottom: "24px" }}>
          {!isValid
            ? `"${formatElement(element)}" is not a valid BaZi element.`
            : "The requested month was not found."}
        </p>
        <InkButton type="button" full onClick={() => navigate("/")}>
          Back to Home
        </InkButton>
      </div>
    );
  }

  const month = findMonthBySlug(slug);
  if (!month) {
    return (
      <div className="landing-page fade-in" style={{ padding: "48px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", color: "var(--oracle-text)", marginBottom: "12px" }}>
          Month Not Found
        </h1>
        <p style={{ color: "var(--oracle-text-muted)", marginBottom: "24px" }}>
          No horoscope data for "{slug}".
        </p>
        <InkButton type="button" full onClick={() => navigate("/")}>
          Back to Home
        </InkButton>
      </div>
    );
  }

  const elLabel = ELEMENT_LABELS[element as never];
  const content = getMonthlyHoroscope(element as never, month);
  const pageUrl = `${SITE_URL}/elements/${element}/${slug}`;

  const { prev, next } = getAdjacentMonths(slug);
  const prevUrl = prev ? `/elements/${element}/${prev}` : null;
  const nextUrl = next ? `/elements/${element}/${next}` : null;

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Elements", path: "/elements/wood" },
    { label: elLabel, path: `/elements/${element}` },
    { label: `${elLabel} ${month.label} Horoscope` },
  ];

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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: content.metaTitle,
            description: content.metaDescription,
            url: pageUrl,
            author: { "@type": "Person", name: "Elemental Bond Oracle" },
            datePublished: `${month.year}-${String(month.lunarMonth).padStart(2, "0")}-01`,
            dateModified: "2026-05-19",
            publisher: { "@type": "Organization", name: "Elemental Bond" },
          })}
        </script>
      </Helmet>

      <Breadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <section className="monthly-horoscope-hero">
        <span className="landing-hero__badge">
          {elLabel} · {month.label}
        </span>
        <div className="monthly-horoscope-hero__symbol" style={{ color: content.elementColor }}>
          &#9674;
        </div>
        <h1 className="monthly-horoscope-hero__title">
          {elLabel} Element {month.label} Horoscope
        </h1>
        <p className="monthly-horoscope-hero__animal">
          {month.animal.charAt(0).toUpperCase() + month.animal.slice(1)} Month · Lunar Month {month.lunarMonth}
        </p>
        <p className="monthly-horoscope-hero__relationship" style={{ color: content.elementColor }}>
          {content.relationshipLabel}
        </p>
      </section>

      {/* Forecast sections */}
      <section className="monthly-horoscope-section">
        <h2 className="monthly-horoscope-section__title">
          <span className="oracle-symbol" aria-hidden="true">&#9829;</span>
          Love Forecast
        </h2>
        <div className="monthly-horoscope-card">
          <p>{content.loveForecast}</p>
        </div>
      </section>

      <section className="monthly-horoscope-section">
        <h2 className="monthly-horoscope-section__title">
          <span className="oracle-symbol" aria-hidden="true">&#9670;</span>
          Career Forecast
        </h2>
        <div className="monthly-horoscope-card">
          <p>{content.careerForecast}</p>
        </div>
      </section>

      <section className="monthly-horoscope-section">
        <h2 className="monthly-horoscope-section__title">
          <span className="oracle-symbol" aria-hidden="true">&#10013;</span>
          Health Forecast
        </h2>
        <div className="monthly-horoscope-card">
          <p>{content.healthForecast}</p>
        </div>
      </section>

      <section className="monthly-horoscope-section">
        <h2 className="monthly-horoscope-section__title">
          <span className="oracle-symbol" aria-hidden="true">&#10022;</span>
          Advice for This Month
        </h2>
        <div className="monthly-horoscope-card monthly-horoscope-card--advice">
          <p>{content.advice}</p>
        </div>
      </section>

      {/* Month navigation */}
      <nav className="monthly-horoscope-nav" aria-label="Month navigation">
        {prevUrl ? (
          <Link to={prevUrl} className="monthly-horoscope-nav__link">
            &larr; Previous Month
          </Link>
        ) : (
          <span />
        )}
        {nextUrl ? (
          <Link to={nextUrl} className="monthly-horoscope-nav__link">
            Next Month &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Cross-links */}
      <section className="monthly-horoscope-links">
        <h2 className="monthly-horoscope-links__title">Explore More</h2>
        <div className="monthly-horoscope-links__grid">
          <Link to={`/elements/${element}`} className="monthly-horoscope-links__card">
            <span className="monthly-horoscope-links__card-label">{elLabel} Element</span>
            <span className="monthly-horoscope-links__card-desc">
              Learn about the {elLabel} personality type in BaZi
            </span>
          </Link>
          <Link to="/bazi" className="monthly-horoscope-links__card">
            <span className="monthly-horoscope-links__card-label">Your Personal BaZi</span>
            <span className="monthly-horoscope-links__card-desc">
              Get your complete birth chart reading
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="monthly-horoscope-cta">
        <p className="monthly-horoscope-cta__text">
          Your BaZi birth chart reveals which element you are — and every month brings a new
          opportunity to align with your elemental nature. Discover your element today.
        </p>
        <InkButton type="button" full onClick={() => navigate("/bazi")}>
          Get Your Personal BaZi Reading &rarr;
        </InkButton>
      </section>
    </div>
  );
}
