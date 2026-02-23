import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginByEmail } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import type { UserProfile } from "../types";
import { setAuthData } from "../utils/auth";

interface LoginPageProps {
  onAuthSuccess?: (user: UserProfile) => void;
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginByEmail({
        email: email.trim(),
        password: password.trim(),
      });
      if (!res.data) {
        throw new Error("Sign-in failed");
      }
      setAuthData(res.data.token, res.data.user);
      onAuthSuccess?.(res.data.user);
      navigate(res.data.user.role === "admin" ? "/admin/dashboard" : "/oracle", { replace: true });
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(apiMessage || (err instanceof Error ? err.message : "Sign-in failed. Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <InkCard title="Sign In" icon="S">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="actions-row">
            <InkButton type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</InkButton>
            <Link to="/register">
              <InkButton type="button" kind="ghost">Go to register</InkButton>
            </Link>
            <Link to="/forgot-password">
              <InkButton type="button" kind="ghost">Forgot password</InkButton>
            </Link>
          </div>
        </form>
      </InkCard>
    </div>
  );
}
