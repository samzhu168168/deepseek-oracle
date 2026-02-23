import { FormEvent, useEffect, useState } from "react";

import { loginByEmail, registerByEmail, sendRegisterCode } from "../api";
import type { UserProfile } from "../types";
import { setAuthData } from "../utils/auth";
import { InkButton } from "./InkButton";

type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: UserProfile) => void;
  initialMode?: AuthMode;
}

export function AuthModal({ open, onClose, onAuthSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerEmailCode, setRegisterEmailCode] = useState("");
  const [registerInviteCode, setRegisterInviteCode] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  useEffect(() => {
    if (!open) {
      return () => {};
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginMessage(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await loginByEmail({
        email: loginEmail.trim(),
        password: loginPassword.trim(),
      });
      if (!response.data) {
        throw new Error("Sign-in failed");
      }
      setAuthData(response.data.token, response.data.user);
      onAuthSuccess?.(response.data.user);
      onClose();
    } catch (error) {
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setLoginError(apiMessage || (error instanceof Error ? error.message : "Sign-in failed. Please try again later."));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendRegisterCode = async () => {
    setRegisterError(null);
    setRegisterMessage(null);
    const email = registerEmail.trim();
    if (!email) {
      setRegisterError("Please enter your email first.");
      return;
    }

    setSendingCode(true);
    try {
      const response = await sendRegisterCode({ email });
      const expireMinutes = response.data?.expire_minutes || 10;
      setRegisterMessage(`Verification code sent. Complete registration within ${expireMinutes} minutes.`);
      setCountdown(60);
    } catch (error) {
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setRegisterError(apiMessage || (error instanceof Error ? error.message : "Failed to send verification code. Please try again later."));
    } finally {
      setSendingCode(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    setRegisterMessage(null);
    setLoginMessage(null);
    if (!registerEmail.trim() || !registerPassword.trim() || !registerEmailCode.trim()) {
      setRegisterError("Please enter email, verification code, and password.");
      return;
    }

    setRegisterLoading(true);
    try {
      const response = await registerByEmail({
        email: registerEmail.trim(),
        password: registerPassword.trim(),
        email_code: registerEmailCode.trim(),
        invite_code: registerInviteCode.trim() || undefined,
      });
      if (!response.data) {
        throw new Error("Registration failed");
      }
      setRegisterPassword("");
      setRegisterEmailCode("");
      setRegisterInviteCode("");
      setCountdown(0);
      setMode("login");
      setLoginEmail(registerEmail.trim());
      setLoginPassword("");
      setLoginMessage("Registration successful. Please sign in.");
    } catch (error) {
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setRegisterError(apiMessage || (error instanceof Error ? error.message : "Registration failed. Please try again later."));
    } finally {
      setRegisterLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="auth-modal__backdrop"
      role="presentation"
      onClick={() => {
        onClose();
      }}
    >
      <div
        className="auth-modal__shell"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <section
          className="auth-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Sign In / Register modal"
        >
          <div className="auth-modal__tabs" role="tablist" aria-label="Sign In / Register tabs">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-modal__tab ${mode === "login" ? "auth-modal__tab--active" : ""}`}
              onClick={() => {
                setMode("login");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`auth-modal__tab ${mode === "register" ? "auth-modal__tab--active" : ""}`}
              onClick={() => {
                setMode("register");
              }}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <form className="stack auth-modal__form" onSubmit={handleLoginSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-login-email">Email</label>
                <input
                  id="auth-modal-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-login-password">Password</label>
                <input
                  id="auth-modal-login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </div>
              {loginError ? <p className="error-text">{loginError}</p> : null}
              {loginMessage ? <p className="success-text">{loginMessage}</p> : null}
              <div className="actions-row auth-modal__actions">
                <InkButton 
                  type="button" 
                  kind="secondary" 
                  className="auth-modal__cancel-btn"
                  onClick={() => onClose()}
                  disabled={loginLoading}
                >
                  Cancel
                </InkButton>
                <InkButton type="submit" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Sign In"}
                </InkButton>
              </div>
            </form>
          ) : (
            <form className="stack auth-modal__form" onSubmit={handleRegisterSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-register-email">Email</label>
                <div className="auth-modal__input-with-action">
                  <input
                    id="auth-modal-register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                  />
                  <InkButton
                    type="button"
                    kind="ghost"
                    className="auth-modal__inline-send"
                    onClick={() => void handleSendRegisterCode()}
                    disabled={sendingCode || countdown > 0}
                  >
                    {sendingCode ? "Sending..." : countdown > 0 ? `${countdown}s` : "Send code"}
                  </InkButton>
                </div>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-register-code">Email verification code</label>
                <input
                  id="auth-modal-register-code"
                  type="text"
                  placeholder="Enter the verification code"
                  value={registerEmailCode}
                  onChange={(event) => setRegisterEmailCode(event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-register-password">Password</label>
                <input
                  id="auth-modal-register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="auth-modal-register-invite">Invite code (optional)</label>
                <input
                  id="auth-modal-register-invite"
                  type="text"
                  placeholder="e.g. ORACLE-TRIAL-2026"
                  value={registerInviteCode}
                  onChange={(event) => setRegisterInviteCode(event.target.value)}
                />
              </div>
              {registerError ? <p className="error-text">{registerError}</p> : null}
              {registerMessage ? <p className="success-text">{registerMessage}</p> : null}
              <div className="actions-row auth-modal__actions">
                <InkButton 
                  type="button" 
                  kind="secondary" 
                  className="auth-modal__cancel-btn"
                  onClick={() => onClose()}
                  disabled={registerLoading}
                >
                  Cancel
                </InkButton>
                <InkButton type="submit" disabled={registerLoading}>
                  {registerLoading ? "Submitting..." : "Submit"}
                </InkButton>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
