/**
 * Nǎi Nai 输入引导组件
 * 在输入框上方显示奶奶的温暖引导文字
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
