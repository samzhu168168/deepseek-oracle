import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { analyzeBond } from "../api";
import { InkButton } from "../components/InkButton";

type PersonInput = {
  date: string;
  time: string;
  gender: "Male" | "Female";
};

const createInitialPerson = (gender: "Male" | "Female"): PersonInput => ({
  date: "",
  time: "",
  gender,
});

const LOADING_MESSAGES = [
  "Scanning elemental frequencies...",
  "Calculating karmic resonance...",
  "Mapping your 2026 activation windows...",
  "Decoding the hidden bond pattern...",
  "Preparing your Soul Blueprint...",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [personA, setPersonA] = useState<PersonInput>(() => createInitialPerson("Male"));
  const [personB, setPersonB] = useState<PersonInput>(() => createInitialPerson("Female"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`, { method: "GET" }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    if (!personA.date) {
      setError("Person A: Birth date is required.");
      return;
    }
    if (!personB.date) {
      setError("Person B: Birth date is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        person_a: {
          date: personA.date,
          time: personA.time,
          gender: personA.gender,
        },
        person_b: {
          date: personB.date,
          time: personB.time,
          gender: personB.gender,
        },
      };
      const response = await analyzeBond(payload);
      const report = response?.data ?? response?.report ?? response;
      if (!report) {
        throw new Error("Analysis result is empty.");
      }
      const stored = {
        payload,
        report,
      };
      window.sessionStorage.setItem("bond:last_report", JSON.stringify(stored));
      navigate("/result", { state: stored });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        "请求超时，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page fade-in">
      <section className="bond-hero">
        <h1 className="bond-hero__title">Elemental Bond</h1>
        <p className="bond-hero__subtitle">Ancient Chinese Astrology Meets Modern Relationship Science</p>
      </section>

      <form className="bond-form" onSubmit={onSubmit}>
        <div className="bond-form__columns">
          <section className="bond-form__panel">
            <p className="bond-form__label">YOU</p>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-a-date">Birth Date</label>
                <input
                  id="person-a-date"
                  type="date"
                  value={personA.date}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-time">Birth Time</label>
                <input
                  id="person-a-time"
                  type="time"
                  value={personA.time}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Unknown? Leave blank"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-gender">Gender</label>
                <select
                  id="person-a-gender"
                  value={personA.gender}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bond-form__panel">
            <p className="bond-form__label">YOUR PERSON</p>
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-b-date">Birth Date</label>
                <input
                  id="person-b-date"
                  type="date"
                  value={personB.date}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-time">Birth Time</label>
                <input
                  id="person-b-time"
                  type="time"
                  value={personB.time}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="Unknown? Leave blank"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-gender">Gender</label>
                <select
                  id="person-b-gender"
                  value={personB.gender}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p className="bond-form__loading-text">{LOADING_MESSAGES[loadingMessageIndex]}</p> : null}

        <InkButton type="submit" full className="bond-submit" disabled={loading}>
          {loading ? "正在分析中，请稍候（约30-60秒）..." : "✦ Reveal Our Destiny ✦"}
        </InkButton>
      </form>
    </div>
  );
}
