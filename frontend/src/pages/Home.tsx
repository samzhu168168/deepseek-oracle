import { FormEvent, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { calculateElementProfile, type ElementProfile } from "../utils/elementProfile";
import { getEmotionalInsight } from "../utils/emotionalInsights";
import { trackFunnelEvent } from "../utils/analytics";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const PROFILE_KEY = "bond:free_profile";

export default function HomePage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [profile, setProfile] = useState<ElementProfile | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(PROFILE_KEY);
    if (!saved) return;
    try {
      setProfile(JSON.parse(saved) as ElementProfile);
    } catch {
      window.sessionStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  const revealProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date) return;
    const nextProfile = calculateElementProfile(date, time, place);
    window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify({ ...nextProfile, birthDate: "", birthTime: "", birthPlace: "" }));
    setProfile(nextProfile);
    trackFunnelEvent("reading_complete", { element: nextProfile.element });
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!window.sessionStorage.getItem("bond:email_prompt_seen")) {
        window.sessionStorage.setItem("bond:email_prompt_seen", "1");
        setEmailOpen(true);
      }
    }, 80);
  };

  const captureEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) return;
    setEmailState("sending");
    try {
      const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");
      const response = await fetch(`${apiBase}/api/email-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "single_profile_optional" }),
      });
      if (!response.ok) throw new Error("capture failed");
      setEmailState("sent");
    } catch {
      setEmailState("error");
    }
  };

  const faq = [
    ["What is a five-element personality reading?", "It maps a birth date to one of the five element patterns used in Chinese metaphysical traditions: Wood, Fire, Earth, Metal, or Water. This free result is a simplified pattern reading, not a complete Four Pillars chart."],
    ["Do I need my exact birth time?", "No. A birth date is enough for the free core reading. Adding a known birth time and place preserves more context for later, more detailed readings."],
    ["Is this a scientific personality test?", "No. BaZi is a traditional interpretive system, not a scientifically validated psychological assessment. Elemental Bond presents it as a reflection tool rather than a factual prediction."],
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const emotionalInsight = profile ? getEmotionalInsight(profile.element) : null;

  return (
    <div className="funnel-page fade-in">
      <Helmet>
        <title>Five-Element Personality Test — Free BaZi-Inspired Reading</title>
        <meta name="description" content="What does your birth date suggest about your relationship patterns? Get a free five-element personality reading without creating an account." />
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <section className="funnel-hero bond-hero">
        <p className="funnel-eyebrow">A BaZi-inspired pattern reading</p>
        <h1>Your birth date already knows why some relationships feel effortless — and others don't.</h1>
        <p>I didn't believe in this either. Then I ran the pattern against my own relationships.</p>
        <form className="funnel-form" onSubmit={revealProfile}>
          <label>Birth date <span>required</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label>Birth time <span>optional — greater accuracy when known</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
          <label>Birth place <span>optional</span><input type="text" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="City, country" maxLength={120} /></label>
          <button className="oracle-button oracle-cta-button" type="submit">Reveal My Core Element — Free</button>
          <p className="funnel-fineprint">No email or account required. Result appears instantly.</p>
        </form>
      </section>

      {profile && emotionalInsight && (
        <section ref={resultRef} className="funnel-result" aria-live="polite">
          <header className="emotional-result__hero">
            <p className="funnel-eyebrow">Your Relationship Pattern · {profile.element} lens</p>
            <h2>{emotionalInsight.patternTitle}</h2>
            <p>{emotionalInsight.patternSummary}</p>
          </header>

          <section className="emotional-result__section">
            <h3>Why This Feels Familiar</h3>
            <p>You may notice that you...</p>
            <ul className="emotional-observation-list">
              {emotionalInsight.familiarPattern.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="emotional-screenshot-card emotional-screenshot-card--need" aria-label="What you actually need">
            <p className="funnel-eyebrow">What You Actually Need</p>
            <h3>{emotionalInsight.hiddenNeed.label}</h3>
            <p>{emotionalInsight.hiddenNeed.explanation}</p>
            <span>Elemental Bond · relationship reflection</span>
          </section>

          <section className="emotional-screenshot-card emotional-screenshot-card--chemistry" aria-label="What you may mistake for chemistry">
            <p className="funnel-eyebrow">What You May Mistake for Chemistry</p>
            <h3>{emotionalInsight.chemistryTrap.headline}</h3>
            <p>{emotionalInsight.chemistryTrap.explanation}</p>
            <span>Elemental Bond · relationship reflection</span>
          </section>

          <section className="emotional-result__section emotional-element-lens">
            <p className="funnel-eyebrow">Your Elemental Lens</p>
            <h3>You are {profile.element}-dominant.</h3>
            <div className="funnel-result__copy">{profile.description.map((line) => <p key={line}>{line}</p>)}</div>
            <p className="emotional-lens-note">Five Elements is used here as a symbolic reflection lens, not as a psychological diagnosis or scientific prediction.</p>
          </section>

          <section className="emotional-result__section">
            <h3>What To Notice Next</h3>
            <ol className="emotional-next-list">
              {emotionalInsight.nextMove.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>

          <div className="decode-connection">
            <p className="funnel-eyebrow">Decode This Connection</p>
            <h3>See why this relationship feels the way it does.</h3>
            <p>Add their birth date to compare your two elemental patterns.</p>
            <Link
              className="oracle-button oracle-cta-button funnel-primary-link"
              to="/compatibility"
              onClick={() => trackFunnelEvent("compatibility_start", { element: profile.element, cta_location: "free_result" })}
            >
              Decode This Connection
            </Link>
          </div>
        </section>
      )}

      <section className="funnel-faq">
        <h2>Questions about the five-element reading</h2>
        {faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        <Link to="/faq">Read the full FAQ</Link>
      </section>

      {emailOpen && (
        <div className="optional-email" role="dialog" aria-modal="true" aria-labelledby="email-title">
          <button className="optional-email__backdrop" aria-label="Close" onClick={() => setEmailOpen(false)} />
          <div className="optional-email__panel">
            <button className="optional-email__close" onClick={() => setEmailOpen(false)} aria-label="Close">×</button>
            <h2 id="email-title">Want to keep this result?</h2>
            <p>Email is optional. Leave it only if you want product and timing updates.</p>
            {emailState === "sent" ? <p>Saved. You can continue to your reading.</p> : (
              <form onSubmit={captureEmail}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" maxLength={254} required /><button className="oracle-button" disabled={emailState === "sending"}>{emailState === "sending" ? "Saving..." : "Save My Result"}</button></form>
            )}
            {emailState === "error" && <p className="error-text">Could not save your email. You can close this and continue.</p>}
            <button className="text-button" onClick={() => setEmailOpen(false)}>Continue without email</button>
          </div>
        </div>
      )}
    </div>
  );
}
