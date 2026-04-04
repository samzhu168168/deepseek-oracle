import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { analyzeBond } from "../api";
import { NaoNaiAvatar } from "../components/NaoNaiAvatar";
import { TypingAnimation } from "../components/TypingAnimation";
import { NaoNaiInputGuide } from "../components/NaoNaiInputGuide";
import "../styles/naonai-home.css";

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
const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

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

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elemental Bond",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "An advanced astrological compatibility calculator merging ancient BaZi, five elements, and modern relationship dynamics to decode karmic bonds.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does BaZi compatibility work?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "BaZi compatibility compares the five-element balance and timing of two birth charts to reveal harmony, tension, and growth potential.",
        },
      },
      {
        "@type": "Question",
        name: "What is a karmic bond?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "A karmic bond describes a connection shaped by past-life lessons, often felt as intense attraction, challenge, and mutual evolution.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an exact birth time?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Exact time improves precision, but the calculator still delivers meaningful insights using birth date and core elemental patterns.",
        },
      },
    ],
  };

  const [showWelcome, setShowWelcome] = useState(true);
  const welcomeMessage = "孩子们，来让奶奶看看你们的缘分吧... 我看了60年的八字，从来没看错过。";

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>Nǎi Nai 的八字姻缘测算 — 60年经验老师傅</title>
        <meta
          name="description"
          content="让精通八字60年的Nǎi Nai为你解读姻缘。温暖、智慧、准确的中国传统命理分析。"
        />
        <meta
          name="keywords"
          content="八字合婚, 姻缘测算, 中国命理, 生辰八字, 婚姻配对, bazi compatibility"
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="Nǎi Nai 的八字姻缘测算 — 60年经验老师傅" />
        <meta
          property="og:description"
          content="让精通八字60年的Nǎi Nai为你解读姻缘。温暖、智慧、准确的中国传统命理分析。"
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nǎi Nai 的八字姻缘测算 — 60年经验老师傅" />
        <meta
          name="twitter:description"
          content="让精通八字60年的Nǎi Nai为你解读姻缘。温暖、智慧、准确的中国传统命理分析。"
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      
      {/* Nǎi Nai 头像和欢迎语 */}
      <section className="bond-hero naonai-hero">
        <NaoNaiAvatar size="large" showTitle={true} />
        {showWelcome && (
          <div className="naonai-welcome" style={{ 
            marginTop: '2rem', 
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '2rem auto'
          }}>
            <TypingAnimation 
              text={welcomeMessage}
              speed={60}
              onComplete={() => setTimeout(() => setShowWelcome(false), 2000)}
            />
          </div>
        )}
      </section>

      <form className="bond-form naonai-form" onSubmit={onSubmit}>
        <div className="bond-form__columns">
          <section className="bond-form__panel naonai-card">
            <NaoNaiInputGuide text="告诉奶奶，你的生辰八字是..." />
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-a-date">出生日期</label>
                <input
                  id="person-a-date"
                  type="date"
                  className="naonai-input"
                  value={personA.date}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-time">出生时辰</label>
                <input
                  id="person-a-time"
                  type="time"
                  className="naonai-input"
                  value={personA.time}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="不知道可以不填"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-a-gender">性别</label>
                <select
                  id="person-a-gender"
                  className="naonai-input"
                  value={personA.gender}
                  onChange={(event) => setPersonA((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">男</option>
                  <option value="Female">女</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bond-form__panel naonai-card">
            <NaoNaiInputGuide text="还有你心爱的人，他/她的生辰是..." />
            <div className="bond-form__fields">
              <div className="field">
                <label className="field__label" htmlFor="person-b-date">出生日期</label>
                <input
                  id="person-b-date"
                  type="date"
                  className="naonai-input"
                  value={personB.date}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-time">出生时辰</label>
                <input
                  id="person-b-time"
                  type="time"
                  className="naonai-input"
                  value={personB.time}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="不知道可以不填"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="person-b-gender">性别</label>
                <select
                  id="person-b-gender"
                  className="naonai-input"
                  value={personB.gender}
                  onChange={(event) => setPersonB((prev) => ({ ...prev, gender: event.target.value as "Male" | "Female" }))}
                >
                  <option value="Male">男</option>
                  <option value="Female">女</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? (
          <div className="naonai-loading">
            <span className="naonai-loading-icon">🔮</span>
            <p className="bond-form__loading-text">{LOADING_MESSAGES[loadingMessageIndex]}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--naonai-text-muted)', marginTop: '0.5rem' }}>
              奶奶正在仔细看你们的命盘...
            </p>
          </div>
        ) : null}

        <button type="submit" className="naonai-button naonai-cta-button" disabled={loading}>
          {loading ? "奶奶正在看命盘中..." : "✨ Let Nǎi Nai Read Our Destiny"}
        </button>
      </form>
      <section className="landing-footnote">
        <details>
          <summary>FAQ: BaZi Compatibility</summary>
          <p>How does BaZi compatibility work?</p>
          <p>BaZi compatibility compares the five-element balance and timing of two birth charts to reveal harmony, tension, and growth potential.</p>
          <p>What is a karmic bond?</p>
          <p>A karmic bond describes a connection shaped by past-life lessons, often felt as intense attraction, challenge, and mutual evolution.</p>
          <p>Do I need an exact birth time?</p>
          <p>Exact time improves precision, but the calculator still delivers meaningful insights using birth date and core elemental patterns.</p>
        </details>
      </section>
    </div>
  );
}
