/**
 * License Key Guide Component
 * Shows at top of result page to guide users to enter their License Key.
 * Adapts messaging for post-payment vs. pre-payment states.
 */
import React from 'react';
import './LicenseKeyGuide.css';

interface LicenseKeyGuideProps {
  onOpenModal: () => void;
  postPayment?: boolean;
}

export const LicenseKeyGuide: React.FC<LicenseKeyGuideProps> = ({
  onOpenModal,
  postPayment = false,
}) => {
  return (
    <div className={`license-key-guide ${postPayment ? 'license-key-guide--post-payment' : ''}`}>
      <div className="license-key-guide-content">
        <div className="license-key-guide-icon">{postPayment ? '✅' : '🔑'}</div>
        <div className="license-key-guide-text">
          <p className="license-key-guide-title">
            {postPayment
              ? 'Payment Confirmed — Check Your Email'
              : 'Already Purchased?'}
          </p>
          <p className="license-key-guide-subtitle">
            {postPayment
              ? 'Your License Key was sent by Gumroad. Paste it below to unlock your full blueprint.'
              : 'Find the License Key in your Gumroad email, then enter it to unlock your reading.'}
          </p>
        </div>
        <button className="license-key-guide-btn" onClick={onOpenModal}>
          {postPayment ? 'Enter License Key & Unlock' : 'Enter License Key'}
        </button>
      </div>
    </div>
  );
};

export default LicenseKeyGuide;
