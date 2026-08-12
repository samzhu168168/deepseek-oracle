import { useEffect, useMemo, useRef, useState } from "react";
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
import { ShareButtons } from "../components/ShareButtons";
import type { BondAnalysisRequest, BondAnalysisResponse } from "../types";

type StoredReport = {
  payload: BondAnalysisRequest;
  report: any;
};

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
    return "Electric Tension Pair";
  }
  if (score >= 70) {
    return "Balanced Harmony Pair";
  }
  if (score >= 55) {
    return "Growth-Oriented Pair";
  }
  return "Karmic Challenge Pair";
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [shareCardStatus, setShareCardStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [postPaymentFlow, setPostPaymentFlow] = useState(false);
  const shareCardRef = useRef<HTMLDivElement | null>(null);

  // ── Detect Gumroad post-payment redirect ──
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

  // ── Auto-open License Key modal for post-payment users ──
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

  // ── Dynamic OG image URL for social sharing ──
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
  const resultTitle = `${elementPair} Compatibility - Soul Resonance Score ${averageScore}/100 | Elemental Bond`;
  const resultDescription = `Your ${elementPair} connection reveals a ${relationshipLabel.toLowerCase()}. ${averageScore}/100 Soul Resonance. Discover your hidden pattern, 2026 timing windows, and karmic growth edge.`;

  // ── Unique shareable URL with encoded result data ──
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

  const shareText = `My Soul Resonance Score: ${averageScore}/100\nElemental Bond: ${elementCombo}\nDiscover yours at ${shareUrl}`;

  const patternCard = useMemo(() => {
    const [primaryElement = "Water", secondaryElement = "Wood"] = elementPair.split("-").map((s) => s.trim());
    const elementsLabel = `${primaryElement} x ${secondaryElement}`;

    if (averageScore >= 75) {
      return {
        slug: "chemistry-trap",
        name: "Chemistry Trap",
        headline: "The spark is real. So is the pattern.",
        body: "Your nervous system may be recognizing the same ending before your mind names it.",
        cue: "Same pull. Same panic. Different person.",
        elements: elementsLabel,
      };
    }

    if (averageScore >= 55) {
      return {
        slug: "familiar-tension-loop",
        name: "Familiar Tension Loop",
        headline: "It feels familiar because your pattern knows the route.",
        body: "One part of you wants closeness. Another part is already bracing for the repeat.",
        cue: "Same comfort. Same doubt. Different face.",
        elements: elementsLabel,
      };
    }

    return {
      slug: "different-language-loop",
      name: "Different Language Loop",
      headline: "You are not too much. You are speaking different elemental languages.",
      body: "What feels natural to one of you can land like distance to the other.",
      cue: "Same ache. Same silence. Different person.",
      elements: elementsLabel,
    };
  }, [averageScore, elementPair]);

  const generateShareImage = async () => {
    if (!shareCardRef.current) {
      return null;
    }
    // Timeout guard: abort if image generation takes > 5s
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("share image generation timed out")), 5000)
    );
    try {
      const dataUrl = await Promise.race([
        toPng(shareCardRef.current, {
          cacheBust: true,
          pixelRatio: 3,
          backgroundColor: "#090711",
        }),
        timeoutPromise,
      ]);
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate share image:', err);
      return null;
    }
  };

  const handleSavePatternCard = async () => {
    setShareCardStatus("saving");
    const dataUrl = await generateShareImage();

    if (!dataUrl) {
      setShareCardStatus("error");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `elemental-bond-${patternCard.slug}.png`;
    link.click();
    setShareCardStatus("saved");
    window.setTimeout(() => setShareCardStatus("idle"), 2200);
  };

  const handleLicenseSuccess = (data: FullReportData | { licenseKey: string }) => {
    if ('fullAnalysis' in data) {
      setFullReportData(data);
    }
    setLicenseModalOpen(false);
  };

  const handleEmailGateSuccess = (_email: string) => {
    setEmailUnlocked(true);
    setEmailGateModalOpen(false);

    // Use the AI-generated teaser as the base of the preview, then append
    // element-specific pattern detail to deepen the hook before the paywall.
    const teaserText = normalizedReport?.teaser?.summary || '';
    const [el1, el2] = elementPair.split('-').map((s) => s.trim());
    const patternDetail =
      averageScore >= 75
        ? `\n\n**The Repeating Pattern**\n\n${el1} and ${el2} create the most electrically charged dynamic in elemental theory. The highs are real. So is the friction.\n\nOne of you escalates. The other withdraws. Then roles reverse. This isn't dysfunction — it's the ${el1}-${el2} cycle running exactly as designed.\n\nThe full reading reveals why this cycle intensifies in 2026, and the exact window to break it permanently.`
        : averageScore >= 55
        ? `\n\n**The Repeating Pattern**\n\n${el1} and ${el2} complement each other in theory. In practice, one leads while the other questions. One acts while the other reflects.\n\nThat friction is productive — if you understand what it's for. The full reading maps your specific activation windows in 2026 and the 5 steps to turn this tension into growth.`
        : `\n\n**The Repeating Pattern**\n\n${el1} and ${el2} speak different elemental languages. What feels natural to one lands wrong on the other. You've both felt it.\n\nThis isn't a flaw in the pairing — it's the nature of it. The full reading shows why this keeps happening and gives you specific protocols to bridge the gap.`;

    setPreviewData(teaserText ? `${teaserText}${patternDetail}` : patternDetail);

    setTimeout(() => {
      setPaymentModalOpen(true);
    }, 15000);
  };

  // Auto-show Email Gate after 6 seconds (give user time to read Teaser)
  useEffect(() => {
    if (!emailUnlocked && normalizedReport) {
      const timer = setTimeout(() => {
        setEmailGateModalOpen(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [emailUnlocked, normalizedReport]);

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
          <ShareButtons
            url={shareUrl}
            title={shareText}
            platforms={["copy", "twitter"]}
          />
        </div>
      </section>

      <section className="pattern-card-section" aria-labelledby="pattern-card-title">
        <div className="pattern-card-section__intro">
          <p className="pattern-card-section__eyebrow">Your shareable pattern card</p>
          <h2 id="pattern-card-title">Save this before the pattern talks you out of it.</h2>
          <p>
            Screenshot it for yourself, or share it when you want someone to understand the loop without the whole story.
          </p>
        </div>

        <div className="pattern-card-frame">
          <div ref={shareCardRef} className="pattern-card" aria-label={`Elemental Bond pattern card: ${patternCard.name}`}>
            <div className="pattern-card__glow pattern-card__glow--top" />
            <div className="pattern-card__glow pattern-card__glow--bottom" />
            <div className="pattern-card__grain" />

            <div className="pattern-card__topline">
              <span>ELEMENTAL BOND</span>
              <span>BAZI PATTERN READING</span>
            </div>

            <div className="pattern-card__score" aria-label={`Pattern score ${averageScore} out of 100`}>
              <span>{averageScore}</span>
              <small>/100</small>
            </div>

            <div className="pattern-card__pattern">
              <p>Your Pattern</p>
              <h3>{patternCard.name}</h3>
            </div>

            <p className="pattern-card__headline">{patternCard.headline}</p>
            <p className="pattern-card__body">{patternCard.body}</p>
            <div className="pattern-card__cue">{patternCard.cue}</div>

            <div className="pattern-card__footer">
              <span>{patternCard.elements}</span>
              <span>Free 60-second reading: elemental.bond</span>
            </div>
          </div>
        </div>

        <div className="pattern-card-actions">
          <button
            type="button"
            className="oracle-button oracle-cta-button"
            onClick={handleSavePatternCard}
            disabled={shareCardStatus === "saving"}
          >
            {shareCardStatus === "saving"
              ? "Creating card..."
              : shareCardStatus === "saved"
              ? "Saved"
              : "Save Pattern Card"}
          </button>
          <p className={`pattern-card-actions__status pattern-card-actions__status--${shareCardStatus}`}>
            {shareCardStatus === "error"
              ? "Image save failed. Screenshot the card directly."
              : "9:16 format for Stories, Shorts, and TikTok replies."}
          </p>
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
                Your Elemental Signature and 2026 Activation Windows are included in your full reading.
              </p>
            </>
          )}
        </section>
      ) : (
        <PaidReading
          onUnlock={() => {
            setPaymentModalOpen(true);
          }}
        />
      )}
      {/* --- Payment Modal (single unified path: Gumroad) --- */}
      {paymentModalOpen ? (
        <div className="paywall-modal paywall-modal--payment">
          <div className="paywall-modal__backdrop" onClick={() => setPaymentModalOpen(false)} />
          <div className="paywall-modal__panel paywall-modal__panel--sm" role="dialog" aria-modal="true">
            <button className="paywall-modal__close" type="button" onClick={() => setPaymentModalOpen(false)}>
              ×
            </button>
            <p className="paywall-modal__title">Unlock Your Pattern Breaker Report</p>

            <div className="paywall-price-anchor">
              <span className="paywall-price-now">$24.90</span>
            </div>

            <p className="paywall-modal__score">
              Your Soul Resonance Score: <strong>{averageScore} / 100</strong>
            </p>

            <div className="payment-option">
              <h4 className="payment-option__title">Credit Card / Debit Card</h4>
              <p className="payment-option__text">
                Secure checkout via Gumroad. One-time payment, instant access.
              </p>
              <button
                className="payment-option__btn"
                onClick={() => {
                  const returnUrl = encodeURIComponent(`${SITE_URL}/result?unlocked=true&ref=gumroad`);
                  window.open(`https://samzhu168.gumroad.com/l/bhpmxr?wanted=true&return_url=${returnUrl}`, "_blank");
                  setPaymentModalOpen(false);
                }}
              >
                Unlock Your Pattern Breaker Report — $24.90
              </button>
              <p className="payment-option__footer">
                Visa, Mastercard, Amex · One-time charge, no subscription
              </p>
            </div>

            <p className="payment-modal-footer">
              Secure payment. No refunds after delivery.
            </p>
          </div>
        </div>
      ) : null}

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
