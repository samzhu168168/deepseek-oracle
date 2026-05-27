/** About page — trust & authority signal for E-E-A-T and conversions */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function AboutPage() {
  return (
    <div className="landing-page fade-in" style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <Helmet>
        <title>About Elemental Bond — Ancient BaZi Wisdom for Modern Relationships</title>
        <meta name="description" content="Elemental Bond brings 2,000-year-old BaZi wisdom to modern relationship questions. No AI fluff. No generic horoscopes. Your birth chart holds the pattern." />
        <meta property="og:title" content="About Elemental Bond — Ancient BaZi Wisdom for Modern Relationships" />
        <meta property="og:description" content="Elemental Bond brings 2,000-year-old BaZi wisdom to modern relationship questions. Your birth chart holds the pattern." />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Elemental Bond",
          "description": "Elemental Bond brings 2,000-year-old BaZi wisdom to modern relationship questions.",
          "url": `${SITE_URL}/about`,
        })}</script>
      </Helmet>

      <section className="oracle-hero" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="oracle-symbol-hero">◈</div>
        <h1 className="oracle-hero-title">About Elemental Bond</h1>
        <p className="oracle-hero-subtitle">
          Why we built a modern oracle on a 2,000-year-old foundation
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section__title">The Problem We Saw</h2>
        <p className="about-section__text">
          Most relationship advice is generic. "Communicate better." "Set boundaries."
          But you've tried that — and the same patterns keep repeating.
        </p>
        <p className="about-section__text">
          Western astrology tells you your sun sign. Personality tests tell you your type.
          But neither answers the real question:{" "}
          <em>"Why do I keep attracting the same dynamic, with different people?"</em>
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section__title">Our Approach</h2>
        <p className="about-section__text">
          BaZi (八字) — also known as the Four Pillars of Destiny — is a Chinese metaphysical system
          that maps your birth data onto a complete elemental blueprint. It's been used for over 2,000 years
          to understand personality, relationships, career timing, and life patterns.
        </p>
        <p className="about-section__text">
          Elemental Bond applies this system specifically to relationships and compatibility.
          We combine traditional BaZi calculation methods with modern AI analysis to deliver
          readings that are both authentic and accessible.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-section__title">Why It Works</h2>
        <div className="about-section__list">
          <div className="about-section__item">
            <strong>Not AI-generated fluff.</strong> Your reading is based on real BaZi
            calculation — the Four Pillars, Five Element balance, and generative/controlling cycles.
          </div>
          <div className="about-section__item">
            <strong>Specific to YOU.</strong> Your birth date, time, and gender produce a unique chart.
            No two people get the same reading.
          </div>
          <div className="about-section__item">
            <strong>Timing matters.</strong> 2026 is a Yi Wood Snake year (乙巳年) — a powerful
            window for relationship transformation. Our readings include this timing.
          </div>
          <div className="about-section__item">
            <strong>Free to start.</strong> Your initial compatibility reading is free.
            No account needed. No credit card.
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section__title">What People Say</h2>
        <div className="about-testimonials">
          <div className="about-testimonial">
            <p className="about-testimonial__text">
              "It felt like a mirror to our real dynamic — eerily precise and deeply grounding."
            </p>
            <p className="about-testimonial__author">— M.L., Seattle</p>
          </div>
          <div className="about-testimonial">
            <p className="about-testimonial__text">
              "The 2026 window timing was the exact clarity I needed to plan our next steps."
            </p>
            <p className="about-testimonial__author">— J.K., Toronto</p>
          </div>
          <div className="about-testimonial">
            <p className="about-testimonial__text">
              "I finally understood the hidden pattern behind our push-pull cycle."
            </p>
            <p className="about-testimonial__author">— A.R., Singapore</p>
          </div>
        </div>
      </section>

      <section className="about-section" style={{ textAlign: "center" }}>
        <h2 className="about-section__title">Ready to Discover Your Pattern?</h2>
        <p className="about-section__text">
          Two birth dates. One pattern revealed. Free.
        </p>
        <Link to="/" className="oracle-button oracle-cta-button" style={{ display: "inline-block", marginTop: "16px" }}>
          Start Your Free Reading →
        </Link>
      </section>
    </div>
  );
}
