import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ZiweiBackground } from "./ZiweiBackground";
import { ExitIntentModal } from "./ExitIntentModal";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [activeConstellationIndex, setActiveConstellationIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setActiveConstellationIndex(0);
      return;
    }
    setActiveConstellationIndex(0);
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileMenuOpen(false);
  }, []);
  useEffect(() => {
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, handleKeyDown]);

  const navLinks = [
    { to: "/", label: "Compatibility" },
    { to: "/elements/wood", label: "Elements" },
    { to: "/bazi", label: "BaZi Reading" },
    { to: "/articles", label: "Articles" },
  ];

  // Only animate the galaxy background on result/reading pages for visual impact
  const shouldAnimateBg = location.pathname === "/result" || location.pathname === "/bazi";

  return (
    <div className="app-shell">
      <ZiweiBackground activeIndex={activeConstellationIndex} animate={shouldAnimateBg} />
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

        {/* Desktop nav links */}
        <nav className="top-nav__links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`top-nav__link ${location.pathname === link.to ? "top-nav__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button (mobile) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? "open" : ""}`} />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? "visible" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <nav className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`} aria-label="Mobile navigation">
        <div className="mobile-drawer-header">
          <span className="top-nav__brand-icon" aria-hidden="true" />
          Elemental Bond
        </div>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`mobile-drawer-link ${location.pathname === link.to ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Elemental Bond · Ancient Chinese Compatibility Oracle</p>
        <nav className="app-footer__social" aria-label="Social media">
          <span style={{ color: "var(--oracle-text-muted)" }}>Social coming soon</span>
        </nav>
        <nav className="app-footer__nav">
          <a href="/">BaZi Compatibility</a>
          <a href="/elements/wood">Element Personalities</a>
          <a href="/bazi">BaZi Reading</a>
          <a href="/articles">Articles</a>
          <a href="/about">About</a>
          <a href="/compatibility/elements/wood-and-fire">Element Compatibility</a>
        </nav>
      </footer>

      <ExitIntentModal />
    </div>
  );
}
