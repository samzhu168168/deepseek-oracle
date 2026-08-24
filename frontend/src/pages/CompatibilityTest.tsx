import { FormEvent, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { FullReport } from "../components/FullReport";
import { LicenseKeyModal, type FullReportData } from "../components/LicenseKeyModal";
import { calculateElementProfile, getRelationshipSummary, type ElementProfile } from "../utils/elementProfile";
import { trackFunnelEvent } from "../utils/analytics";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const GUMROAD_URL = "https://samzhu168.gumroad.com/l/decode-this-connection";
const CONNECTION_PROFILE_KEY = "bond:connection_profile";
const CONNECTION_DRAFT_KEY = "bond:connection_draft";
const CONNECTION_SCORE = 75;

export default function CompatibilityTestPage() {
  const [first, setFirst] = useState<ElementProfile | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [second, setSecond] = useState<ElementProfile | null>(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [fullReport, setFullReport] = useState<FullReportData | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONNECTION_PROFILE_KEY)
      || window.sessionStorage.getItem("bond:free_profile");
    if (!saved) return;
    try { setFirst(JSON.parse(saved) as ElementProfile); } catch { window.sessionStorage.removeItem("bond:free_profile"); }
    const draft = window.localStorage.getItem(CONNECTION_DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as { first?: ElementProfile; second?: ElementProfile };
        if (parsed.first?.birthDate) setFirst(parsed.first);
        if (parsed.second?.birthDate) {
          setSecond(parsed.second);
          setDate(parsed.second.birthDate);
          setTime(parsed.second.birthTime || "");
          setPlace(parsed.second.birthPlace || "");
        }
      } catch { window.localStorage.removeItem(CONNECTION_DRAFT_KEY); }
    }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSecond = calculateElementProfile(date, time, place);
    setSecond(nextSecond);
    if (first?.birthDate) {
      window.localStorage.setItem(CONNECTION_DRAFT_KEY, JSON.stringify({ first, second: nextSecond }));
    }
    trackFunnelEvent("compatibility_start", { element_pair: `${first?.element || "unknown"}-${nextSecond.element}`, cta_location: "compatibility_form" });
  };

  useEffect(() => {
    if (first && second) trackFunnelEvent("paywall_view", { element_pair: `${first.element}-${second.element}` });
  }, [first, second]);

  const join = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiBase = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "");
    fetch(`${apiBase}/api/email-capture`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "subscription_waitlist" }) }).catch(() => {});
    setJoined(true);
  };

  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: "Decode This Connection",
    description: "A Personal Five-Element Relationship Reading.",
    brand: { "@type": "Brand", name: "Elemental Bond" },
    offers: { "@type": "Offer", price: "14.90", priceCurrency: "USD", availability: "https://schema.org/InStock", url: GUMROAD_URL },
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
          <article className="paywall-card"><p className="paywall-badge">ONE READING · AVAILABLE NOW</p><h3>Decode This Connection</h3><p>A Personal Five-Element Relationship Reading</p><p className="paywall-price">$14.90 USD <span>one time</span></p><a className="oracle-button" href={GUMROAD_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackFunnelEvent("checkout_start", { element_pair: `${first.element}-${second.element}`, cta_location: "compatibility_paywall" })}>Decode This Connection — $14.90 USD</a><p className="paywall-disclosure">Checkout is handled by Gumroad. It may show a local-currency equivalent.</p><button className="text-button" type="button" onClick={() => setLicenseModalOpen(true)}>Already purchased? Unlock Your Reading</button></article>
        </div>
        {fullReport && <FullReport data={fullReport} elementPair={`${first.element}-${second.element}`} score={CONNECTION_SCORE} />}
      </section>}
      <LicenseKeyModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        onSuccess={(data) => {
          if ("fullAnalysis" in data) setFullReport(data);
          setLicenseModalOpen(false);
        }}
        resultPayload={first && second && first.birthDate ? {
          person1: { date: first.birthDate, time: first.birthTime, gender: "Unknown" },
          person2: { date: second.birthDate, time: second.birthTime, gender: "Unknown" },
          score: CONNECTION_SCORE,
          elementPair: `${first.element}-${second.element}`,
        } : undefined}
      />
    </div>
  );
}
