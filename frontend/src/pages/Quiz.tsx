import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";

type PersonInput = {
  date: string;
  time: string;
  gender: "Male" | "Female";
};

const LOADING_MESSAGES = [
  "Reading the elemental pattern...",
  "Calculating karmic resonance...",
  "Mapping your 2026 Snake Year windows...",
  "The Oracle is preparing your Blueprint...",
];

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function QuizPage() {
  const navigate = useNavigate();
  const [personA, setPersonA] = useState<PersonInput>({ date: "", time: "", gender: "Female" });
  const [personB, setPersonB] = useState<PersonInput>({ date: "", time: "", gender: "Male" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setLoadingMessageIndex(0); return; }
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!personA.date) { setError("Your birth date is required."); return; }
    if (!personB.date) { setError("Their birth date is required."); return; }
    setLoading(true);
    try {
      const payload = {
        person_a: { date: personA.date, time: personA.time, gender: personA.gender },
        person_b: { date: personB.date, time: personB.time, gender: personB.gender },
      };
      const response = await analyzeBond(payload);
      const report = response?.data ?? response?.report ?? response;
      if (!report) throw new Error("Analysis result is empty.");
      const stored = { payload, report };
      window.sessionStorage.setItem("bond:last_report", JSON.stringify(stored));
      navigate("/result", { state: stored });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        "Request timeout, please try again";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page fade-in quiz-page">
      <Helmet>
        <title>Discover Your BaZi Element — Free Reading | Elemental Bond</title>
        <meta
          name="description"
          content="Find out your BaZi element and why you keep attracting the same type of person. Free 2-minute reading — no sign-up needed."
        />
        <link rel="canonical" href={`${SITE_URL}/quiz`} />
      </Helmet>

      <section className="bond-hero oracle-hero quiz-hero">
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">
          Why do you keep attracting<br />the same type of person?
        </h1>
        <div className="hero-divider" />
        <p className="oracle-hero-subtitle">
          Enter both birth dates. The Oracle reveals the elemental pattern in 60 seconds.
        </p>
        <p className="quiz-trust-line">Free · No sign-up · 2,000 years of BaZi pattern recognition</p>
      </section>

      <form className="bond-form oracle-form" onSubmit={onSubmit}>
        <div className="bond-form__columns">
          <section className="bond-form__panel oracle-card">
            <div className="oracle-input-guide">
              <span className="oracle-guide-icon">◈</span>
              <p className="oracle-guide-text">Your birth details</p>
            </div>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="quiz-a-date">Your Birth Date</label>
                <input
                  id="quiz-a-date"
                  type="date"
                  className="oracle-input"
                  inputMode="numeric"
                  autoComplete="bday"
                  value={personA.date}
                  onChange={(e) => setPersonA((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="quiz-a-time">Birth Time (optional)</label>
                <input
                  id="quiz-a-time"
                  type="time"
                  className="oracle-input"
                  inputMode="numeric"
                  value={personA.time}
                  onChange={(e) => setPersonA((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="quiz-a-gender">Gender</label>
                <select
                  id="quiz-a-gender"
                  className="oracle-input"
                  value={personA.gender}
                  onChange={(e) => setPersonA((prev) => ({ ...prev, gender: e.target.value as "Male" | "Female" }))}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bond-form__panel oracle-card">
            <div className="oracle-input-guide">
              <span className="oracle-guide-icon">◈</span>
              <p className="oracle-guide-text">Their birth details</p>
            </div>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="quiz-b-date">Their Birth Date</label>
                <input
                  id="quiz-b-date"
                  type="date"
                  className="oracle-input"
                  inputMode="numeric"
                  autoComplete="bday"
                  value={personB.date}
                  onChange={(e) => setPersonB((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="quiz-b-time">Birth Time (optional)</label>
                <input
                  id="quiz-b-time"
                  type="time"
                  className="oracle-input"
                  inputMode="numeric"
                  value={personB.time}
                  onChange={(e) => setPersonB((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="quiz-b-gender">Gender</label>
                <select
                  id="quiz-b-gender"
                  className="oracle-input"
                  value={personB.gender}
                  onChange={(e) => setPersonB((prev) => ({ ...prev, gender: e.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? (
          <div className="oracle-loading">
            <span className="oracle-loading-icon">◈</span>
            <p className="bond-form__loading-text">{LOADING_MESSAGES[loadingMessageIndex]}</p>
          </div>
        ) : null}

        <button type="submit" className="oracle-button oracle-cta-button" disabled={loading}>
          {loading ? "Reading your pattern..." : "Discover My Element — It's Free"}
        </button>

        <p className="quiz-disclaimer">
          No account required · Results in 60 seconds · Used by 50,000+ people
        </p>
      </form>
    </div>
  );
}
