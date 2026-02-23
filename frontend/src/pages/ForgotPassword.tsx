import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { resetPasswordByEmail, sendForgotPasswordCode } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";


export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    setError(null);
    setMessage(null);
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Please enter your email first.");
      return;
    }

    setSendingCode(true);
    try {
      const res = await sendForgotPasswordCode({ email: normalizedEmail });
      const expireMinutes = res.data?.expire_minutes || 10;
      setMessage(`Verification code sent. Please reset within ${expireMinutes} minutes.`);
      setCountdown(60);
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage || (err instanceof Error ? err.message : "Failed to send verification code. Please try again later."));
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !resetCode.trim() || !newPassword.trim()) {
      setError("Please enter email, verification code, and new password.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordByEmail({
        email: email.trim(),
        reset_code: resetCode.trim(),
        new_password: newPassword.trim(),
      });
      setMessage("Password reset successfully. Please sign in with your new password.");
      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage || (err instanceof Error ? err.message : "Password reset failed. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <InkCard title="Reset Password" icon="R">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="forgot-code">Verification code</label>
            <input
              id="forgot-code"
              type="text"
              value={resetCode}
              onChange={(event) => setResetCode(event.target.value)}
              placeholder="Enter the email verification code"
            />
            <div className="actions-row">
              <InkButton
                type="button"
                kind="ghost"
                onClick={() => void handleSendCode()}
                disabled={sendingCode || countdown > 0}
              >
                {sendingCode ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Send code"}
              </InkButton>
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="forgot-new-password">New password</label>
            <input
              id="forgot-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="actions-row">
            <InkButton type="submit" disabled={loading}>{loading ? "Submitting..." : "Reset password"}</InkButton>
            <Link to="/login">
              <InkButton type="button" kind="ghost">Back to sign in</InkButton>
            </Link>
          </div>
        </form>
      </InkCard>
    </div>
  );
}
