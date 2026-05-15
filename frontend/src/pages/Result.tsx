import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { Helmet } from "react-helmet-async";

import { InkButton } from "../components/InkButton";
import { LicenseKeyModal, FullReportData } from "../components/LicenseKeyModal";
import { FullReport } from "../components/FullReport";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { EmailGateModal } from "../components/EmailGateModal";
import { TeaserReading } from "../components/TeaserReading";
import { PreviewReading } from "../components/PreviewReading";
import { PaidReading } from "../components/PaidReading";
import { LicenseKeyGuide } from "../components/LicenseKeyGuide";
import type { BondAnalysisRequest, BondAnalysisResponse } from "../types";

type StoredReport = {
  payload: BondAnalysisRequest;
  report: any;
};

const EMAIL_CAPTURE_STORAGE_KEY = "bond:email_forecast_submissions";
const EMAIL_CAPTURE_COUNT_KEY = "bond:email_forecast_count";
const DEFAULT_FORECAST_COUNT = 247;
const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

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
    return "‚ö?Electric Tension Pair";
  }
  if (score >= 70) {
    return "‚ú?Balanced Harmony Pair";
  }
  if (score >= 55) {
    return "üåô Growth-Oriented Pair";
  }
  return "üåë Karmic Challenge Pair";
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
          <InkButton type="submit">Send My Forecast </InkButton>
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
  const [fullReportData, setFullReportData] = useState<FullReportData | null>(null);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [emailGateModalOpen, setEmailGateModalOpen] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [, setShareImageUrl] = useState(`${SITE_URL}/og-image.png`);
  const [postPaymentFlow, setPostPaymentFlow] = useState(false);
  const shareCardRef = useRef<HTMLDivElement | null>(null);

  // ‚îÄ‚îÄ Detect Gumroad post-payment redirect ‚îÄ‚îÄ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlocked") === "true" && params.get("ref") === "gumroad") {
      sessionStorage.setItem("bond:post_payment", "true");
      window.history.replaceState({}, "", "/result");
      setPostPaymentFlow(true);
    }
    // Also check sessionStorage on mount (survives page refresh)
    if (sessionStorage.getItem("bond:post_payment") === "true") {
      setPostPaymentFlow(true);
    }
  }, []);

  // ‚îÄ‚îÄ Auto-open License Key modal for post-payment users ‚îÄ‚îÄ
  useEffect(() => {
    if (postPaymentFlow && normalizedReport) {
      const timer = setTimeout(() => {
        setLicenseModalOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [postPaymentFlow]);

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

  // ‚îÄ‚îÄ Dynamic OG image URL for social sharing ‚îÄ‚îÄ
  const ogImageUrl = useMemo(() => {
    const params = new URLSearchParams({
      e1: normalizedReport?.teaser?.five_element_compatibility?.split(" ")[0] || "Water",
      e2: normalizedReport?.teaser?.five_element_compatibility?.split(" ").pop() || "Wood",
      score: String(averageScore),
      label: relationshipLabel,
    });
    return `${SITE_URL}/api/og-image?${params.toString()}`;
  }, [normalizedReport, averageScore, relationshipLabel]);

  const isUnlocked = Boolean(fullReportData || (normalizedReport?.license_valid && normalizedReport?.full_report));
  const elementCombo = normalizedReport?.teaser?.five_element_compatibility || "Water meets Wood";
  const elementPair = elementCombo.replace(/\s*meets\s*/i, "-").replace(/\s+/g, " ").trim();
  const elements = elementPair.split("-").map((s) => s.trim());
  const resultTitle = `${elementPair} Compatibility ‚Ä?Soul Resonance Score ${averageScore}/100 | Elemental Bond`;
  const resultDescription = `Your ${elementPair} connection reveals a ${relationshipLabel.toLowerCase()}. ${averageScore}/100 Soul Resonance. Discover your hidden pattern, 2026 timing windows, and karmic growth edge.`;

  // ‚îÄ‚îÄ Unique shareable URL with encoded result data ‚îÄ‚îÄ
  const shareUrl = useMemo(() => {
    const data = {
      e1: elements[0] || "Water",
      e2: elements[1] || "Wood",
      s: averageScore,
      l: relationshipLabel,
    };
    const encoded = btoa(JSON.stringify(data));
    return `${SITE_URL}/?r=${encoded}`;
  }, [elements, averageScore, relationshipLabel]);

  const shareText = `My Soul Resonance Score: ${averageScore}/100\nElemental Bond: ${elementCombo}\nDiscover yours ‚Ü?${shareUrl}`;

  const generateShareImage = async () => {
    if (!shareCardRef.current) {
      return null;
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
      setShareImageUrl(dataUrl);
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate share image:', err);
      return null;
    }
  };

  const handleShare = async () => {
    // Copy share URL to clipboard (primary) with image download as fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Brief visual feedback could go here
    } catch {
      // Fallback: download image
      const dataUrl = await generateShareImage();
      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "soul-resonance.png";
        link.click();
      }
    }
  };

  const handleShareToX = async () => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const handleLicenseSuccess = (data: FullReportData) => {
    setFullReportData(data);
    setLicenseModalOpen(false);
  };

  const handleEmailGateSuccess = (_email: string) => {
    setEmailUnlocked(true);
    setEmailGateModalOpen(false);
    
    // Generate preview content (simulating API call)
    // TODO: Replace with actual API call
    const generatePreview = () => {
      const previews = {
        high: `I see ${elementPair.replace('-', ' meeting ')}.

${elementPair.split('-')[0]} wants to burn fast, make decisions now, feel everything intensely. ${elementPair.split('-')[1]} wants to flow, take time, process slowly. This creates a push-pull dynamic that feels exhausting ‚Ä?${elementPair.split('-')[0]} thinks ${elementPair.split('-')[1]} is avoiding, ${elementPair.split('-')[1]} thinks ${elementPair.split('-')[0]} is overwhelming.

But here's what most people miss: this tension is your growth edge. ${elementPair.split('-')[0]} learns patience. ${elementPair.split('-')[1]} learns courage. The thing you love about them is the thing that drives you crazy. That's not a coincidence.

The Midnight Fight: ${elementPair.split('-')[0]} wants to resolve things immediately. ${elementPair.split('-')[1]} needs time to process. So ${elementPair.split('-')[0]} pushes, ${elementPair.split('-')[1]} retreats, ${elementPair.split('-')[0]} pushes harder, ${elementPair.split('-')[1]} shuts down completely. This pattern repeats every 2-3 weeks.

But this is just the surface. The full pattern reveals the hidden dynamics, your 2026 timeline, and 5 specific action steps to break the cycle.`,
        medium: `I see ${elementPair.replace('-', ' meeting ')}.

This is a complementary dynamic where each element brings what the other lacks. ${elementPair.split('-')[0]} provides energy and initiative. ${elementPair.split('-')[1]} provides stability and grounding.

The tension shows up in decision-making. ${elementPair.split('-')[0]} wants to move fast. ${elementPair.split('-')[1]} wants to think it through. This creates friction, but it's productive friction ‚Ä?if you learn to work with it.

The Decision Paralysis: When you're trying to plan anything ‚Ä?a vacation, a move, a major purchase ‚Ä?${elementPair.split('-')[0]} gets impatient with ${elementPair.split('-')[1]}'s "slowness." ${elementPair.split('-')[1]} feels rushed by ${elementPair.split('-')[0]}'s "impulsiveness."

But this is just the surface. The full reading reveals your specific growth protocol and 2026 activation windows.`,
        low: `I see ${elementPair.replace('-', ' meeting ')}.

This is a challenging dynamic that requires conscious work. ${elementPair.split('-')[0]} and ${elementPair.split('-')[1]} operate on different frequencies. What feels natural to one feels foreign to the other.

The core tension: ${elementPair.split('-')[0]} processes externally. ${elementPair.split('-')[1]} processes internally. This creates misunderstandings that feel personal but are actually elemental.

The Communication Gap: ${elementPair.split('-')[0]} needs to talk things out immediately. ${elementPair.split('-')[1]} needs time alone to process. When ${elementPair.split('-')[0]} pushes for conversation, ${elementPair.split('-')[1]} withdraws. When ${elementPair.split('-')[1]} finally opens up, ${elementPair.split('-')[0]} has already moved on.

But this is just the surface. The full pattern shows you how to bridge this gap with specific protocols.`
      };
      
      if (averageScore >= 75) return previews.high;
      if (averageScore >= 55) return previews.medium;
      return previews.low;
    };
    
    setPreviewData(generatePreview());
    
    // Delay paywall display (give user time to read preview)
    setTimeout(() => {
      setPaywallModalOpen(true);
    }, 8000); // Show after 8 seconds to give user more time to read preview
  };

  // Auto-show Email Gate after 3 seconds (if not unlocked yet)
  useEffect(() => {
    if (!emailUnlocked && normalizedReport) {
      const timer = setTimeout(() => {
        setEmailGateModalOpen(true);
      }, 3000); // Changed to 3 seconds to give user time to read Teaser
      return () => clearTimeout(timer);
    }
  }, [emailUnlocked, normalizedReport]);

  useEffect(() => {
    const updateOgImage = async () => {
      await generateShareImage();
    };
    updateOgImage();
  }, [averageScore, elementCombo]);

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
          content={`${elementPair} compatibility, bazi reading, soul resonance test, karmic relationship reading, twin flame calculator, chinese astrology love match, five element compatibility, ${elementPair.replace('-', ' and ')} soul bond`}
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content={resultTitle} />
        <meta property="og:description" content={resultDescription} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resultTitle} />
        <meta name="twitter:description" content={resultDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
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
            Copy Share Link
          </InkButton>
          <InkButton type="button" kind="secondary" onClick={handleShareToX}>
            Share to X / Twitter
          </InkButton>
        </div>
      </section>

      {/* Conditional rendering: show different components based on unlock status */}
      {!emailUnlocked && !isUnlocked && (
        <TeaserReading 
          hook={normalizedReport?.teaser?.summary || "I see a pattern here. One that repeats. Let me show you what it means..."}
          elementPair={elementPair}
          score={averageScore}
        />
      )}

      {emailUnlocked && !isUnlocked && (
        <PreviewReading 
          preview={previewData || "The pattern is revealing itself..."}
          elementPair={elementPair}
          score={averageScore}
        />
      )}

      {!isUnlocked && (
        <LicenseKeyGuide
          onOpenModal={() => setLicenseModalOpen(true)}
          postPayment={postPaymentFlow}
        />
      )}

      {isUnlocked ? (
        <section className="result-full">
          {fullReportData ? (
            <FullReport 
              data={fullReportData} 
              elementPair={elementPair} 
              score={averageScore} 
            />
          ) : (
            <>
              <div className="result-full__report">
                <MarkdownRenderer content={normalizedReport.full_report || ""} />
              </div>
              <p className="result-full__note">
                ‚ú?Your Elemental Signature and 2026 Activation Windows are included in your full reading.
              </p>
            </>
          )}
        </section>
      ) : (
        <PaidReading
          onUnlock={(tier) => {
            if (tier === 'basic') {
              // Direct Gumroad purchase ‚Ä?redirect back to result page after payment
              const returnUrl = encodeURIComponent(`${SITE_URL}/result?unlocked=true&ref=gumroad`);
              window.open(`https://samzhu168.gumroad.com/l/bhpmxr?wanted=true&return_url=${returnUrl}`, '_blank');
            } else {
              // PDF Report purchase
              const returnUrl = encodeURIComponent(`${SITE_URL}/result?unlocked=true&ref=gumroad`);
              window.open(`https://samzhu168.gumroad.com/l/bhpmxr?wanted=true&return_url=${returnUrl}`, '_blank');
            }
          }}
        />
      )}
      {paywallModalOpen ? (
        <div className="paywall-modal">
          <div className="paywall-modal__backdrop" onClick={() => setPaywallModalOpen(false)} />
          <div className="paywall-modal__panel" role="dialog" aria-modal="true">
            <button className="paywall-modal__close" type="button" onClick={() => setPaywallModalOpen(false)}>
              √ó
            </button>
            <p className="paywall-modal__title">Your Full Blueprint Is Ready</p>
            <p className="paywall-modal__subtitle">One-time payment. Instant delivery to your email.</p>
            <p className="paywall-modal__score">Soul Resonance Score: {averageScore} / 100</p>
            <ul className="paywall-modal__list">
              <li>‚ú?800-word personalized BaZi analysis</li>
              <li>‚ú?2026 timing windows for your relationship</li>
              <li>‚ú?Specific action steps for your element pair</li>
            </ul>
            <a
              className="paywall-modal__cta"
              href="https://samzhu168.gumroad.com/l/bhpmxr"
              target="_blank"
              rel="noreferrer"
            >
              Yes, Reveal My Blueprint ‚Ä?$24.90
            </a>
            <p className="paywall-modal__note">Secure payment via Gumroad</p>
          </div>
        </div>
      ) : null}

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
              Rare Cosmic Match ü™ê
            </div>
          ) : averageScore < 60 ? (
            <div style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "1px", textShadow: "0 10px 40px rgba(140, 90, 220, 0.55)" }}>
              Karmic Lesson Detected üå™Ô∏?            </div>
          ) : (
            <div style={{ fontSize: "64px", fontWeight: 600, letterSpacing: "1px", textShadow: "0 10px 40px rgba(140, 90, 220, 0.55)" }}>
              Cosmic Connection
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", zIndex: 1 }}>
          <div style={{ fontSize: "28px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.8 }}>
            Magnetic Connection ‚ú?          </div>
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
          <p>"It felt like a mirror to our real dynamic ‚Ä?eerily precise and deeply grounding."</p>
          <p>‚Ä?M.L., Seattle</p>
        </div>
        <div className="result-testimonials__card">
          <p>"The 2026 window timing was the exact clarity I needed to plan our next steps."</p>
          <p>‚Ä?J.K., Toronto</p>
        </div>
        <div className="result-testimonials__card">
          <p>"I finally understood the hidden pattern behind our push-pull cycle."</p>
          <p>‚Ä?A.R., Singapore</p>
        </div>
      </section>
      <p className="result-share-footer">
        Want to know what your score means? Share and tag us ‚Ä?we read every one.
      </p>

      <EmailGateModal
        isOpen={emailGateModalOpen}
        onClose={() => setEmailGateModalOpen(false)}
        onSuccess={handleEmailGateSuccess}
        score={averageScore}
        elementPair={elementPair}
      />

      <LicenseKeyModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        onSuccess={handleLicenseSuccess}
        resultPayload={{
          person1: {
            date: payload.person_a?.date || '',
            time: payload.person_a?.time || '',
            gender: payload.person_a?.gender || 'Male',
          },
          person2: {
            date: payload.person_b?.date || '',
            time: payload.person_b?.time || '',
            gender: payload.person_b?.gender || 'Male',
          },
          score: averageScore,
          elementPair: elementPair,
        }}
      />
    </div>
  );
}
