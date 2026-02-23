import { Link } from "react-router-dom";

import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { getAccessToken, getStoredUser } from "../utils/auth";

export default function HomePage() {
  const user = getStoredUser();
  const isLoggedIn = Boolean(getAccessToken()) && Boolean(user);

  return (
    <div className="landing-page fade-in">
      <section className="landing-hero fade-in-up">
        <p className="landing-hero__badge">Elemental Bond</p>
        <h1 className="landing-hero__title">Elemental Bond</h1>
        <p className="landing-hero__subtitle">
          An Eastern consultation experience that blends Zi Wei Dou Shu, Mei Hua, and mindset guidance into actionable, reviewable insights.
        </p>
        <div className="actions-row landing-hero__actions">
          {isLoggedIn ? (
            <>
              <Link to="/oracle">
                <InkButton type="button">Enter Oracle Chat</InkButton>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <InkButton type="button">Sign In</InkButton>
              </Link>
              <Link to="/register">
                <InkButton type="button" kind="secondary">Register with Email</InkButton>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="landing-grid">
        <InkCard title="Zi Wei Dou Shu: Long-Range Reading" icon="Z">
          <p>Maps life phases, relationship architecture, and career direction with long-range trends and key windows.</p>
        </InkCard>
        <InkCard title="Mei Hua: Short-Term Decisions" icon="M">
          <p>Focuses on near-term events and timing to surface key variables and response strategies.</p>
        </InkCard>
        <InkCard title="Mindset Guidance & Actionability" icon="H">
          <p>Turns insights into concrete steps, reducing anxiety with verification and review loops.</p>
        </InkCard>
      </section>

      <section className="landing-footnote">
        <p>Note: Insights are for reference only and do not replace medical, legal, or financial advice.</p>
      </section>
    </div>
  );
}
