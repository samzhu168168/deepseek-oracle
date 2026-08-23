import { FormEvent, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { calculateElementProfile, type ElementProfile } from "../utils/elementProfile";

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

      {profile && (
        <section ref={resultRef} className="funnel-result" aria-live="polite">
          <p className="funnel-eyebrow">Your core pattern</p>
          <h2>You are {profile.element}-dominant.</h2>
          <div className="funnel-result__copy">{profile.description.map((line) => <p key={line}>{line}</p>)}</div>
          <p className="funnel-surface">This is just the surface reading. Your full chart — including how you handle conflict, what drains you, and what you're naturally drawn to — is below.</p>
          <div className="locked-preview" aria-label="Full reading preview">
            <p>THE FULL VERSION INCLUDES</p>
            <div>Core emotional operating system</div><div>Conflict and repair pattern</div><div>What drains and restores you</div><div>Relationship timing overview</div>
          </div>
          <Link className="oracle-button oracle-cta-button funnel-primary-link" to="/compatibility">See How You Match With Someone</Link>
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
