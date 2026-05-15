/**
 * Paid Reading Component - The Oracle
 * Shows locked deep insights with unlock options
 */
import React from 'react';
import './PaidReading.css';

interface LockedSectionProps {
  icon: string;
  title: string;
  description: string;
}

const LockedSection: React.FC<LockedSectionProps> = ({ icon, title, description }) => {
  return (
    <div className="locked-section">
      <div className="locked-section-icon">{icon}</div>
      <div className="locked-section-content">
        <h3 className="locked-section-title">
          <span className="lock-icon">🔒</span>
          {title}
        </h3>
        <p className="locked-section-description">{description}</p>
      </div>
    </div>
  );
};

interface PaidReadingProps {
  onUnlock: (tier: 'basic' | 'premium') => void;
  className?: string;
}

export const PaidReading: React.FC<PaidReadingProps> = ({
  onUnlock,
  className = '',
}) => {
  return (
    <div className={`paid-reading-locked ${className}`}>
      <div className="paid-reading-header">
        <div className="oracle-symbol-small">◈</div>
        <h2 className="paid-reading-title">THE FULL PATTERN</h2>
        <p className="paid-reading-subtitle">
          Unlock the complete reading to see what lies beneath
        </p>
      </div>

      <div className="locked-sections">
        <LockedSection 
          icon="🔮"
          title="The Hidden Dynamics"
          description="The patterns you can't see. The dynamics you keep repeating. The truth about what's really happening."
        />
        <LockedSection 
          icon="📅"
          title="Your 2026 Timeline"
          description="Month-by-month guidance. When to push forward. When to pull back. When to make your move."
        />
        <LockedSection 
          icon="⚡"
          title="The Action Protocol"
          description="5 specific steps to break the pattern. Not generic advice. Actual protocols you can implement today."
        />
        <LockedSection 
          icon="✨"
          title="Your Unique Edge"
          description="The hidden strength in your dynamic. What makes this pairing powerful. How to leverage it."
        />
      </div>

      <div className="unlock-options">
        <div className="unlock-card">
          <div className="unlock-card-header">
            <span className="unlock-card-icon">📖</span>
            <h3 className="unlock-card-title">Complete Reading</h3>
          </div>
          <div className="unlock-card-price">
            <span className="price-currency">$</span>
            <span className="price-amount">24.90</span>
          </div>
          <ul className="unlock-card-features">
            <li>✓ Full pattern analysis</li>
            <li>✓ 2026 timeline guidance</li>
            <li>✓ Specific action steps</li>
          </ul>
          <button
            className="unlock-btn unlock-btn-basic"
            onClick={() => onUnlock('basic')}
          >
            Unlock Full Reading
          </button>
        </div>

        <div className="unlock-card unlock-card-premium">
          <div className="unlock-card-badge">Most Popular</div>
          <div className="unlock-card-header">
            <span className="unlock-card-icon">📜</span>
            <h3 className="unlock-card-title">PDF Report</h3>
          </div>
          <div className="unlock-card-price">
            <span className="price-currency">$</span>
            <span className="price-amount">27</span>
          </div>
          <ul className="unlock-card-features">
            <li>✓ Everything in Complete Reading</li>
            <li>✓ Beautiful PDF report</li>
            <li>✓ Detailed charts & visuals</li>
            <li>✓ Save & share forever</li>
          </ul>
          <button
            className="unlock-btn unlock-btn-premium"
            onClick={() => onUnlock('premium')}
          >
            Get PDF Report
          </button>
        </div>
      </div>

      <div className="paid-reading-footer">
        <p className="paid-reading-guarantee">
          ✨ The Oracle's Promise: 60 years of pattern recognition, decoded for you
        </p>
      </div>
    </div>
  );
};

export default PaidReading;
