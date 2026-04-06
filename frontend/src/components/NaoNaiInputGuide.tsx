/**
 * The Oracle Input Guide Component
 * Displays warm guidance text above input fields
 */
import React from 'react';
import './NaoNaiInputGuide.css';

interface NaoNaiInputGuideProps {
  text: string;
  className?: string;
}

export const NaoNaiInputGuide: React.FC<NaoNaiInputGuideProps> = ({
  text,
  className = '',
}) => {
  return (
    <div className={`naonai-input-guide ${className}`}>
      <span className="naonai-input-guide-icon">👵🏻</span>
      <p className="naonai-input-guide-text">{text}</p>
    </div>
  );
};

export default NaoNaiInputGuide;
