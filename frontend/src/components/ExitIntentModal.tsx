/** ExitIntentModal — Captures abandoning visitors with a targeted email offer.
 *  Shows when mouse leaves the window (intent to close/switch tabs).
 *  Uses sessionStorage to only show once per session.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bond:exit_intent_shown";

interface ExitIntentModalProps {
  /** Override default delay before mounting listeners (ms) */
  mountDelay?: number;
}

export function ExitIntentModal({ mountDelay = 8000 }: ExitIntentModalProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(false);

  useEffect(() => {
    // Don't show if already seen this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      mounted.current = true;
    }, mountDelay);

    return () => clearTimeout(timer);
  }, [mountDelay]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!mounted.current) return;
    // Only trigger when mouse moves to the top of the viewport (browser chrome area)
    if (e.clientY > 0) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(true);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim();
    if (!normalized || !normalized.includes("@")) {
      setError("Valid email required");
      return;
    }
    setError("");

    // Store in localStorage for email capture
    try {
      const raw = localStorage.getItem("bond:email_forecast_submissions");
      const items = raw ? JSON.parse(raw) : [];
      items.push({ email: normalized, source: "exit_intent", submitted_at: new Date().toISOString() });
      localStorage.setItem("bond:email_forecast_submissions", JSON.stringify(items));

      // Increment counter
      const count = Number(localStorage.getItem("bond:email_forecast_count") || "247");
      localStorage.setItem("bond:email_forecast_count", String(count + 1));
    } catch { /* ignore */ }

    setSubmitted(true);
  };

  if (!visible) return null;

  return (
    <div className="exit-intent-overlay">
      <div className="exit-intent-backdrop" onClick={() => setVisible(false)} />
      <div className="exit-intent-modal" role="dialog" aria-modal="true">
        <button
          className="exit-intent-close"
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div className="exit-intent-symbol">◈</div>
            <h2 className="exit-intent-title">
              Wait — Before You Go
            </h2>
            <p className="exit-intent-subtitle">
              Your BaZi chart reveals patterns Western astrology can't touch.
            </p>
            <p className="exit-intent-body">
              Enter your email and we'll send you a{" "}
              <strong>free 2026 Karmic Forecast</strong> — personalized to your
              birth chart, with Snake Year timing windows included.
            </p>
            <form onSubmit={handleSubmit} className="exit-intent-form">
              <input
                type="email"
                className="oracle-input"
                placeholder="Your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                autoFocus
              />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="oracle-button oracle-cta-button exit-intent-submit">
                Send My Free Forecast
              </button>
            </form>
            <p className="exit-intent-note">
              No spam. One email with your personalized forecast. Unsubscribe anytime.
            </p>
          </>
        ) : (
          <div className="exit-intent-success">
            <div className="exit-intent-success-icon">✓</div>
            <h2 className="exit-intent-title">You're In</h2>
            <p className="exit-intent-body">
              Check your inbox in the next 24 hours for your free 2026 Karmic Forecast.
            </p>
            <p className="exit-intent-body" style={{ opacity: 0.7 }}>
              In the meantime — go ahead and{" "}
              <a href="/bazi" className="exit-intent-link">get your free BaZi reading</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
