// FullReport.tsx
// 放置路径: frontend/src/components/FullReport.tsx
// 用途: 展示解锁后的完整报告，替换模糊区域

import { MarkdownRenderer } from './MarkdownRenderer'
import { FullReportData } from './LicenseKeyModal'

interface FullReportProps {
  data: FullReportData
  elementPair: string
  score: number
}

export function FullReport({ data, elementPair, score }: FullReportProps) {
  return (
    <div
      style={{
        animation: 'reportReveal 0.6s ease both',
      }}
    >
      {/* ── 解锁成功 Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fdf6ee, #f5ede0)',
          border: '1px solid #e8d5be',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span style={{ fontSize: '28px' }}>✦</span>
        <div>
          <div style={{ fontWeight: 700, color: '#8b6240', fontSize: '15px' }}>
            Full Blueprint Unlocked
          </div>
          <div style={{ color: '#a07850', fontSize: '13px', marginTop: '2px' }}>
            {elementPair} Bond · Soul Resonance Score: {score}/100
          </div>
        </div>
      </div>

      {/* ── Section 1: Full Analysis ── */}
      <ReportSection
        label="COMPLETE ELEMENTAL ANALYSIS"
        icon="◈"
        accent="#8b6240"
      >
        <MarkdownRenderer content={data.fullAnalysis} />
      </ReportSection>

      {/* ── Section 2: Palace Readings ── */}
      <ReportSection label="PALACE & STAR CONFIGURATION" icon="◇" accent="#5a7a8a">
        <div style={{ display: 'grid', gap: '16px' }}>
          <PalaceCard title="Your Elemental Palace" content={data.palaceReadings.person1} />
          <PalaceCard title="Their Elemental Palace" content={data.palaceReadings.person2} />
          <PalaceCard
            title="Combined Palace Dynamics"
            content={data.palaceReadings.combined}
            highlighted
          />
        </div>
      </ReportSection>

      {/* ── Section 3: 2026 Timing Windows ── */}
      <ReportSection label="2026 ACTIVATION WINDOWS" icon="◉" accent="#7a6a8a">
        <div style={{ display: 'grid', gap: '12px' }}>
          <TimingCard quarter="Q2 2026 (Apr–Jun)" content={data.timingWindows.q2_2026} intensity="high" />
          <TimingCard quarter="Q3 2026 (Jul–Sep)" content={data.timingWindows.q3_2026} intensity="medium" />
          <TimingCard quarter="Q4 2026 (Oct–Dec)" content={data.timingWindows.q4_2026} intensity="medium" />
        </div>
      </ReportSection>

      {/* ── Section 4: Karmic Protocol ── */}
      <ReportSection label="KARMIC GROWTH PROTOCOL" icon="✦" accent="#8a7060">
        <ol style={{ padding: '0 0 0 20px', margin: 0 }}>
          {data.karmicProtocol.map((step, i) => (
            <li
              key={i}
              style={{
                color: '#3d3530',
                fontSize: '15px',
                lineHeight: 1.75,
                marginBottom: '12px',
                paddingLeft: '8px',
              }}
            >
              {step}
            </li>
          ))}
        </ol>
      </ReportSection>

      {/* ── Section 5: Element Advice ── */}
      <ReportSection label="YOUR ELEMENT PAIR ADVANTAGE" icon="⬡" accent="#6a8a6a">
        <div
          style={{
            color: '#3d3530',
            background: '#f8f5f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <MarkdownRenderer content={data.elementAdvice} />
        </div>
      </ReportSection>

      {/* ── 底部保存提示 ── */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          color: '#999',
          fontSize: '13px',
          borderTop: '1px solid #f0ece8',
          marginTop: '8px',
        }}
      >
        💌 A copy of this report was sent to your email · License key: {data.licenseKey.slice(0, 8)}···
      </div>

      <style>{`
        @keyframes reportReveal {
          from { opacity: 0; transform: translateY(16px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
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
    <div style={{ marginBottom: '36px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <span style={{ color: accent, fontSize: '16px' }}>{icon}</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: accent,
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: '1px', background: '#f0ece8' }} />
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
    <div
      style={{
        padding: '16px 20px',
        borderRadius: '10px',
        background: highlighted ? '#fdf6ee' : '#faf9f7',
        border: `1px solid ${highlighted ? '#e8d5be' : '#eeebe6'}`,
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: highlighted ? '#8b6240' : '#888',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        {title.toUpperCase()}
      </div>
      <div style={{ color: '#3d3530', fontSize: '14px', lineHeight: 1.75 }}>{content}</div>
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
  const colors = {
    high: { bg: '#fdf6ee', border: '#e8c89a', dot: '#c4956a' },
    medium: { bg: '#f6f8fa', border: '#cdd5de', dot: '#7a9ab0' },
    low: { bg: '#f6f8f6', border: '#c8d5c8', dot: '#7a9a7a' },
  }
  const c = colors[intensity]
  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        padding: '16px',
        borderRadius: '10px',
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: c.dot,
          marginTop: '5px',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#3d3530', marginBottom: '4px' }}>
          {quarter}
        </div>
        <div style={{ fontSize: '14px', color: '#5a5550', lineHeight: 1.7 }}>{content}</div>
      </div>
    </div>
  )
}

