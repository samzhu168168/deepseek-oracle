/**
 * Home Page - The Oracle
 * Entry point for relationship compatibility analysis
 */
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";

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

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elemental Bond",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "BaZi compatibility reading using 2,000-year-old Chinese metaphysics to reveal the elemental pattern behind your relationships — why you keep attracting the same dynamic, and your 2026 activation windows.",
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
          content="Different person, same dynamic? Your elemental pattern explains it. 2,000-year-old BaZi wisdom — not AI fluff — reveals the hidden pattern in your relationships. Free reading. 2026 Snake Year timing included."
        />
        <meta
          name="keywords"
          content="bazi compatibility 2026, why do I keep attracting the same type, relationship pattern breaking, elemental bond, karmic relationship calculator, Chinese astrology compatibility, five element love match, snake year relationships 2026, free relationship reading, repeating relationship patterns"
        />

        {/* GEO: Long-tail question-based keywords for AI search engines */}
        <meta name="abstract" content="Ancient Chinese BaZi astrology reveals hidden relationship patterns through Five Element analysis. Free compatibility test using birth dates." />

        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Elemental Bond — Why You Keep Attracting the Same Pattern" />
        <meta
          property="og:description"
          content="Different person, same dynamic? Your elemental pattern explains it. Free BaZi compatibility reading — 2,000 years of pattern recognition, not AI-generated fluff."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elemental Bond — Why You Keep Attracting the Same Pattern" />
        <meta
          name="twitter:description"
          content="Your elemental pattern explains the repeating dynamic. Free BaZi reading — not AI fluff. 2026 Snake Year timing included."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      
      {/* Oracle Hero Section — GEO-optimized for US 2026 pain points */}
      <section className="bond-hero oracle-hero">
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">YOU'VE BEEN IN THIS<br />PATTERN BEFORE</h1>
        <div className="hero-divider" />
        <p className="oracle-hero-subtitle">
          Different person. Same dynamic. There's a reason for that.<br />
          <strong>Elemental Bond shows you the pattern — so you can break it.</strong>
        </p>
        <p className="oracle-hero-tagline">
          2,000 years of BaZi wisdom. No AI-generated fluff. No algorithm pretending to know you.
        </p>
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
              <p className="oracle-guide-text">First person's birth details</p>
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
              <p className="oracle-guide-text">Second person's birth details</p>
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
          {loading ? "Reading your pattern..." : "✨ Reveal Our Blueprint"}
        </button>

        <div className="social-proof">
          <span>◈</span>
          <span><strong>3,241</strong> people discovered their pattern this month</span>
        </div>
      </form>

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
