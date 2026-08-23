import { FormEvent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { calculateElementProfile, getRelationshipSummary, type ElementProfile } from "../utils/elementProfile";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const GUMROAD_URL = "https://samzhu168.gumroad.com/l/bhpmxr?wanted=true";

export default function CompatibilityTestPage() {
  const [first, setFirst] = useState<ElementProfile | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [second, setSecond] = useState<ElementProfile | null>(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("bond:free_profile");
    if (!saved) return;
    try { setFirst(JSON.parse(saved) as ElementProfile); } catch { window.sessionStorage.removeItem("bond:free_profile"); }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSecond(calculateElementProfile(date, time, place));
  };

  const join = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");
    fetch(`${apiBase}/api/email-capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "subscription_waitlist" }) }).catch(() => {});
    setJoined(true);
  };

  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: "Elemental Bond Full Compatibility Report",
    description: "A one-time full five-element relationship compatibility report.",
    brand: { "@type": "Brand", name: "Elemental Bond" },
    offers: { "@type": "Offer", price: "24.90", priceCurrency: "USD", availability: "https://schema.org/InStock", url: GUMROAD_URL },
  };

  if (!first) return <div className="funnel-page compact-page"><Helmet><title>BaZi Compatibility Test — Free Relationship Preview</title><link rel="canonical" href={`${SITE_URL}/compatibility`} /></Helmet><p className="funnel-eyebrow">Compatibility preview</p><h1>Enter their birth date.</h1><p>First, complete your own free core-element reading. Then this page opens the other person's birth-date, optional time, and optional place form for the relationship comparison.</p><Link className="oracle-button" to="/">Get My Free Core Reading</Link></div>;

  return (
    <div className="funnel-page compact-page">
      <Helmet><title>BaZi Compatibility Test — Free Five-Element Relationship Preview</title><meta name="description" content="Enter another birth date to see a free five-element relationship dynamic, then choose whether to unlock the full report." /><link rel="canonical" href={`${SITE_URL}/compatibility`} /><script type="application/ld+json">{JSON.stringify(productJsonLd)}</script></Helmet>
      <p className="funnel-eyebrow">Compatibility preview</p><h1>Enter their birth date.</h1><p>No names needed, no judgment — just the pattern. Your saved core element is <strong>{first.element}</strong>.</p>
      <form className="funnel-form" onSubmit={submit}>
        <label>Their birth date <span>required</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label>Their birth time <span>optional</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
        <label>Their birth place <span>optional</span><input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="City, country" maxLength={120} /></label>
        <button className="oracle-button oracle-cta-button">Reveal the Relationship Pattern</button>
      </form>
      {second && <section className="compatibility-preview" aria-live="polite"><p className="funnel-eyebrow">Free preview · {first.element} + {second.element}</p><h2>Your relationship dynamic</h2><p>{getRelationshipSummary(first.element, second.element)}</p>
        <div className="paywall-grid">
          <article className="paywall-card paywall-card--primary"><p className="paywall-badge">PRIMARY OPTION · EARLY ACCESS</p><h3>Relationship Timing Membership</h3><p>Full compatibility report, monthly timing updates, saved comparisons, and history when membership launches.</p><p className="paywall-disclosure">No charge today. Final monthly price will be shown before any billing begins.</p>{joined ? <p>You're on the early-access list.</p> : <form className="waitlist-form" onSubmit={join}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for launch access" maxLength={254} required /><button className="oracle-button">Join Early Access</button></form>}</article>
          <article className="paywall-card"><p className="paywall-badge">ONE REPORT · AVAILABLE NOW</p><h3>Full Compatibility Report</h3><p className="paywall-price">$24.90 USD <span>one time</span></p><p>Choose this only if you want one complete report without a membership.</p><a className="oracle-button" href={GUMROAD_URL} target="_blank" rel="noopener noreferrer">Buy One Report — $24.90 USD</a><p className="paywall-disclosure">Checkout is handled by Gumroad. It may show a local-currency equivalent.</p></article>
        </div>
      </section>}
    </div>
  );
}
