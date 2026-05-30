import { FormEvent, useState } from "react";

const STORAGE_KEY = "bond:inline_capture_done";
const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");

interface Props {
  score?: number;
  elementPair?: string;
}

export function InlineEmailCapture({ score, elementPair }: Props) {
  const [done] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = email.trim();
    if (!normalized || !normalized.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setError(null);
    localStorage.setItem(STORAGE_KEY, "1");
    fetch(`${apiBase}/api/email-capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, source: "result_inline", score, element_pair: elementPair }),
    }).catch(() => {});
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="inline-capture inline-capture--done">
        <span className="inline-capture__check">&#10003;</span>
        <p className="inline-capture__success">Your elemental profile is on its way — check your inbox.</p>
      </div>
    );
  }

  return (
    <div className="inline-capture">
      <p className="inline-capture__title">Get your full elemental profile</p>
      <p className="inline-capture__subtitle">Free detailed breakdown sent to your inbox</p>
      <form className="inline-capture__form" onSubmit={handleSubmit}>
        <input
          className="oracle-input inline-capture__input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
        <button type="submit" className="oracle-button oracle-cta-button inline-capture__btn">
          Send It Free &rarr;
        </button>
      </form>
      {error && <p className="error-text" style={{ marginTop: "8px" }}>{error}</p>}
      <p className="inline-capture__note">No spam. One email. Unsubscribe anytime.</p>
    </div>
  );
}
