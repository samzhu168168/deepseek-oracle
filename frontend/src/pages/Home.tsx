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

export default function HomePage() {
  const navigate = useNavigate();
  const [personA, setPersonA] = useState<PersonInput>(() => createInitialPerson("Male"));
  const [personB, setPersonB] = useState<PersonInput>(() => createInitialPerson("Female"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

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
        <title>The Oracle — Decode Your Relationship Blueprint</title>
        <meta
          name="description"
          content="Ancient BaZi wisdom meets modern clarity. Discover the hidden patterns in your relationship through elemental compatibility analysis."
        />
        <meta
          name="keywords"
          content="relationship compatibility, bazi compatibility, elemental bond, karmic connection, soul blueprint"
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="The Oracle — Decode Your Relationship Blueprint" />
        <meta
          property="og:description"
          content="Ancient BaZi wisdom meets modern clarity. Discover the hidden patterns in your relationship."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Oracle — Decode Your Relationship Blueprint" />
        <meta
          name="twitter:description"
          content="Ancient BaZi wisdom meets modern clarity. Discover the hidden patterns in your relationship."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      
      {/* Oracle Hero Section */}
      <section className="bond-hero oracle-hero">
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">THE ORACLE</h1>
        <p className="oracle-hero-subtitle">
          Ancient wisdom. Modern clarity.
        </p>
        <p className="oracle-hero-tagline">
          I've read patterns for 60 years. I've never been wrong.
        </p>
      </section>

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
          <summary>FAQ: BaZi Compatibility</summary>
          <p>How does BaZi compatibility work?</p>
          <p>BaZi compatibility compares the five-element balance and timing of two birth charts to reveal harmony, tension, and growth potential.</p>
          <p>What is a karmic bond?</p>
          <p>A karmic bond describes a connection shaped by past-life lessons, often felt as intense attraction, challenge, and mutual evolution.</p>
          <p>Do I need an exact birth time?</p>
          <p>Exact time improves precision, but the calculator still delivers meaningful insights using birth date and core elemental patterns.</p>
        </details>
      </section>
    </div>
  );
}
