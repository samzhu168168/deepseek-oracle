/**
 * Free Reading Component - The Oracle Voice
 * Shows the teaser reading with direct, confident tone
 */
import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import './FreeReading.css';

interface FreeReadingProps {
  summary: string;
  elementPair: string;
  score: number;
  className?: string;
}

export const FreeReading: React.FC<FreeReadingProps> = ({
  summary,
  elementPair,
  score,
  className = '',
}) => {
  return (
    <section className={`free-reading ${className}`}>
      <div className="free-reading-header">
        <div className="oracle-symbol">◈</div>
        <h2 className="free-reading-title">THE ORACLE SEES</h2>
      </div>

      <div className="free-reading-content">
        <div className="element-reveal">
          <span className="element-pair">{elementPair}</span>
          <span className="compatibility-score">{score}/100</span>
        </div>

        <div className="oracle-reading">
          <MarkdownRenderer content={summary || "I see a pattern here. One that repeats. Let me show you what it means..."} />
        </div>
      </div>

      <div className="free-reading-cta">
        <p className="cta-text">Want to see the full pattern?</p>
        <p className="cta-subtext">Unlock your complete reading below</p>
      </div>
    </section>
  );
};

export default FreeReading;
