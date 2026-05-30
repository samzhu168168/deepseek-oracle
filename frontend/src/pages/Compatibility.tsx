import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Breadcrumbs } from "../components/Breadcrumbs";
import { InkButton } from "../components/InkButton";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

const formatSign = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function CompatibilityPage() {
  const navigate = useNavigate();
  const { sign1: rawSign1, sign2: rawSign2 } = useParams();

  const sign1 = rawSign1?.trim() ? formatSign(rawSign1) : "Your Sign";
  const sign2 = rawSign2?.trim() ? formatSign(rawSign2) : "Their Sign";

  const title = `${sign1} and ${sign2} BaZi Compatibility — Free Reading | Elemental Bond`;
  const description = `Free BaZi compatibility calculator for ${sign1} and ${sign2}. Discover Five Element dynamics, Soul Resonance Score, karmic patterns, and your 2026 relationship timeline.`;
  const ctaLabel = `Reveal Your ${sign1} & ${sign2} Soul Pattern`;

  const pageUrl = rawSign1 && rawSign2
    ? `${SITE_URL}/compatibility/${rawSign1}-and-${rawSign2}`
    : SITE_URL;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", name: "Elemental Bond", url: SITE_URL },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Are ${sign1} and ${sign2} compatible?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${sign1} and ${sign2} compatibility depends on their Five Element balance — not just zodiac stereotypes. Enter both birth dates to see your exact elemental pattern and Soul Resonance Score.`,
        },
      },
      {
        "@type": "Question",
        name: `What makes ${sign1}-${sign2} relationships unique?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Each ${sign1}-${sign2} pairing carries a distinct Five Element signature. Some create productive tension (Fire-Water), others natural harmony (Earth-Metal). The real answer is in the birth charts, not the sun signs.`,
        },
      },
    ],
  };

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={`${sign1} ${sign2} compatibility, bazi compatibility calculator, ${sign1.toLowerCase()} ${sign2.toLowerCase()} bazi reading, ${sign1.toLowerCase()} ${sign2.toLowerCase()} five element match, ${sign1.toLowerCase()} ${sign2.toLowerCase()} soul bond, chinese astrology compatibility`}
        />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Elemental Bond" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(webPageJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Breadcrumbs items={[
        { label: "Home", path: "/" },
        { label: "Compatibility", path: "/" },
        { label: `${sign1} & ${sign2}` },
      ]} />

      <section className="landing-hero">
        <span className="landing-hero__badge">Compatibility Blueprint</span>
        <h1 className="landing-hero__title">{title}</h1>
        <p className="landing-hero__subtitle">
          Every pairing holds a hidden rhythm that only reveals itself through deeper elemental patterns. The connection
          between {sign1} and {sign2} carries a distinct signature that blends destiny, timing, and temperament into a
          story worth decoding.
        </p>
        <p className="landing-hero__subtitle" style={{ fontSize: "1rem", opacity: 0.8, marginTop: "1rem" }}>
          Zodiac signs tell you <em>what</em> you are. BaZi reveals <em>why</em> you're drawn to each other —
          and what the pattern means for your 2026.
        </p>
        <div className="landing-hero__actions">
          <InkButton type="button" full onClick={() => navigate("/")}>
            {ctaLabel}
          </InkButton>
        </div>
      </section>
    </div>
  );
}
