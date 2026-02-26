import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import { analyzeBond } from "../api";
import { InkButton } from "../components/InkButton";
import type { BondAnalysisRequest, BondAnalysisResponse } from "../types";

type StoredReport = {
  payload: BondAnalysisRequest;
  report: any;
};

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

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = (location.state as StoredReport | null) || readStoredReport();
  const [payload, setPayload] = useState<BondAnalysisRequest | null>(initial?.payload ?? null);
  const [report, setReport] = useState<any>(initial?.report ?? null);
  const [licenseKey, setLicenseKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            {
              "Unlock the complete karmic map of this connection — including the hidden wound, the growth contract, and your 2026 activation windows."
            }
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
    </div>
  );
}
