/**
 * Home Page - The Oracle
 * Entry point for relationship compatibility analysis
 */
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";
import "../styles/naonai-home.css";

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
  "Scanning elemental frequencies...",
  "Calculating karmic resonance...",
  "Mapping your 2026 activation windows...",
  "Decoding the hidden bond pattern...",
  "Preparing your Soul Blueprint...",
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
    fetch(`${import.meta.env.VITE_API_URL}/api/health`, { method: "GET" }).catch(() => {});
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
      "An advanced astrological compatibility calculator merging ancient BaZi, five elements, and modern relationship dynamics to decode karmic bonds.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does BaZi compatibility work?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "BaZi compatibility compares the five-element balance and timing of two birth charts to reveal harmony, tension, and growth potential.",
        },
      },
      {
        "@type": "Question",
        name: "What is a karmic bond?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "A karmic bond describes a connection shaped by past-life lessons, often felt as intense attraction, challenge, and mutual evolution.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an exact birth time?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Exact time improves precision, but the calculator still delivers meaningful insights using birth date and core elemental patterns.",
        },
      },
    ],
  };

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>Elemental Bond — Decode Your Relationship's Hidden Pattern | Free BaZi Compatibility</title>
        <meta
          name="description"
          content="Tired of swiping? 2,000-year-old BaZi wisdom reveals what dating apps can't. Enter two birth dates — discover your elemental pattern, karmic bond, and 2026 timing. Free reading."
        />
        <meta
          name="keywords"
          content="bazi compatibility, elemental bond, soul resonance test, karmic relationship calculator, twin flame compatibility, relationship pattern test, Chinese astrology compatibility, five element love match, deep connection finder, free relationship reading"
        />

        {/* GEO: Long-tail question-based keywords for AI search engines */}
        <meta name="abstract" content="Ancient Chinese BaZi astrology reveals hidden relationship patterns through Five Element analysis. Free compatibility test using birth dates." />

        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Elemental Bond — Decode Your Relationship's Hidden Pattern | Free" />
        <meta
          property="og:description"
          content="Tired of swiping? 2,000-year-old BaZi wisdom reveals what dating apps can't. Enter two birth dates — discover your elemental pattern for free."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Elemental Bond — Decode Your Relationship's Hidden Pattern" />
        <meta
          name="twitter:description"
          content="2,000-year-old wisdom reveals what dating apps can't. Free elemental compatibility reading."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      
      {/* Oracle Hero Section — GEO-optimized for US 2026 pain points */}
      <section className="bond-hero oracle-hero">
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">YOUR RELATIONSHIP HAS<br />A HIDDEN PATTERN</h1>
        <p className="oracle-hero-subtitle">
          Tired of swiping? Dating apps show you profiles.<br />
          <strong>Elemental Bond shows you the truth.</strong>
        </p>
        <p className="oracle-hero-tagline">
          2,000 years of BaZi wisdom. One reading. No algorithms pretending to know you.
        </p>
      </section>

      {/* ── Shared Result Banner ── */}
      {sharedResult && (
        <section
          className="shared-banner"
          style={{
            maxWidth: "640px",
            margin: "0 auto 1.5rem",
            padding: "1.25rem 1.5rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(143, 96, 214, 0.15), rgba(92, 56, 132, 0.08))",
            border: "1px solid rgba(210, 187, 255, 0.2)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "0.5rem" }}>
            ✨ Someone shared their reading with you
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.3rem" }}>
            Their{" "}
            <strong style={{ color: "var(--oracle-accent, #bb8fff)" }}>
              {sharedResult.element1}-{sharedResult.element2}
            </strong>{" "}
            bond scored{" "}
            <strong style={{ color: "var(--oracle-accent, #bb8fff)" }}>
              {sharedResult.score}/100
            </strong>
          </p>
          <p style={{ fontSize: "0.95rem", opacity: 0.8 }}>
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
            <p style={{ fontSize: '0.9rem', color: 'var(--oracle-muted)', marginTop: '0.5rem' }}>
              The Oracle is reading your pattern...
            </p>
          </div>
        ) : null}

        <button type="submit" className="oracle-button oracle-cta-button" disabled={loading}>
          {loading ? "Reading your pattern..." : "✨ Reveal Our Blueprint"}
        </button>
      </form>

      <section className="landing-footnote">
        <details>
          <summary>FAQ: BaZi Compatibility & Soul Resonance Testing</summary>
          <p><strong>How is BaZi different from zodiac compatibility?</strong></p>
          <p>Zodiac compares sun signs. BaZi analyzes your full birth chart — year, month, day, and hour pillars — against the Five Elements (Wood, Fire, Earth, Metal, Water). This reveals relationship dynamics that zodiac apps completely miss.</p>
          <p><strong>What is a karmic bond?</strong></p>
          <p>A karmic bond describes a connection shaped by past-life patterns — often felt as intense attraction, recurring conflict, and mutual growth. It's that feeling of "I've known you before" that dating apps can't explain.</p>
          <p><strong>Tired of dating apps? Why do patterns repeat?</strong></p>
          <p>Your BaZi chart contains elemental imprints that attract specific dynamics. If you keep dating the same type of person, it's not random — it's your elemental pattern in action. This reading shows you the pattern so you can choose differently.</p>
          <p><strong>Do I need an exact birth time?</strong></p>
          <p>Exact time unlocks your full Soul Blueprint — including your 2026 activation windows and precise karmic timing. Date-only readings still deliver meaningful elemental insights. If you know your birth hour, include it for maximum accuracy.</p>
          <p><strong>Is this AI or real astrology?</strong></p>
          <p>Neither. This is a 2,000-year-old Chinese metaphysical system (BaZi / Zi Wei Dou Shu) interpreted through modern language. No AI-generated generic advice. No algorithm optimizing for engagement. Just pattern recognition that's worked for millennia.</p>
        </details>
      </section>
    </div>
  );
}
