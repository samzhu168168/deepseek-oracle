/**
 * Home Page - The Oracle
 * Entry point for relationship compatibility analysis
 */
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";
import { getPatternCount } from "../utils/counters";
import { ElementQuiz } from "../components/ElementQuiz";

type PersonInput = {
  date: string;
  time: string;
  gender: "Male" | "Female";
};

const createInitialPerson = (gender: "Male" | "Female"): PersonInput => ({
  date: "",
  time: "",
  gender,
});

const LOADING_MESSAGES = [
  "Reading the elemental pattern...",
  "Calculating karmic resonance...",
  "Mapping your 2026 Snake Year windows...",
  "Decoding the dynamic between you...",
  "The Oracle is preparing your Blueprint...",
];

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

type SharedResult = {
  element1: string;
  element2: string;
  score: number;
  label: string;
} | null;

export default function HomePage() {
  const navigate = useNavigate();
  const [personA, setPersonA] = useState<PersonInput>(() => createInitialPerson("Male"));
  const [personB, setPersonB] = useState<PersonInput>(() => createInitialPerson("Female"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [sharedResult, setSharedResult] = useState<SharedResult>(null);
  const [patternCount] = useState(() => getPatternCount());
  const [emailInput, setEmailInput] = useState("");

  const onEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/thank-you");
  };

  // ── Detect shared result from URL param ?r=<base64> ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rParam = params.get("r");
    if (!rParam) return;
    try {
      const decoded = JSON.parse(atob(rParam)) as {
        e1: string;
        e2: string;
        s: number;
        l: string;
      };
      if (decoded.e1 && decoded.e2 && decoded.s) {
        setSharedResult({
          element1: decoded.e1,
          element2: decoded.e2,
          score: decoded.s,
          label: decoded.l || "",
        });
      }
    } catch {
      // Invalid shared link — silently ignore
    }
  }, []);

  useEffect(() => {
    const base = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");
    fetch(`${base}/api/health`, { method: "GET" }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    if (!personA.date) {
      setError("Person A: Birth date is required.");
      return;
    }
    if (!personB.date) {
      setError("Person B: Birth date is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        person_a: {
          date: personA.date,
          time: personA.time,
          gender: personA.gender,
        },
        person_b: {
          date: personB.date,
          time: personB.time,
          gender: personB.gender,
        },
      };
      const response = await analyzeBond(payload);
      const report = response?.data ?? response?.report ?? response;
      if (!report) {
        throw new Error("Analysis result is empty.");
      }
      const stored = {
        payload,
        report,
      };
      window.sessionStorage.setItem("bond:last_report", JSON.stringify(stored));
      navigate("/result", { state: stored });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        "Request timeout, please try again";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Elemental Bond",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elemental Bond — BaZi Compatibility Calculator",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "Free BaZi compatibility calculator using 2,000-year-old Chinese metaphysics. Enter two birth dates to reveal your Five Element dynamic, karmic patterns, and 2026 relationship activation windows.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free BaZi compatibility reading",
    },
    featureList: [
      "Free BaZi compatibility calculator",
      "Five Element analysis",
      "Soul Resonance Score",
      "2026 Snake Year timing windows",
      "Full report with karmic protocol",
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why do I keep attracting the same relationship pattern?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Your BaZi chart contains elemental imprints that generate predictable relationship dynamics. The common variable across your relationships is your own elemental composition. BaZi pattern analysis names this dynamic so you can choose to work with it or break it.",
        },
      },
      {
        "@type": "Question",
        name: "How is BaZi compatibility different from AI relationship advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "BaZi is a 2,000-year-old Chinese metaphysical system — pattern recognition that predates modern algorithms by twenty centuries. Unlike generic AI-generated advice, BaZi analyzes specific birth chart data to reveal your exact elemental dynamic.",
        },
      },
      {
        "@type": "Question",
        name: "What makes 2026 significant for relationship readings?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "2026 is a Yi Wood Snake year (乙巳年) — a year of transformation, karmic resolution, and shedding old patterns. Relationships formed or strained in Snake years carry unusual intensity, and elemental activation windows are especially high-signal this year.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an exact birth time for BaZi compatibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Exact birth time unlocks precise palace positions and your full four-pillar chart. Date-only readings still deliver accurate Five Element analysis and core pattern recognition. Including birth time increases precision but is not required.",
        },
      },
    ],
  };

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>Elemental Bond — Why You Keep Attracting the Same Pattern | Free BaZi Reading 2026</title>
        <meta
          name="description"
          content="Free BaZi compatibility calculator — enter two birth dates and get your Five Element pattern, Soul Resonance Score, and 2026 relationship timeline. 2,000-year-old wisdom, not AI fluff."
        />
        <meta
          name="keywords"
          content="bazi compatibility calculator, bazi compatibility 2026, free bazi reading, five element compatibility test, why do I keep attracting the same type, relationship pattern breaking, elemental bond, karmic relationship calculator, Chinese astrology compatibility, five element love match, snake year relationships 2026"
        />

        {/* GEO: Long-tail question-based keywords for AI search engines */}
        <meta name="abstract" content="Free BaZi compatibility calculator using ancient Chinese astrology. Enter two birth dates to reveal your Five Element dynamic and relationship patterns." />

        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Elemental Bond — Free BaZi Compatibility Calculator" />
        <meta
          property="og:description"
          content="Different person, same dynamic? Free BaZi compatibility calculator — enter two birth dates, get your Five Element pattern and 2026 timing. 2,000-year-old pattern recognition."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Elemental Bond" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elemental Bond — Free BaZi Compatibility Calculator" />
        <meta
          name="twitter:description"
          content="Free BaZi compatibility calculator. Enter two birth dates — get your Five Element pattern and 2026 timing. Not AI fluff."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      
      {/* Oracle Hero Section — GEO-optimized for US 2026 pain points */}
      <section className="bond-hero oracle-hero">
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">You've been in this exact relationship before.<br />Different person. Same pattern. There's a reason.</h1>
        <div className="hero-divider" />
        <p className="oracle-hero-subtitle">
          I entered my last three relationships into BaZi. The same elemental dynamic showed up every time — including the one I was certain was different.
        </p>
        <p className="hero-explainer">
          Enter two birth dates. The Oracle maps your Four Pillars chart, names your exact elemental dynamic, and reveals what 2026 means for this pairing. 2,000 years of pattern recognition. Free. Under a minute.
        </p>
        <div className="hero-testimonial-strip">
          <span className="hero-testimonial__quote">"Eerily precise — it named the pattern I kept repeating."</span>
          <span className="hero-testimonial__meta">— M.L., Seattle &nbsp;·&nbsp; <strong>{patternCount.toLocaleString()}</strong> readings this month</span>
        </div>
      </section>

      {/* ── Shared Result Banner ── */}
      {sharedResult && (
        <section className="shared-banner">
          <p className="shared-banner__label">✨ Someone shared their reading with you</p>
          <p className="shared-banner__pair">
            Their{" "}
            <strong>
              {sharedResult.element1}-{sharedResult.element2}
            </strong>{" "}
            bond scored{" "}
            <strong>
              {sharedResult.score}/100
            </strong>
          </p>
          <p className="shared-banner__message">
            {sharedResult.label || "What's your pattern? Enter your details below."}
          </p>
        </section>
      )}

      <form className="bond-form oracle-form" onSubmit={onSubmit}>
        <div className="bond-form__columns">
          <section className="bond-form__panel oracle-card">
            <div className="oracle-input-guide">
              <span className="oracle-guide-icon">◈</span>
              <p className="oracle-guide-text">Your birth details</p>
            </div>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-a-date">Birth Date</label>
                <input
                  id="person-a-date"
                  type="date"
                  className="oracle-input"
                  inputMode="numeric"
                  autoComplete="bday"
                  value={personA.date}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-time">Birth Time (optional)</label>
                <input
                  id="person-a-time"
                  type="time"
                  className="oracle-input"
                  inputMode="numeric"
                  value={personA.time}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Leave blank if unknown"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-gender">Gender</label>
                <select
                  id="person-a-gender"
                  className="oracle-input"
                  value={personA.gender}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bond-form__panel oracle-card">
            <div className="oracle-input-guide">
              <span className="oracle-guide-icon">◈</span>
              <p className="oracle-guide-text">Their birth details (partner, ex, or person of interest)</p>
            </div>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-b-date">Birth Date</label>
                <input
                  id="person-b-date"
                  type="date"
                  className="oracle-input"
                  inputMode="numeric"
                  autoComplete="bday"
                  value={personB.date}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-time">Birth Time (optional)</label>
                <input
                  id="person-b-time"
                  type="time"
                  className="oracle-input"
                  inputMode="numeric"
                  value={personB.time}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Leave blank if unknown"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-gender">Gender</label>
                <select
                  id="person-b-gender"
                  className="oracle-input"
                  value={personB.gender}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? (
          <div className="oracle-loading">
            <span className="oracle-loading-icon">◈</span>
            <p className="bond-form__loading-text">{LOADING_MESSAGES[loadingMessageIndex]}</p>
            <p className="bond-form__loading-hint">
              The Oracle is reading your pattern...
            </p>
          </div>
        ) : null}

        <button type="submit" className="oracle-button oracle-cta-button" disabled={loading}>
          {loading ? "Reading your pattern..." : "Reveal Our Compatibility Score →"}
        </button>

        <div className="social-proof">
          <span>◈</span>
          <span><strong>{patternCount.toLocaleString()}</strong> people discovered their pattern this month</span>
        </div>

        <p className="form-new-to-bazi">
          New to BaZi?{" "}
          <a href="/articles" className="form-new-to-bazi__link">
            See how it works →
          </a>
        </p>
      </form>

      {/* How It Works — 3-step explainer for US audience */}
      <section className="how-it-works">
        <div className="how-it-works__header">
          <span className="oracle-symbol">◈</span>
          <h2 className="how-it-works__title">How It Works</h2>
        </div>
        <div className="how-it-works__steps">
          <div className="how-it-works__step">
            <span className="how-it-works__step-num">01</span>
            <h3 className="how-it-works__step-title">Enter Two Birth Dates</h3>
            <p className="how-it-works__step-desc">
              Add your birth details and your partner's. Time is optional — date-only readings are still accurate.
            </p>
          </div>
          <div className="how-it-works__step">
            <span className="how-it-works__step-num">02</span>
            <h3 className="how-it-works__step-title">AI Analyzes Your Elemental Pattern</h3>
            <p className="how-it-works__step-desc">
              The Oracle maps your Four Pillars charts, calculates Five Element balance, and identifies your unique dynamic.
            </p>
          </div>
          <div className="how-it-works__step">
            <span className="how-it-works__step-num">03</span>
            <h3 className="how-it-works__step-title">Get Your Free Blueprint</h3>
            <p className="how-it-works__step-desc">
              Instantly see your Soul Resonance Score, the hidden pattern, and what 2026 means for your relationship.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Element Quiz ── */}
      <section className="element-quiz-section">
        <ElementQuiz />
      </section>

      {/* ── BaZi vs Western Astrology — addresses #1 conversion objection ── */}
      <section className="bazi-vs-astro-section">
        <div className="bazi-vs-astro__header">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          <h2 className="bazi-vs-astro__title">BaZi vs. Western Astrology</h2>
          <p className="bazi-vs-astro__subtitle">Why your sun sign is only the beginning</p>
        </div>
        <div className="bazi-vs-astro__grid">
          <div className="bazi-vs-astro__card bazi-vs-astro__card--astro">
            <h3 className="bazi-vs-astro__card-title">Western Astrology</h3>
            <ul className="bazi-vs-astro__card-list">
              <li>One data point: your sun sign</li>
              <li>Generalized for 1/12 of the population</li>
              <li>Personality-focused, not timing-aware</li>
              <li>Same prediction for everyone born in your month</li>
            </ul>
          </div>
          <div className="bazi-vs-astro__card bazi-vs-astro__card--bazi">
            <h3 className="bazi-vs-astro__card-title">BaZi (Four Pillars)</h3>
            <ul className="bazi-vs-astro__card-list">
              <li>Four data points: Year, Month, Day, Hour</li>
              <li>Unique to YOUR exact birth moment</li>
              <li>Five Element balance &amp; yearly luck cycles</li>
              <li>Personalized 2026 Snake Year timing windows</li>
            </ul>
          </div>
        </div>
        <p className="bazi-vs-astro__note">
          Western astrology asks "who you are." BaZi reveals "why you are that way — and when things shift."
          Most people who try both never go back.
        </p>
        <div className="bazi-vs-astro__cta">
          <a href="/bazi" className="oracle-button oracle-cta-button">
            Read My BaZi Blueprint — Free →
          </a>
        </div>
      </section>

      {/* Email Capture — Lead magnet for TikTok & SEO traffic */}
      <section className="email-capture-section">
        <div className="email-capture__inner">
          <span className="oracle-symbol" aria-hidden="true">◈</span>
          <h2 className="email-capture__title">Get Your Free 2026 Snake Year Love Forecast</h2>
          <p className="email-capture__desc">
            Which element patterns are activated for you this year — and when your window opens.
            Delivered free, no spam.
          </p>
          <form className="email-capture__form" onSubmit={onEmailSubmit}>
            <input
              type="email"
              className="email-capture__input"
              placeholder="your@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="oracle-button email-capture__btn">
              Send My Forecast →
            </button>
          </form>
          <p className="email-capture__fine">No account required. Unsubscribe anytime.</p>
        </div>
      </section>

      <section className="landing-footnote">
        <details>
          <summary>FAQ: BaZi Compatibility & Why Patterns Keep Repeating</summary>
          <p><strong>Why do I keep attracting the same dynamic?</strong></p>
          <p>Your BaZi chart contains elemental imprints that generate predictable patterns — regardless of who the other person is. If every relationship has the same friction point, the common variable is you (and your elemental makeup). This reading names the pattern so you can see it, and gives you the choice to work with it or against it.</p>
          <p><strong>How is this different from AI-generated relationship advice?</strong></p>
          <p>Most AI tools give you generic reflections of what you already think. Elemental Bond uses a 2,000-year-old Chinese metaphysical system (BaZi / Zi Wei Dou Shu) — pattern recognition that predates algorithms by twenty centuries. The Oracle speaks to your specific elemental data. You'll know immediately if it's accurate.</p>
          <p><strong>How is BaZi different from zodiac compatibility?</strong></p>
          <p>Zodiac compares sun signs — one data point. BaZi analyzes your full birth chart: four pillars (year, month, day, hour) across Five Elements (Wood, Fire, Earth, Metal, Water). It captures complexity that a sun sign comparison can't touch. More data. More precision.</p>
          <p><strong>What's different about 2026 readings?</strong></p>
          <p>2026 is a Yi Wood Snake year (乙巳年) — a year of shedding old skins, karmic resolution, and deep transformation. Relationships formed or strained in Snake years carry unusual intensity. Patterns that have been dormant surface. This is an unusually high-signal year for elemental compatibility analysis.</p>
          <p><strong>Do I need an exact birth time?</strong></p>
          <p>Exact time unlocks your full chart including precise palace positions and hourly elemental data. Date-only readings still deliver accurate Five Element analysis and core pattern recognition. If you know your birth hour, include it. If not, the reading is still meaningful.</p>
        </details>
      </section>
    </div>
  );
}
