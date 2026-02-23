import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ZiweiBackground } from "./ZiweiBackground";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [activeConstellationIndex, setActiveConstellationIndex] = useState(0);

  useEffect(() => {
    if (!isHome) {
      setActiveConstellationIndex(0);
      return;
    }
    // Keep background static in chat page to reduce visual fatigue.
    setActiveConstellationIndex(0);
  }, [isHome]);

  return (
    <div className="app-shell">
      <ZiweiBackground activeIndex={activeConstellationIndex} />
      <div className="app-chroma-line" aria-hidden="true">
        <span />
      </div>
      <div className="app-observation-label" aria-hidden="true">
        Elemental Bond Observatory
      </div>

      <header className="top-nav">
        <Link to="/" className="top-nav__brand">
          <span className="top-nav__brand-icon" aria-hidden="true" />
          Elemental Bond
        </Link>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        Elemental Bond · Ancient Chinese Compatibility Oracle
      </footer>
    </div>
  );
}
