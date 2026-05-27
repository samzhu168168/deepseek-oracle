/** ElementQuiz — Quick single-person element finder
 *  "Not in a relationship? Find your own element first."
 *  Uses existing /api/divination/bazi endpoint with localStorage cache.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getElementReading } from "../api";

const QUIZ_CACHE_KEY = "element_quiz_cache";

type QuizState = "form" | "loading" | "result" | "error";

interface QuizResult {
  dayMaster: string;
  element: string;
  summary: string;
}

function readCache(): Record<string, QuizResult> {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(key: string, result: QuizResult) {
  try {
    const cache = readCache();
    cache[key] = result;
    // Keep cache under 50 entries
    const entries = Object.entries(cache);
    if (entries.length > 50) {
      const trimmed = Object.fromEntries(entries.slice(-50));
      localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(QUIZ_CACHE_KEY, JSON.stringify(cache));
    }
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function ElementQuiz() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [state, setState] = useState<QuizState>("form");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Birth date is required");
      return;
    }

    // Check cache first
    const cacheKey = `${date}-${gender}`;
    const cache = readCache();
    const cached = cache[cacheKey];
    if (cached) {
      setResult(cached);
      setState("result");
      return;
    }

    setState("loading");
    setError("");

    try {
      const data = await getElementReading({ date, gender });
      if (!data.success) {
        setState("error");
        setError(data.error || "Reading failed. Please try again.");
        return;
      }
      const reading = data.reading;
      // Extract element type from dayMaster field
      const dmText = reading.dayMaster || reading.summary || "";
      const elementMatch = dmText.match(/\b(Wood|Fire|Earth|Metal|Water)\b/i);
      const element = elementMatch ? elementMatch[1].toLowerCase() : "";
      const quizResult: QuizResult = {
        dayMaster: dmText.split(".")[0] || dmText.slice(0, 100),
        element,
        summary: reading.summary || dmText,
      };
      setResult(quizResult);
      writeCache(cacheKey, quizResult);
      setState("result");
    } catch {
      setState("error");
      setError("Network error. Please check your connection.");
    }
  };

  const handleGoToFullReading = () => {
    navigate("/bazi");
  };

  const handleGoToElementPage = () => {
    if (result?.element) {
      navigate(`/elements/${result.element}`);
    }
  };

  const resultElement = result?.element || "";

  return (
    <div className="element-quiz">
      <div className="element-quiz__header">
        <span className="oracle-symbol" aria-hidden="true">◈</span>
        <p className="element-quiz__title">Not in a relationship? Find Your Own Element First</p>
      </div>

      {state === "form" && (
        <form onSubmit={handleSubmit} className="element-quiz__form">
          <div className="element-quiz__fields">
            <div className="field">
              <label className="field__label" htmlFor="quiz-date">Your Birth Date</label>
              <input
                id="quiz-date"
                type="date"
                className="oracle-input"
                value={date}
                onChange={(e) => { setDate(e.target.value); setError(""); }}
                required
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="quiz-gender">Gender</label>
              <select
                id="quiz-gender"
                className="oracle-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as "Male" | "Female")}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="oracle-button oracle-cta-button element-quiz__submit">
            Find My Element
          </button>
          <p className="element-quiz__disclaimer">
            Free preview. No account needed.
          </p>
        </form>
      )}

      {state === "loading" && (
        <div className="oracle-loading" style={{ padding: "var(--space-lg)" }}>
          <span className="oracle-loading-icon">◈</span>
          <p style={{ fontSize: "14px", color: "var(--oracle-text-muted)", marginTop: "8px" }}>
            Reading your elemental pattern...
          </p>
        </div>
      )}

      {state === "result" && result && (
        <div className="element-quiz__result">
          <div className="element-quiz__result-badge" data-element={resultElement}>
            <span className="element-quiz__result-icon">
              {resultElement === "wood" ? "🌱" : resultElement === "fire" ? "🔥" : resultElement === "earth" ? "⛰️" : resultElement === "metal" ? "⚔️" : "🌊"}
            </span>
            <p className="element-quiz__result-label">Your Element</p>
            <p className="element-quiz__result-value">
              {resultElement.charAt(0).toUpperCase() + resultElement.slice(1)}
            </p>
          </div>
          <p className="element-quiz__result-dm">
            {result.dayMaster}
          </p>
          <p className="element-quiz__result-hint">
            This is just a preview of your Day Master. Want the full picture?
          </p>
          <button
            type="button"
            className="oracle-button oracle-cta-button"
            onClick={handleGoToFullReading}
            style={{ marginTop: "var(--space-md)" }}
          >
            Get Your Complete Reading →
          </button>
          {resultElement && (
            <button
              type="button"
              className="oracle-button oracle-button--secondary"
              onClick={handleGoToElementPage}
              style={{ marginTop: "var(--space-sm)" }}
            >
              Learn About {resultElement.charAt(0).toUpperCase() + resultElement.slice(1)} Element →
            </button>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="element-quiz__error">
          <p className="error-text">{error}</p>
          <button
            type="button"
            className="oracle-button oracle-button--secondary"
            onClick={() => setState("form")}
            style={{ marginTop: "var(--space-sm)" }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
