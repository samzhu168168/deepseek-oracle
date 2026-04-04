/**
 * License Key 使用引导组件
 * 显示在结果页顶部，引导用户输入 License Key
 */
import React from 'react';
import './LicenseKeyGuide.css';

interface LicenseKeyGuideProps {
  onOpenModal: () => void;
}

export const LicenseKeyGuide: React.FC<LicenseKeyGuideProps> = ({ onOpenModal }) => {
  return (
    <div className="license-key-guide">
      <div className="license-key-guide-content">
        <div className="license-key-guide-icon">🔑</div>
        <div className="license-key-guide-text">
          <p className="license-key-guide-title">已经购买了完整报告？</p>
          <p className="license-key-guide-subtitle">
            检查你的邮箱，找到 License Key，点击下方按钮解锁
          </p>
        </div>
        <button 
          className="license-key-guide-btn"
          onClick={onOpenModal}
        >
          输入 License Key
        </button>
      </div>
    </div>
  );
};

export default LicenseKeyGuide;
