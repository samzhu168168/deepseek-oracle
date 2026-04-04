/**
 * Payment Guide Modal - The Oracle
 * Guides users through the payment process
 */
import React from 'react';
import './PaymentGuideModal.css';

interface PaymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tier: 'basic' | 'premium';
  price: string;
}

export const PaymentGuideModal: React.FC<PaymentGuideModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tier,
  price,
}) => {
  if (!isOpen) return null;

  const tierName = tier === 'basic' ? 'Complete Reading' : 'PDF Report';

  return (
    <div className="payment-guide-modal">
      <div className="payment-guide-backdrop" onClick={onClose} />
      <div className="payment-guide-content">
        <button className="payment-guide-close" onClick={onClose}>
          ×
        </button>

        <div className="payment-guide-header">
          <div className="payment-guide-symbol">◈</div>
          <h2 className="payment-guide-title">Secure Payment</h2>
        </div>

        <div className="payment-guide-body">
          <div className="payment-guide-item">
            <span className="payment-guide-icon">📦</span>
            <div className="payment-guide-text">
              <strong>You're unlocking:</strong>
              <p>{tierName} - {price}</p>
            </div>
          </div>

          <div className="payment-guide-item">
            <span className="payment-guide-icon">🔒</span>
            <div className="payment-guide-text">
              <strong>Secure Payment:</strong>
              <p>Processed through Gumroad (Credit Card, PayPal accepted)</p>
            </div>
          </div>

          <div className="payment-guide-item">
            <span className="payment-guide-icon">📧</span>
            <div className="payment-guide-text">
              <strong>After Payment:</strong>
              <p>License Key sent instantly to your email</p>
            </div>
          </div>

          <div className="payment-guide-item">
            <span className="payment-guide-icon">🔓</span>
            <div className="payment-guide-text">
              <strong>How to Unlock:</strong>
              <p>Return here, click "Enter License Key" to view your full reading</p>
            </div>
          </div>

          <div className="payment-guide-item">
            <span className="payment-guide-icon">✨</span>
            <div className="payment-guide-text">
              <strong>Quality Guarantee:</strong>
              <p>60 years of pattern recognition, decoded for you</p>
            </div>
          </div>
        </div>

        <div className="payment-guide-footer">
          <button className="payment-guide-btn-secondary" onClick={onClose}>
            Not Yet
          </button>
          <button className="payment-guide-btn-primary" onClick={onConfirm}>
            Continue to Payment →
          </button>
        </div>

        <div className="payment-guide-disclaimer">
          <p>⚠️ Digital product - No refunds after delivery</p>
          <p>Technical issues? Contact support</p>
        </div>

        <p className="payment-guide-note">
          💡 Payment page opens in new tab - keep this page open
        </p>
      </div>
    </div>
  );
};

export default PaymentGuideModal;
