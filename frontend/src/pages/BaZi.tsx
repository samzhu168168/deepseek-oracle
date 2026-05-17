/** BaZi personal reading page — individual birth chart analysis */

import { FormEvent, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { ShareButtons } from "../components/ShareButtons";
import { EmailGateModal } from "../components/EmailGateModal";
import { LicenseKeyModal } from "../components/LicenseKeyModal";

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

  // Monetization state
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [postPaymentFlow, setPostPaymentFlow] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

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

  // Auto-open email gate 3 seconds after reading loads
  useEffect(() => {
    if (reading && !emailUnlocked && !emailModalOpen) {
      const timer = setTimeout(() => setEmailModalOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [reading, emailUnlocked, emailModalOpen]);

  // Show paywall 8 seconds after reading loads
  useEffect(() => {
    if (reading && !showPaywall) {
      const timer = setTimeout(() => setShowPaywall(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [reading, showPaywall]);

  // Detect Gumroad purchase redirect (?unlocked=true&ref=gumroad)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlocked") === "true" && params.get("ref") === "gumroad") {
      setPostPaymentFlow(true);
      setLicenseModalOpen(true);
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="landing-page fade-in">
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

      <section className="oracle-hero">
        <div className="oracle-symbol-hero">&#9674;</div>
        <h1 className="oracle-hero-title">YOUR BAZI BLUEPRINT</h1>
        <p className="oracle-hero-subtitle">
          Your birth chart holds the pattern. <strong>Free personal BaZi reading.</strong>
        </p>
      </section>

      {!reading && (
        <form onSubmit={handleSubmit} className="bazi-form">
          <div className="bond-form__fields">
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
            <div className="oracle-loading">
              <span className="oracle-loading-icon">&#9674;</span>
              <p className="bazi-loading-text">
                {LOADING_MESSAGES[msgIndex]}
              </p>
            </div>
          ) : (
            <button type="submit" className="oracle-button oracle-cta-button mt-md">
              &#10024; Reveal My BaZi
            </button>
          )}
        </form>
      )}

      {reading && (
        <div className="result-page">
          {/* Four Pillars Display */}
          <section className="result-scorecard">
            <p className="result-scorecard__label">
              YOUR FOUR PILLARS
            </p>
            <div className="bazi-pillars">
              <span className="pillar-tag">Year: {reading.fourPillars.year || "—"}</span>
              <span className="pillar-tag">Month: {reading.fourPillars.month || "—"}</span>
              <span className="pillar-tag">Day: {reading.fourPillars.day || "—"}</span>
              <span className="pillar-tag">Hour: {reading.fourPillars.hour || "—"}</span>
            </div>
          </section>

          {/* Summary */}
          <section className="free-reading">
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

          {/* ── Email Gate: Day Master + Five Elements + Personality ── */}
          {emailUnlocked && (<>
          <section className="free-reading">
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
          <section className="free-reading">
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
          <section className="free-reading">
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
          </>)} {/* end emailUnlocked */}

          {/* ── Paywall: prompt to purchase full reading ── */}
          {showPaywall && !paidUnlocked && !postPaymentFlow && (
          <section className="free-reading bazi-paywall">
            <div className="free-reading-header bazi-paywall-header">
              <span className="bazi-lock-icon">🔒</span>
              <h2 className="free-reading-title">CAREER & WEALTH</h2>
            </div>
            <div className="bazi-paywall-body">
              <div className="bazi-lock-big">🔒</div>
              <h3 className="bazi-paywall-title">
                Unlock Your Complete Blueprint
              </h3>
              <p className="bazi-paywall-desc">
                Get the full picture: career potential, relationship dynamics, luck phases, and
                personalized element remedies — all based on your unique birth chart.
              </p>
              <a
                href="https://samzhu168.gumroad.com/l/swpdpb"
                target="_blank"
                rel="noopener noreferrer"
                className="oracle-button oracle-cta-button bazi-paywall-btn"
              >
                &#10024; Get Full Reading — $24.00
              </a>
              <p className="bazi-paywall-footnote">
                One-time purchase. Lifetime access. Instant delivery.
              </p>
            </div>
          </section>
          )}

          {paidUnlocked && (<>
          {/* Career */}
          <section className="free-reading">
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
          <section className="free-reading">
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
          <section className="free-reading">
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
          <section className="free-reading mb-lg">
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
          </>)}

          {/* Share buttons */}
          <div className="bazi-share">
            <p className="bazi-share-label">
              Share your BaZi blueprint
            </p>
            <ShareButtons
              url={shareUrl}
              title={shareTitle}
            />
          </div>

          {/* CTA back to compatibility */}
          <div className="bazi-cta">
            <p className="bazi-cta-text">
              Want to see how YOUR chart matches with someone else's?
            </p>
            <a href="/" className="oracle-button oracle-cta-button bazi-cta-link">
              &#10024; Check Compatibility
            </a>
          </div>
        </div>
      )}

      {/* Email Gate Modal */}
      <EmailGateModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={(_email) => {
          setEmailUnlocked(true);
          setEmailModalOpen(false);
        }}
      />

      {/* License Key Modal (for paid unlock) */}
      <LicenseKeyModal
        isOpen={licenseModalOpen}
        onClose={() => {
          setLicenseModalOpen(false);
          setPostPaymentFlow(false);
        }}
        onSuccess={() => {
          setPaidUnlocked(true);
          setLicenseModalOpen(false);
          setPostPaymentFlow(false);
        }}
        skipReportGeneration={true}
        productId="swpdpb"
      />
    </div>
  );
}
