import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { OPEN_AUTH_MODAL_EVENT } from "../constants/events";
import type { UserProfile } from "../types";
import { AuthModal } from "./AuthModal";
import { InkButton } from "./InkButton";
import { ZiweiBackground } from "./ZiweiBackground";

interface LayoutProps {
  user: UserProfile | null;
  authReady: boolean;
  onLogout: () => Promise<void> | void;
  onAuthSuccess?: (user: UserProfile) => void;
}

export function Layout({ user, authReady, onLogout, onAuthSuccess }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/oracle";
  const isAdminEntry = location.pathname.startsWith("/admin");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";
  const showGuestAuthButton = !user && !isAdminEntry && !isAuthPage;

  const [activeConstellationIndex, setActiveConstellationIndex] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setActiveConstellationIndex(0);
      return;
    }
    // Keep background static in chat page to reduce visual fatigue.
    setActiveConstellationIndex(0);
  }, [isHome]);

  useEffect(() => {
    if (user) {
      setAuthModalOpen(false);
    }
  }, [user]);

  useEffect(() => {
    const handleOpenAuthModal = () => {
      if (!user) {
        setAuthModalOpen(true);
      }
    };
    window.addEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuthModal);
    return () => {
      window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handleOpenAuthModal);
    };
  }, [user]);

  const handleLogoutClick = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await onLogout();
      navigate(user?.role === "admin" ? "/admin" : "/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        <Link to="/oracle" className="top-nav__brand">
          <span className="top-nav__brand-icon" aria-hidden="true" />
          Elemental Bond
        </Link>
        <nav className="top-nav__links">
          {user ? (
            <>
              <NavLink to="/oracle" className={({ isActive }) => isActive ? "active" : ""}>
                Oracle Chat
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => isActive ? "active" : ""}>
                History
              </NavLink>
              <NavLink to="/insights" className={({ isActive }) => isActive ? "active" : ""}>
                Life Line / Calendar
              </NavLink>
              <NavLink to="/ziwei" className={({ isActive }) => isActive ? "active" : ""}>
                Zi Wei Reading
              </NavLink>
              <NavLink to="/meihua" className={({ isActive }) => isActive ? "active" : ""}>
                Mei Hua Reading
              </NavLink>
              {user.role === "admin" ? (
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                  Admin Dashboard
                </NavLink>
              ) : null}
            </>
          ) : null}
        </nav>
        <div className="top-nav__auth">
          {!authReady ? <span className="top-nav__hint">Checking...</span> : null}
          {user ? (
            <>
              <span className="top-nav__user">{user.email}</span>
              <InkButton type="button" kind="ghost" onClick={() => void handleLogoutClick()} disabled={isLoggingOut}>
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </InkButton>
            </>
          ) : showGuestAuthButton ? (
            <InkButton
              type="button"
              kind="ghost"
              className="top-nav__auth-cta"
              onClick={() => {
                setAuthModalOpen(true);
              }}
            >
              Sign In / Register
            </InkButton>
          ) : null}
        </div>
      </header>

      <main className={`app-main ${location.pathname === "/oracle" ? "app-main--oracle" : ""}`}>
        <Outlet />
      </main>

      <footer className="app-footer">
        Elemental Bond · Ancient Chinese Compatibility Oracle
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
        }}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
}
