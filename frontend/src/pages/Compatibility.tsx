import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { InkButton } from "../components/InkButton";

const formatSign = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function CompatibilityPage() {
  const navigate = useNavigate();
  const { sign1: rawSign1, sign2: rawSign2 } = useParams();

  const sign1 = rawSign1?.trim() ? formatSign(rawSign1) : "Your Sign";
  const sign2 = rawSign2?.trim() ? formatSign(rawSign2) : "Their Sign";

  const title = `${sign1} and ${sign2} Compatibility: Ancient Astrology Blueprint`;
  const ctaLabel = `Calculate Exact Soul Resonance for ${sign1} & ${sign2} Now`;

  return (
    <div className="landing-page fade-in">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <section className="landing-hero">
        <span className="landing-hero__badge">Compatibility Blueprint</span>
        <h1 className="landing-hero__title">{title}</h1>
        <p className="landing-hero__subtitle">
          Every pairing holds a hidden rhythm that only reveals itself through deeper elemental patterns. The connection
          between {sign1} and {sign2} carries a distinct signature that blends destiny, timing, and temperament into a
          story worth decoding.
        </p>
        <div className="landing-hero__actions">
          <InkButton type="button" full onClick={() => navigate("/")}>
            {ctaLabel}
          </InkButton>
        </div>
      </section>
    </div>
  );
}
