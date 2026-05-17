// FullReport.tsx
// Displays the unlocked full report with warm "paper" aesthetic (intentional contrast to dark UI)

import { MarkdownRenderer } from './MarkdownRenderer'
import { FullReportData } from './LicenseKeyModal'

interface FullReportProps {
  data: FullReportData
  elementPair: string
  score: number
}

export function FullReport({ data, elementPair, score }: FullReportProps) {
  return (
    <div className="full-report-reveal">

      {/* Unlock success banner */}
      <div className="full-report-unlock-banner">
        <span className="full-report-unlock-banner__icon">✦</span>
        <div>
          <div className="full-report-unlock-banner__label">Full Blueprint Unlocked</div>
          <div className="full-report-unlock-banner__meta">
            {elementPair} Bond · Soul Resonance Score: {score}/100
          </div>
        </div>
      </div>

      {/* Section 1: Full Analysis */}
      <ReportSection label="COMPLETE ELEMENTAL ANALYSIS" icon="◈" accent="#8b6240">
        <MarkdownRenderer content={data.fullAnalysis} />
      </ReportSection>

      {/* Section 2: Palace Readings */}
      <ReportSection label="PALACE & STAR CONFIGURATION" icon="◇" accent="#5a7a8a">
        <div className="palace-cards">
          <PalaceCard title="Your Elemental Palace" content={data.palaceReadings.person1} />
          <PalaceCard title="Their Elemental Palace" content={data.palaceReadings.person2} />
          <PalaceCard
            title="Combined Palace Dynamics"
            content={data.palaceReadings.combined}
            highlighted
          />
        </div>
      </ReportSection>

      {/* Section 3: 2026 Timing Windows */}
      <ReportSection label="2026 ACTIVATION WINDOWS" icon="◉" accent="#7a6a8a">
        <div className="timing-cards">
          <TimingCard quarter="Now–Jul 2026" content={data.timingWindows.q2_2026} intensity="high" />
          <TimingCard quarter="Aug–Sep 2026" content={data.timingWindows.q3_2026} intensity="medium" />
          <TimingCard quarter="Oct–Dec 2026" content={data.timingWindows.q4_2026} intensity="medium" />
        </div>
      </ReportSection>

      {/* Section 4: Karmic Protocol */}
      <ReportSection label="KARMIC GROWTH PROTOCOL" icon="✦" accent="#8a7060">
        <ol className="report-karmic-list">
          {data.karmicProtocol.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </ReportSection>

      {/* Section 5: Element Advice */}
      <ReportSection label="YOUR ELEMENT PAIR ADVANTAGE" icon="⬡" accent="#6a8a6a">
        <div className="report-element-advice">
          <MarkdownRenderer content={data.elementAdvice} />
        </div>
      </ReportSection>

      {/* Footer */}
      <div className="report-footer">
        💌 A copy of this report was sent to your email · License key: {data.licenseKey.slice(0, 8)}···
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────

function ReportSection({
  label,
  icon,
  accent,
  children,
}: {
  label: string
  icon: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="report-section">
      <div className="report-section__header">
        <span className="report-section__icon" style={{ color: accent }}>{icon}</span>
        <span className="report-section__label" style={{ color: accent }}>{label}</span>
        <div className="report-section__divider" />
      </div>
      {children}
    </div>
  )
}

function PalaceCard({
  title,
  content,
  highlighted = false,
}: {
  title: string
  content: string
  highlighted?: boolean
}) {
  return (
    <div className={`palace-card${highlighted ? ' palace-card--highlighted' : ''}`}>
      <div className="palace-card__label">{title.toUpperCase()}</div>
      <div className="palace-card__content">{content}</div>
    </div>
  )
}

function TimingCard({
  quarter,
  content,
  intensity,
}: {
  quarter: string
  content: string
  intensity: 'high' | 'medium' | 'low'
}) {
  return (
    <div className={`timing-card timing-card--${intensity}`}>
      <div className="timing-dot" />
      <div>
        <div className="timing-card__quarter">{quarter}</div>
        <div className="timing-card__content">{content}</div>
      </div>
    </div>
  )
}
