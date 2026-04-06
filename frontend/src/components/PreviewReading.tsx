/**
 * Preview Reading Component - Email Unlocked
 * Shows 200-300 word preview after email capture
 */
import React from 'react';
import './PreviewReading.css';

interface PreviewReadingProps {
  preview: string;  // 200-300 word preview
  elementPair: string;
  score: number;
  className?: string;
}

export const PreviewReading: React.FC<PreviewReadingProps> = ({
  preview,
  elementPair,
  score,
  className = '',
}) => {
  return (
    <section className={`preview-reading ${className}`}>
      <div className="preview-header">
        <div className="oracle-symbol">◈</div>
        <h2 className="preview-title">THE PATTERN EMERGES</h2>
        <p className="preview-subtitle">
          You've unlocked the preview. Here's what I see...
        </p>
      </div>

      <div className="preview-content">
        <div className="element-reveal">
          <span className="element-pair">{elementPair}</span>
          <span className="compatibility-score">{score}/100</span>
        </div>

        {/* Preview Content - 200-300 words */}
        <div className="oracle-preview">
          {preview || "The pattern is revealing itself..."}
        </div>

        {/* Cliffhanger - show what's locked */}
        <div className="preview-cliffhanger">
          <p className="cliffhanger-text">But this is just the surface.</p>
          <p className="preview-hint">
            The full pattern reveals:
          </p>
          <ul className="preview-locked-list">
            <li>
              <span className="lock-icon">🔒</span>
              <span className="locked-text">The hidden dynamics you can't see</span>
            </li>
            <li>
              <span className="lock-icon">🔒</span>
              <span className="locked-text">Your 2026 timeline month-by-month</span>
            </li>
            <li>
              <span className="lock-icon">🔒</span>
              <span className="locked-text">5 specific action steps to break the pattern</span>
            </li>
            <li>
              <span className="lock-icon">🔒</span>
              <span className="locked-text">Your unique edge in this dynamic</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PreviewReading;
