import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerByEmail, sendRegisterCode } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import type { UserProfile } from "../types";
import { setAuthData } from "../utils/auth";

interface RegisterPageProps {
  onAuthSuccess?: (user: UserProfile) => void;
}

export default function RegisterPage({ onAuthSuccess }: RegisterPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
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
      const res = await sendRegisterCode({ email: normalizedEmail });
      const expireMinutes = res.data?.expire_minutes || 10;
      setMessage(`Verification code sent. Please complete registration within ${expireMinutes} minutes.`);
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

    if (!email.trim() || !password.trim() || !emailCode.trim()) {
      setError("Please enter email, verification code, and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerByEmail({
        email: email.trim(),
        password: password.trim(),
        email_code: emailCode.trim(),
        invite_code: inviteCode.trim() || undefined,
      });
      if (!res.data) {
        throw new Error("Registration failed");
      }
      setAuthData(res.data.token, res.data.user);
      onAuthSuccess?.(res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin/dashboard" : "/oracle", { replace: true });
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage || (err instanceof Error ? err.message : "Registration failed. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <InkCard title="Email Registration" icon="R">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="register-code">Email verification code</label>
            <input
              id="register-code"
              type="text"
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value)}
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
            <label className="field__label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="register-invite">Invite code (optional)</label>
            <input
              id="register-invite"
              type="text"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="e.g. ORACLE-TRIAL-2026"
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}

          <div className="actions-row">
            <InkButton type="submit" disabled={loading}>{loading ? "Registering..." : "Register and sign in"}</InkButton>
            <Link to="/login">
              <InkButton type="button" kind="ghost">Go to sign in</InkButton>
            </Link>
          </div>
        </form>
      </InkCard>
    </div>
  );
}
