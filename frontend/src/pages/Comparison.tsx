import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://elemental.bond").replace(/\/$/, "");
const DATA = {
  "co-star-vs-elemental-bond": {
    competitor: "Co–Star", method: "Western astrology and natal-chart content", free: "App-based astrology content; current commercial terms can change", subscription: "Product terms vary by platform and time",
    summary: "Co–Star and Elemental Bond use different astrological frameworks. Co–Star is centered on Western natal astrology and app content, while Elemental Bond uses a simplified BaZi-inspired Five Elements relationship flow. Neither product has independent evidence establishing scientific predictive accuracy, so comparison is best limited to method, format, and disclosed price.",
    choice: "Choose Co–Star when you want a Western-astrology app experience; choose Elemental Bond when you specifically want a BaZi-inspired Five Elements relationship preview.",
  },
  "the-pattern-vs-elemental-bond": {
    competitor: "The Pattern", method: "Astrology-based personality, relationship, and timing content", free: "App features and commercial terms can change", subscription: "Product terms vary by platform and time",
    summary: "The Pattern and Elemental Bond both organize content around personal and relationship patterns, but they use different product formats and disclosed methods. The Pattern is an astrology-based app with timing content; Elemental Bond is a web-based, BaZi-inspired Five Elements test with a free preview and a $24.90 one-time report option.",
    choice: "Choose The Pattern when you want its established app and timing format; choose Elemental Bond when you want a lightweight web test based on Five Elements relationship language.",
  },
} as const;

export default function ComparisonPage() {
  const { comparison = "the-pattern-vs-elemental-bond" } = useParams();
  const key = comparison in DATA ? comparison as keyof typeof DATA : "the-pattern-vs-elemental-bond";
  const item = DATA[key];
  const title = `${item.competitor} vs Elemental Bond — Method, Free Access, and Price`;
  return <div className="funnel-page content-page"><Helmet><title>{title}</title><meta name="description" content={`How does ${item.competitor} compare with Elemental Bond? A neutral comparison of method, free access, subscription status, and disclosed price.`} /><link rel="canonical" href={`${SITE_URL}/compare/${key}`} /></Helmet>
    <header><p className="funnel-eyebrow">Neutral product comparison</p><h1>{item.competitor} vs. Elemental Bond</h1><p className="extract-summary">{item.summary}</p></header>
    <div className="comparison-table" role="table"><div role="row"><strong>Criterion</strong><strong>{item.competitor}</strong><strong>Elemental Bond</strong></div><div role="row"><span>Method</span><span>{item.method}</span><span>BaZi-inspired Five Elements relationship patterns</span></div><div role="row"><span>Free layer</span><span>{item.free}</span><span>Core-element result and relationship preview without required email</span></div><div role="row"><span>Subscription</span><span>{item.subscription}</span><span>Early-access list only; no recurring charge in the validation release</span></div><div role="row"><span>Disclosed price</span><span>Check the provider's current listing</span><span>$24.90 USD for one full report</span></div></div>
    <section><h2>When should someone choose each product?</h2><p>{item.choice}</p></section><p className="source-note">Competitor prices and feature availability are intentionally not asserted here because they can change. Check the provider's official listing before purchasing.</p><Link to="/compatibility">Try the free relationship preview</Link>
  </div>;
}
