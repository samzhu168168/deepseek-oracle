import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");

export default function MethodologyPage() {
  const canonical = `${SITE_URL}/methodology`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Elemental Bond Methodology",
    description: "How Elemental Bond creates its free Five Elements relationship reflection, what data it uses, its limitations, and where AI is used.",
    url: canonical,
  };

  return (
    <div className="funnel-page content-page methodology-page" data-prerender-ready="methodology">
      <Helmet>
        <title>How Elemental Bond Works — Methodology and Limitations</title>
        <meta name="description" content="How does Elemental Bond create a free relationship pattern reading? See the data used, deterministic element mapping, Five Elements lens, AI boundary, privacy, and limitations." />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <header>
        <p className="funnel-eyebrow">Methodology</p>
        <h1>How Elemental Bond works</h1>
        <p className="extract-summary">Elemental Bond uses BaZi and the Five Elements as a symbolic framework for self-reflection, not as a scientific or psychological diagnostic tool. The free reading is a simplified, deterministic experience designed to turn an element label into practical relationship questions.</p>
      </header>

      <section><h2>What Elemental Bond Is</h2><p>Elemental Bond is a relationship reflection product. It uses selected ideas and vocabulary from the Chinese Five Elements tradition to help users notice patterns such as pursuing clarity, carrying emotional work, seeking intensity, protecting boundaries, or interpreting unspoken signals.</p></section>
      <section><h2>How the Free Reading Works</h2><p>The free reading runs locally in the browser. A deterministic calculation maps the entered birth date to one of five simplified element profiles: Wood, Fire, Earth, Metal, or Water. That element selects a fixed relationship reflection covering a pattern, a hidden need, a possible chemistry trap, and three observations.</p><p>The same input produces the same result. The free result does not use randomness, call an AI model, or generate a complete Four Pillars chart.</p></section>
      <section><h2>What Information Is Used</h2><p>A birth date is required. Birth time and place are optional fields retained for context in the current browser session. They do not make the free emotional layer a clinical or scientific assessment, and the first release does not claim hour-level BaZi precision.</p></section>
      <section><h2>How the Five Elements Are Used</h2><p>The Five Elements are used as a symbolic vocabulary. Wood is framed around growth, Fire around intensity, Earth around stability, Metal around clarity, and Water around emotional subtext. These lenses are prompts for comparison with lived experience, not fixed descriptions of identity.</p></section>
      <section><h2>How Relationship Patterns Are Written</h2><p>The relationship content is editorial. It uses cautious language such as “may,” “can,” and “you may notice” because an element result cannot establish a person's motives, attachment style, trauma history, compatibility, or future outcome.</p></section>
      <section><h2>How AI Is — and Isn't — Used</h2><p>The free core-element and emotional reflection do not require an AI runtime call. Some separate, paid report functionality may use generative AI to expand a reading. When it does, AI-generated interpretation should still be treated as reflective content rather than verified psychological fact or prediction.</p></section>
      <section><h2>Reflection vs Prediction</h2><p>The product does not determine whether someone should stay, leave, reconcile, or make a major life decision. It offers questions to observe: Is communication direct? Is effort reciprocal? Do words and behavior align? Can boundaries and uncertainty be discussed?</p></section>
      <section><h2>Limitations</h2><p>The free element mapping is deliberately simplified and is not equivalent to a professional BaZi consultation or full Four Pillars calculation. Elemental Bond has no independent evidence proving diagnostic accuracy or relationship prediction. It should not replace mental-health, medical, legal, financial, or safety support.</p></section>
      <section><h2>Privacy</h2><p>The free profile is stored in session storage so it can continue into the compatibility flow. Analytics events are limited to non-sensitive labels such as page slug, element, element pair, and CTA location. They must not contain complete birth details, names, relationship text, location, or email.</p></section>

      <section className="geo-reading-cta"><h2>Try the free reflection</h2><p>Use your birth date to see the relationship pattern associated with your simplified element lens.</p><Link className="oracle-button oracle-cta-button" to="/">Discover Your Relationship Pattern</Link></section>
    </div>
  );
}
