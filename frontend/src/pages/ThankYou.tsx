import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function ThankYouPage() {
  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>You're In — Your 2026 Snake Year Love Forecast | Elemental Bond</title>
        <meta name="description" content="Your free 2026 Snake Year Love Forecast is on its way." />
        <link rel="canonical" href={`${SITE_URL}/thank-you`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="bond-hero oracle-hero" style={{ minHeight: "60vh", justifyContent: "center" }}>
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title" style={{ fontSize: "clamp(1.6rem, 5vw, 2.8rem)" }}>
          You're in.
        </h1>
        <div className="hero-divider" />
        <p className="oracle-hero-subtitle" style={{ maxWidth: "480px", textAlign: "center" }}>
          Your <strong>2026 Snake Year Love Forecast</strong> is on its way to your inbox.
          Check your spam folder if it doesn't arrive within a few minutes.
        </p>
        <p className="hero-explainer" style={{ maxWidth: "420px", textAlign: "center" }}>
          While you wait — see what the Oracle reveals about your elemental bond.
          Enter two birth dates for an instant reading.
        </p>
        <Link to="/" className="oracle-button oracle-cta-button" style={{ marginTop: "1.5rem" }}>
          Get My Free BaZi Reading →
        </Link>
      </section>
    </div>
  );
}
