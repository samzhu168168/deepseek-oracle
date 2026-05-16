/** BaZi personal reading page — individual birth chart analysis */

import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { ShareButtons } from "../components/ShareButtons";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const LOADING_MESSAGES = [
  "Calculating your Four Pillars...",
  "Analyzing your Day Master...",
  "Mapping your Five Element balance...",
  "Reading your luck phases...",
  "Preparing your personal BaZi blueprint...",
];

interface BaZiReading {
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  dayMaster: string;
  fiveElementBalance: string;
  personality: string;
  careerAndWealth: string;
  relationships: string;
  luckPhases: {
    currentPhase: string;
    currentYear: string;
    nextYear: string;
  };
  elementRemedy: string;
  summary: string;
}

export default function BaZiPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<BaZiReading | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || "";

  // Dynamic share/OG values from reading results
  const ogImageUrl = reading
    ? `${SITE_URL}/api/og-image/bazi?dm=${encodeURIComponent(reading.dayMaster.split("\n")[0].slice(0, 30))}&name=${encodeURIComponent(name || "My BaZi")}&score=72`
    : `${SITE_URL}/og-image.png`;
  const shareUrl = `${SITE_URL}/bazi`;
  const shareTitle = reading
    ? `My BaZi Blueprint: ${reading.dayMaster.split("\n")[0].slice(0, 40)} — Discover YOUR pattern at elemental.bond`
    : "Discover your BaZi birth chart at Elemental Bond";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Birth date is required.");
      return;
    }
    setError(null);
    setLoading(true);
    setReading(null);

    // Rotate loading messages
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);

    try {
      const resp = await fetch(`${apiBase}/api/divination/bazi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, gender, name }),
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || "Reading failed");
      setReading(data.reading);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const pillarStyle = {
    display: "inline-block",
    padding: "12px 20px",
    margin: "4px",
    borderRadius: "8px",
    background: "rgba(196, 149, 106, 0.1)",
    border: "1px solid rgba(196, 149, 106, 0.25)",
    fontWeight: 600,
    fontSize: "15px",
  };

  return (
    <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Dynamic OG image for BaZi results */}
      <Helmet>
        <title>{reading ? `My BaZi Blueprint — ${reading.dayMaster.split("\n")[0].slice(0, 40)} | Elemental Bond` : "Free BaZi Reading — Personal Chinese Astrology Birth Chart | Elemental Bond"}</title>
        <meta name="description" content={reading ? `My BaZi reading reveals ${reading.dayMaster.split("\n")[0].slice(0, 60)}. Discover YOUR personal Four Pillars chart. Free analysis.` : "Discover your personal BaZi birth chart. Free Four Pillars analysis reveals your Day Master, Five Element balance, personality, career potential, and 2026 luck phases."} />
        <meta property="og:title" content={reading ? `My BaZi Blueprint — ${reading.dayMaster.split("\n")[0].slice(0, 40)} | Elemental Bond` : "Free BaZi Reading — Personal Chinese Astrology Birth Chart | Elemental Bond"} />
        <meta property="og:description" content={reading ? `My BaZi reading reveals ${reading.dayMaster.split("\n")[0].slice(0, 60)}. Discover YOUR personal Four Pillars chart.` : "Discover your personal BaZi birth chart. Free Four Pillars analysis reveals your Day Master, Five Element balance, personality, career potential, and 2026 luck phases."} />
        <meta property="og:url" content={`${SITE_URL}/bazi`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Free BaZi Reading — Personal Chinese Astrology Birth Chart" />
        <meta property="og:site_name" content="Elemental Bond" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={reading ? `My BaZi Blueprint — ${reading.dayMaster.split("\n")[0].slice(0, 40)} | Elemental Bond` : "Free BaZi Reading — Personal Chinese Astrology Birth Chart | Elemental Bond"} />
        <meta name="twitter:description" content={reading ? `My BaZi reading reveals ${reading.dayMaster.split("\n")[0].slice(0, 60)}. Discover YOUR personal Four Pillars chart.` : "Discover your personal BaZi birth chart. Free Four Pillars analysis reveals your Day Master, Five Element balance, personality, career potential, and 2026 luck phases."} />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${SITE_URL}/bazi`} />
      </Helmet>

      <section className="oracle-hero" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="oracle-symbol-hero">&#9674;</div>
        <h1 className="oracle-hero-title">YOUR BAZI BLUEPRINT</h1>
        <p className="oracle-hero-subtitle">
          Your birth chart holds the pattern. <strong>Free personal BaZi reading.</strong>
        </p>
      </section>

      {!reading && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
          <div className="bond-form__fields" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="field">
              <label className="field__label">Your Name (optional)</label>
              <input
                type="text"
                className="oracle-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="field">
              <label className="field__label">Birth Date *</label>
              <input
                type="date"
                className="oracle-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="field__label">Birth Time (optional)</label>
              <input
                type="time"
                className="oracle-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Gender</label>
              <select
                className="oracle-input"
                value={gender}
                onChange={(e) => setGender(e.target.value as "Male" | "Female")}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <div className="oracle-loading" style={{ textAlign: "center", padding: "24px" }}>
              <span className="oracle-loading-icon">&#9674;</span>
              <p style={{ fontSize: "15px", color: "var(--oracle-muted)", marginTop: "12px" }}>
                {LOADING_MESSAGES[msgIndex]}
              </p>
            </div>
          ) : (
            <button type="submit" className="oracle-button oracle-cta-button" style={{ marginTop: "16px" }}>
              &#10024; Reveal My BaZi
            </button>
          )}
        </form>
      )}

      {reading && (
        <div className="result-page" style={{ padding: 0 }}>
          {/* Four Pillars Display */}
          <section className="result-scorecard" style={{ marginBottom: "24px" }}>
            <p className="result-scorecard__label" style={{ fontSize: "14px", letterSpacing: "0.1em" }}>
              YOUR FOUR PILLARS
            </p>
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <span style={pillarStyle}>Year: {reading.fourPillars.year || "—"}</span>
              <span style={pillarStyle}>Month: {reading.fourPillars.month || "—"}</span>
              <span style={pillarStyle}>Day: {reading.fourPillars.day || "—"}</span>
              <span style={pillarStyle}>Hour: {reading.fourPillars.hour || "—"}</span>
            </div>
          </section>

          {/* Summary */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">YOUR DESTINY PATTERN</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.summary} />
              </div>
            </div>
          </section>

          {/* Day Master */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">YOUR DAY MASTER</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.dayMaster} />
              </div>
            </div>
          </section>

          {/* Five Elements */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">FIVE ELEMENT BALANCE</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.fiveElementBalance} />
              </div>
            </div>
          </section>

          {/* Personality */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">PERSONALITY & NATURE</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.personality} />
              </div>
            </div>
          </section>

          {/* Career */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">CAREER & WEALTH</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.careerAndWealth} />
              </div>
            </div>
          </section>

          {/* Relationships */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">RELATIONSHIPS</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.relationships} />
              </div>
            </div>
          </section>

          {/* Luck Phases */}
          <section className="free-reading" style={{ marginBottom: "16px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">LUCK PHASES & TIMING</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <h4>Current Decade Phase</h4>
                <MarkdownRenderer content={reading.luckPhases.currentPhase} />
                <h4>Current Year ({new Date().getFullYear()})</h4>
                <MarkdownRenderer content={reading.luckPhases.currentYear} />
                <h4>Coming Year</h4>
                <MarkdownRenderer content={reading.luckPhases.nextYear} />
              </div>
            </div>
          </section>

          {/* Element Remedy */}
          <section className="free-reading" style={{ marginBottom: "24px" }}>
            <div className="free-reading-header">
              <div className="oracle-symbol">&#9674;</div>
              <h2 className="free-reading-title">ELEMENT REMEDY</h2>
            </div>
            <div className="free-reading-content">
              <div className="oracle-reading">
                <MarkdownRenderer content={reading.elementRemedy} />
              </div>
            </div>
          </section>

          {/* Share buttons */}
          <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid rgba(196, 149, 106, 0.15)", marginTop: "8px" }}>
            <p style={{ color: "var(--oracle-muted)", fontSize: "13px", marginBottom: "12px" }}>
              Share your BaZi blueprint
            </p>
            <ShareButtons
              url={shareUrl}
              title={shareTitle}
            />
          </div>

          {/* CTA back to compatibility */}
          <div style={{ textAlign: "center", padding: "24px 0", borderTop: "1px solid rgba(196, 149, 106, 0.2)" }}>
            <p style={{ color: "var(--oracle-muted)", fontSize: "14px", marginBottom: "12px" }}>
              Want to see how YOUR chart matches with someone else's?
            </p>
            <a href="/" className="oracle-button oracle-cta-button" style={{ textDecoration: "none", display: "inline-block" }}>
              &#10024; Check Compatibility
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
