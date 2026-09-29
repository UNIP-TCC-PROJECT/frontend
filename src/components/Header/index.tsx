import { Link, useLocation, useNavigate } from "react-router-dom";

import { useState, useRef, useEffect } from "react";

import { useAuth } from "../../context/useAuth";

import ProfileIcon from "./icons/ProfileIcon";

import MyAccountModal from "./components/MyAccountModal";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, isLoggedIn, user } = useAuth();

  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="top-0 left-0 z-20 fixed bg-brand-background/95 backdrop-blur-md border-b border-brand-text/10 w-full">
      <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl text-brand-text tracking-tight">
          Doa<span className="text-brand-primary italic">Fácil</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/ongs"
            className={`text-sm font-semibold uppercase tracking-wider transition-colors ${location.pathname.startsWith("/ongs") ? "text-brand-primary" : "text-brand-text/70 hover:text-brand-text"}`}
          >
            ONGs
          </Link>

          <a href="#sobre" className="text-sm font-semibold uppercase tracking-wider text-brand-text/70 hover:text-brand-text transition-colors">
            Sobre
          </a>

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Minha conta"
                className="flex justify-center items-center hover:bg-brand-sage border border-brand-text/15 rounded-full w-9 h-9 transition"
                onClick={() => setOpen((v) => !v)}
              >
                <ProfileIcon />
              </button>
              {open && (
                <MyAccountModal
                  setOpen={setOpen}
                  navigate={navigate}
                  logout={logout}
                  isOng={user?.type === "ONG"}
                />
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-brand-primary hover:bg-brand-primaryDark px-4 py-1.5 rounded-full font-semibold text-sm text-brand-background transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
