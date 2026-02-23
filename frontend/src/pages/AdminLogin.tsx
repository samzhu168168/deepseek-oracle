import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginAdminByCode, sendAdminLoginCode } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import type { UserProfile } from "../types";
import { setAuthData } from "../utils/auth";

interface AdminLoginPageProps {
  onAuthSuccess?: (user: UserProfile) => void;
}

const SPECIAL_ADMIN_EMAIL = "bald0wang@qq.com";

export default function AdminLoginPage({ onAuthSuccess }: AdminLoginPageProps) {
  const navigate = useNavigate();

  const [loginCode, setLoginCode] = useState("");
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
    setSendingCode(true);
    try {
      const res = await sendAdminLoginCode({ email: SPECIAL_ADMIN_EMAIL });
      const expireMinutes = res.data?.expire_minutes || 10;
      setMessage(`Verification code sent to ${SPECIAL_ADMIN_EMAIL}. Please sign in within ${expireMinutes} minutes.`);
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

    if (!loginCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdminByCode({
        email: SPECIAL_ADMIN_EMAIL,
        login_code: loginCode.trim(),
      });
      if (!res.data) {
        throw new Error("Sign-in failed");
      }
      setAuthData(res.data.token, res.data.user);
      onAuthSuccess?.(res.data.user);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage || (err instanceof Error ? err.message : "Sign-in failed. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <InkCard title="Admin Sign In" icon="A">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="admin-login-email">Admin email</label>
            <input
              id="admin-login-email"
              type="email"
              value={SPECIAL_ADMIN_EMAIL}
              readOnly
            />
            <p className="field__hint">Only this email can sign in with a verification code.</p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="admin-login-code">Email verification code</label>
            <input
              id="admin-login-code"
              type="text"
              value={loginCode}
              onChange={(event) => setLoginCode(event.target.value)}
              placeholder="Enter verification code"
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

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="actions-row">
            <InkButton type="submit" disabled={loading}>{loading ? "Signing in..." : "Verify and enter admin"}</InkButton>
          </div>
        </form>
      </InkCard>
    </div>
  );
}
