import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toPng } from "html-to-image";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";
import { InkButton } from "../components/InkButton";
import type { BondAnalysisRequest, BondAnalysisResponse } from "../types";

type StoredReport = {
  payload: BondAnalysisRequest;
  report: any;
};

const EMAIL_CAPTURE_STORAGE_KEY = "bond:email_forecast_submissions";
const EMAIL_CAPTURE_COUNT_KEY = "bond:email_forecast_count";
const DEFAULT_FORECAST_COUNT = 247;

const RADAR_DIMENSIONS = [
  "Elemental Harmony",
  "Soul Resonance",
  "Growth Catalyst",
  "Karmic Bond",
];

const readStoredReport = (): StoredReport | null => {
  try {
    const raw = window.sessionStorage.getItem("bond:last_report");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredReport;
    if (!parsed?.payload || !parsed?.report) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildRadarEntries = (scores: Record<string, number> | undefined) => {
  const scoreEntries = Object.entries(scores || {}).map(([label, value]) => ({
    label,
    value: clampScore(Number(value)),
  }));
  const fallbackAverage =
    scoreEntries.length > 0
      ? Math.round(scoreEntries.reduce((sum, item) => sum + item.value, 0) / scoreEntries.length)
      : 72;
  return RADAR_DIMENSIONS.map((label) => {
    const normalizedLabel = normalizeKey(label);
    const match = scoreEntries.find((item) => normalizeKey(item.label).includes(normalizedLabel));
    return {
      label,
      value: match?.value ?? fallbackAverage,
    };
  });
};

const buildPolygonPoints = (values: number[], radius: number, center: number) => {
  const count = values.length;
  return values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const ratio = value / 100;
      const x = center + Math.cos(angle) * radius * ratio;
      const y = center + Math.sin(angle) * radius * ratio;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

const getRelationshipLabel = (score: number) => {
  if (score >= 85) {
    return "⚡ Electric Tension Pair";
  }
  if (score >= 70) {
    return "✨ Balanced Harmony Pair";
  }
  if (score >= 55) {
    return "🌙 Growth-Oriented Pair";
  }
  return "🌑 Karmic Challenge Pair";
};

const getTeaserPreview = (summary: string) => {
  const trimmed = summary.trim();
  if (!trimmed) {
    return "Your elemental and soul resonance summary is being prepared...";
  }
  if (trimmed.endsWith("...")) {
    return trimmed;
  }
  return `${trimmed.replace(/\.*$/, "")}...`;
};

const readForecastCount = () => {
  if (typeof window === "undefined") {
    return DEFAULT_FORECAST_COUNT;
  }
  const stored = window.localStorage.getItem(EMAIL_CAPTURE_COUNT_KEY);
  const parsed = stored ? Number(stored) : DEFAULT_FORECAST_COUNT;
  return Number.isFinite(parsed) ? parsed : DEFAULT_FORECAST_COUNT;
};

const EmailCapture = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [forecastCount, setForecastCount] = useState(DEFAULT_FORECAST_COUNT);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForecastCount(readForecastCount());
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = email.trim();
    if (!normalized) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    const payload = {
      email: normalized,
      submitted_at: new Date().toISOString(),
    };
    try {
      const raw = window.localStorage.getItem(EMAIL_CAPTURE_STORAGE_KEY);
      const items = raw ? (JSON.parse(raw) as Array<{ email: string }>) : [];
      items.push(payload);
      window.localStorage.setItem(EMAIL_CAPTURE_STORAGE_KEY, JSON.stringify(items));
      const nextCount = (readForecastCount() || DEFAULT_FORECAST_COUNT) + 1;
      window.localStorage.setItem(EMAIL_CAPTURE_COUNT_KEY, String(nextCount));
      setForecastCount(nextCount);
      setSubmitted(true);
      setEmail("");
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="email-capture">
      <p className="email-capture__count">{forecastCount} souls already received their forecast</p>
      {submitted ? (
        <p className="email-capture__success">
          Your forecast is being prepared. Check your inbox in 24 hours.
        </p>
      ) : (
        <form className="email-capture__form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            required
          />
          <InkButton type="submit">Send My Forecast →</InkButton>
          {error ? <p className="error-text">{error}</p> : null}
          <p className="email-capture__note">
            No spam. One email. Your cosmic timing, decoded.
          </p>
        </form>
      )}
    </div>
  );
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = (location.state as StoredReport | null) || readStoredReport();
  const [payload, setPayload] = useState<BondAnalysisRequest | null>(initial?.payload ?? null);
  const [report, setReport] = useState<any>(initial?.report ?? null);
  const [licenseKey, setLicenseKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initial) {
      return;
    }
    setPayload(initial.payload);
    setReport(initial.report);
  }, [initial]);

  const normalizedReport = useMemo(() => {
    if (!report) {
      return null;
    }
    if (report?.teaser?.summary) {
      return report as BondAnalysisResponse;
    }
    if (typeof report === "string") {
      return {
        teaser: {
          summary: report,
          five_element_compatibility: "",
          radar_scores: {},
        },
        full_report: null,
        license_valid: false,
      } as BondAnalysisResponse;
    }
    const reportText = typeof report?.report === "string" ? report.report : "";
    if (reportText) {
      const isFull = report?.type === "full";
      return {
        teaser: {
          summary: reportText,
          five_element_compatibility: "",
          radar_scores: report?.radar_scores ?? {},
        },
        full_report: isFull ? reportText : null,
        license_valid: isFull,
      } as BondAnalysisResponse;
    }
    return report as BondAnalysisResponse;
  }, [report]);

  const radarEntries = useMemo(() => buildRadarEntries(normalizedReport?.teaser?.radar_scores), [normalizedReport]);
  const radarPoints = useMemo(() => buildPolygonPoints(radarEntries.map((item) => item.value), 74, 100), [radarEntries]);
  const radarGrid = useMemo(
    () => [0.33, 0.66, 1].map((ratio) => buildPolygonPoints(radarEntries.map(() => ratio * 100), 74, 100)),
    [radarEntries],
  );
  const radarAxes = useMemo(() => {
    const count = radarEntries.length;
    return radarEntries.map((item, index) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const x = 100 + Math.cos(angle) * 82;
      const y = 100 + Math.sin(angle) * 82;
      return { label: item.label, x, y };
    });
  }, [radarEntries]);

  const averageScore = Math.round(
    radarEntries.reduce((sum, item) => sum + item.value, 0) / radarEntries.length,
  );
  const relationshipLabel = getRelationshipLabel(averageScore);
  const teaserPreview = getTeaserPreview(normalizedReport?.teaser?.summary || "");
  const isUnlocked = Boolean(normalizedReport?.license_valid && normalizedReport?.full_report);
  const elementCombo = normalizedReport?.teaser?.five_element_compatibility || "Water meets Wood";
  const elementPair = elementCombo.replace(/\s*meets\s*/i, "-").replace(/\s+/g, " ").trim();
  const resultTitle = `${elementPair} Elemental Bond — Your BaZi Compatibility Reading`;
  const resultDescription = `Your ${elementPair} connection carries a rare dynamic. Discover the hidden pattern...`;

  const handleShare = async () => {
    if (!shareCardRef.current) {
      return;
    }
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
        style: {
          width: "1080px",
          height: "1920px",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "soul-resonance.png";
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate share image.");
    }
  };

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!payload || unlocking) {
      return;
    }
    if (!licenseKey.trim()) {
      setError("Please enter a Gumroad license key.");
      return;
    }
    setError(null);
    setUnlocking(true);
    try {
      const response = await analyzeBond({
        ...payload,
        license_key: licenseKey.trim(),
      });
      const nextReport = response?.data ?? response?.report ?? response;
      if (!nextReport) {
        throw new Error("License verification failed.");
      }
      const stored = { payload, report: nextReport };
      window.sessionStorage.setItem("bond:last_report", JSON.stringify(stored));
      setReport(nextReport);
      setLicenseKey("");
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        "请求超时，请重试";
      setError(message);
    } finally {
      setUnlocking(false);
    }
  };

  if (!payload || !normalizedReport) {
    return (
      <div className="result-empty">
        <p className="error-text">Submit two birth profiles on the homepage to generate your Elemental Bond report.</p>
        <InkButton type="button" onClick={() => navigate("/")}>
          Back to input
        </InkButton>
      </div>
    );
  }

  return (
    <div className="result-page fade-in">
      <Helmet>
        <title>{resultTitle}</title>
        <meta name="description" content={resultDescription} />
        <meta
          name="keywords"
          content="bazi compatibility, chinese astrology compatibility, soul resonance test, karmic relationship, twin flame calculator"
        />
        <link rel="canonical" href="https://elemental.bond" />
        <meta property="og:title" content={resultTitle} />
        <meta property="og:description" content={resultDescription} />
        <meta property="og:url" content="https://elemental.bond" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://elemental.bond/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resultTitle} />
        <meta name="twitter:description" content={resultDescription} />
        <meta name="twitter:image" content="https://elemental.bond/og-image.png" />
      </Helmet>
      <section className="result-scorecard">
        <div className="result-scorecard__summary">
          <p className="result-scorecard__label">Soul Resonance Score</p>
          <p className="result-scorecard__score">{averageScore} / 100</p>
          <p className="result-scorecard__type">{relationshipLabel}</p>
        </div>
        <div className="result-scorecard__radar">
          <svg viewBox="0 0 200 200" className="radar-chart">
            {radarGrid.map((points) => (
              <polygon key={points} points={points} className="radar-chart__grid" />
            ))}
            {radarAxes.map((axis) => (
              <line key={axis.label} x1={100} y1={100} x2={axis.x} y2={axis.y} className="radar-chart__axis" />
            ))}
            <polygon points={radarPoints} className="radar-chart__shape" />
          </svg>
          <div className="radar-legend">
            {radarEntries.map((item) => (
              <div key={item.label} className="radar-legend__item">
                <span className="radar-legend__label">{item.label}</span>
                <span className="radar-legend__value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="result-scorecard__share">
          <InkButton type="button" onClick={handleShare}>
            Share Your Soul Reading
          </InkButton>
        </div>
      </section>

      <section className="result-teaser">
        <div className="result-teaser__text">
          <ReactMarkdown>{teaserPreview}</ReactMarkdown>
        </div>
        <p className="result-teaser__hint">
          Full analysis includes palace readings, 2026 timing windows, and growth protocol...
        </p>
      </section>

      {isUnlocked ? (
        <section className="result-full">
          <div className="pre-wrap">{normalizedReport.full_report}</div>
          <p className="result-full__note">
            ✨ Your Elemental Signature and 2026 Activation Windows are included in your full reading.
          </p>
        </section>
      ) : (
        <section className="result-paywall">
          <div className="result-paywall__blur">
            <div className="paywall-blur__titles">
              <p>## Chapter 2: The Hidden Wound Pattern</p>
              <p>## Chapter 3: Your 2026 Activation Windows</p>
              <p>## Chapter 4: The Karmic Growth Contract</p>
              <p>## Chapter 5: Action Steps for This Month</p>
            </div>
            <div className="paywall-blur__body" style={{ filter: "blur(6px)" }}>
              {
                "Unlock the complete karmic map of this connection — including the hidden wound, the growth contract, and your 2026 activation windows."
              }
            </div>
          </div>
          <div className="result-paywall__overlay">
            <div className="paywall-card">
              <p className="paywall-card__title">Your souls have met before.</p>
              <ul className="paywall-card__list">
                <li>✓ Full Palace & Star Configuration Reading</li>
                <li>✓ 2026 Activation Windows & Timing Guide</li>
                <li>✓ Karmic Growth Protocol & Action Steps</li>
              </ul>
              <a
                className="paywall-card__buy"
                href="https://samzhu168.gumroad.com/l/bhpmxr"
                target="_blank"
                rel="noreferrer"
              >
                Reveal My Full Blueprint — $24.90
              </a>
              <div className="paywall-card__divider" />
              <p className="paywall-card__hint">Already purchased?</p>
              <form className="paywall-card__form" onSubmit={handleUnlock}>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(event) => setLicenseKey(event.target.value)}
                  placeholder="Enter your license key..."
                />
                <InkButton type="submit" disabled={unlocking}>
                  {unlocking ? "Unlocking..." : "Unlock Full Report"}
                </InkButton>
              </form>
              {error ? <p className="error-text">{error}</p> : null}
            </div>
          </div>
        </section>
      )}

      <section className="result-email-capture">
        <div className="email-capture__intro">
          <p>Not ready yet?</p>
          <p>Get your free 2026 Karmic Forecast delivered to your inbox.</p>
        </div>
        <EmailCapture />
      </section>

      <div
        ref={shareCardRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1920px",
          background:
            "radial-gradient(920px circle at 50% -18%, rgba(143, 96, 214, 0.32), transparent 60%), radial-gradient(840px circle at 20% 20%, rgba(92, 56, 132, 0.38), transparent 60%), radial-gradient(520px circle at 80% 82%, rgba(139, 98, 186, 0.24), transparent 60%), linear-gradient(180deg, #0a0a16 0%, #151124 55%, #0e0b1a 100%)",
          color: "#f7f2ff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "120px 90px",
          textAlign: "center",
          gap: "40px",
          borderRadius: "48px",
          border: "1px solid rgba(210, 187, 255, 0.18)",
          boxShadow: "0 40px 120px rgba(5, 2, 16, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "28px",
            borderRadius: "40px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "inset 0 0 60px rgba(111, 76, 154, 0.25)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(520px circle at 50% 12%, rgba(187, 143, 255, 0.18), transparent 60%), radial-gradient(460px circle at 18% 62%, rgba(104, 70, 168, 0.24), transparent 60%)",
            opacity: 0.9,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 3px)",
            opacity: 0.16,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.12) 0.5px, transparent 1.2px), radial-gradient(circle at 86% 22%, rgba(255, 255, 255, 0.14) 0.6px, transparent 1.4px), radial-gradient(circle at 32% 78%, rgba(255, 255, 255, 0.1) 0.5px, transparent 1.3px)",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />
        <div style={{ minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {averageScore > 80 ? (
            <div style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "1px", textShadow: "0 10px 40px rgba(140, 90, 220, 0.55)" }}>
              Rare Cosmic Match 🪐
            </div>
          ) : averageScore < 60 ? (
            <div style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "1px", textShadow: "0 10px 40px rgba(140, 90, 220, 0.55)" }}>
              Karmic Lesson Detected 🌪️
            </div>
          ) : (
            <div style={{ fontSize: "64px", fontWeight: 600, letterSpacing: "1px", textShadow: "0 10px 40px rgba(140, 90, 220, 0.55)" }}>
              Cosmic Connection
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", zIndex: 1 }}>
          <div style={{ fontSize: "28px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.8 }}>
            Magnetic Connection ✨
          </div>
          <div style={{ fontSize: "160px", fontWeight: 700, textShadow: "0 24px 80px rgba(70, 32, 120, 0.6)" }}>
            {averageScore}
          </div>
          <div style={{ fontSize: "36px", letterSpacing: "2px", opacity: 0.8 }}>{elementCombo}</div>
        </div>
        <div
          style={{
            width: "100%",
            padding: "26px 32px",
            borderRadius: "999px",
            background:
              "linear-gradient(90deg, rgba(116, 73, 168, 0.95), rgba(186, 142, 255, 0.95))",
            color: "#0b0714",
            fontSize: "26px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            boxShadow: "0 24px 60px rgba(20, 8, 35, 0.55), inset 0 0 24px rgba(255, 255, 255, 0.2)",
            zIndex: 1,
          }}
        >
          Curious about your person? Decode your dynamic at elemental.bond
        </div>
      </div>

      <section className="result-testimonials">
        <div className="result-testimonials__card">
          <p>"It felt like a mirror to our real dynamic — eerily precise and deeply grounding."</p>
          <p>— M.L., Seattle</p>
        </div>
        <div className="result-testimonials__card">
          <p>"The 2026 window timing was the exact clarity I needed to plan our next steps."</p>
          <p>— J.K., Toronto</p>
        </div>
        <div className="result-testimonials__card">
          <p>"I finally understood the hidden pattern behind our push-pull cycle."</p>
          <p>— A.R., Singapore</p>
        </div>
      </section>
      <p className="result-share-footer">
        Want to know what your score means? Share and tag us — we read every one.
      </p>
    </div>
  );
}
