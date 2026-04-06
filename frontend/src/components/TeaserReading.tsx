/**
 * Teaser Reading Component - The Hook
 * Shows only the mysterious opening to create curiosity
 */
import React from 'react';
import './TeaserReading.css';

interface TeaserReadingProps {
  hook: string;  // 50-100 word mysterious opening
  elementPair: string;
  score: number;
  className?: string;
}

export const TeaserReading: React.FC<TeaserReadingProps> = ({
  hook,
  elementPair,
  score,
  className = '',
}) => {
  return (
    <section className={`teaser-reading ${className}`}>
      <div className="teaser-header">
        <div className="oracle-symbol">◈</div>
        <h2 className="teaser-title">THE ORACLE SEES</h2>
      </div>

      <div className="teaser-content">
        <div className="element-reveal">
          <span className="element-pair">{elementPair}</span>
          <span className="compatibility-score">{score}/100</span>
        </div>

        {/* The Hook - mysterious opening that creates curiosity */}
        <div className="oracle-hook">
          {hook || "I see a pattern here. One that repeats. Let me show you what it means..."}
        </div>

        {/* Cliffhanger - make them want more */}
        <div className="teaser-cliffhanger">
          <p className="cliffhanger-text">But there's more. Much more.</p>
          <p className="teaser-hint">
            Want to see what happens next?
          </p>
        </div>
      </div>
    </section>
  );
};

export default TeaserReading;
