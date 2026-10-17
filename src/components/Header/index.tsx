import { Link, useLocation, useNavigate } from "react-router-dom";

import { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import { useAuth } from "../../context/useAuth";
import { CATEGORIES } from "../../constants/categories";
import { BRAND } from "../../constants/brand";
import { BrandLogo } from "../BrandLogo";
import ProfileIcon from "./icons/ProfileIcon";
import MyAccountModal from "./components/MyAccountModal";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout, isLoggedIn, user } = useAuth();

  const menuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    }
    if (open || categoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, categoriesOpen]);

  return (
    <header className="top-0 left-0 z-20 fixed bg-brand-background/95 backdrop-blur-md border-b border-brand-border w-full">
      <div className="flex justify-between items-center gap-1 mx-auto px-3 sm:px-6 py-3.5 max-w-7xl">
        <Link
          to="/"
          aria-label={`${BRAND.name} — ${BRAND.slogan}`}
          className="flex shrink-0 items-center gap-3 group"
        >
          <BrandLogo compactOnMobile />
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          <div className="relative flex items-stretch" ref={categoriesRef}>
            <Link
              to="/ongs"
              className={`py-2 pl-2 sm:pl-3.5 rounded-l-full text-[11px] sm:text-xs font-semibold uppercase sm:tracking-wider transition-all ${
                location.pathname.startsWith("/ongs")
                  ? "bg-brand-primary text-brand-onPrimary"
                  : "text-brand-muted hover:bg-brand-text/5 hover:text-brand-text"
              }`}
            >
              ONGs
            </Link>
            <button
              type="button"
              aria-label="Categorias de ONGs"
              onClick={() => setCategoriesOpen((v) => !v)}
              className={`flex items-center py-2 pr-2 sm:pr-3 pl-1 sm:pl-1.5 rounded-r-full transition-all ${
                location.pathname.startsWith("/ongs")
                  ? "bg-brand-primary text-brand-onPrimary"
                  : "text-brand-muted hover:bg-brand-text/5 hover:text-brand-text"
              }`}
            >
              <FaChevronDown className="w-2.5 h-2.5" />
            </button>

            {categoriesOpen && (
              <div className="top-full left-0 z-30 absolute bg-brand-surface shadow-lg mt-2 p-2 border border-brand-border rounded-2xl w-52 fade-in">
                <span className="block px-3.5 py-1.5 font-semibold text-[10px] text-brand-muted uppercase tracking-wider">
                  Categorias
                </span>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.value}
                    to={`/ongs?categoria=${category.value}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="block hover:bg-brand-champagne px-3.5 py-2 rounded-lg font-medium text-brand-text text-sm transition-colors"
                  >
                    {category.label}
                  </Link>
                ))}
                <Link
                  to="/ongs"
                  onClick={() => setCategoriesOpen(false)}
                  className="block hover:bg-brand-champagne mt-1 px-3.5 py-2 border-brand-border border-t rounded-lg font-semibold text-brand-primaryText text-sm transition-colors"
                >
                  Ver todas as ONGs
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/publicacoes"
            className={`px-1 sm:px-3.5 py-2 rounded-full font-semibold text-[11px] sm:text-xs uppercase sm:tracking-wider transition-all ${
              location.pathname.startsWith("/publicacoes")
                ? "bg-brand-primary text-brand-onPrimary"
                : "text-brand-muted hover:bg-brand-text/5 hover:text-brand-text"
            }`}
          >
            Publicações
          </Link>

          <a
            href="/#sobre"
            className="hover:bg-brand-text/5 px-1 sm:px-3.5 py-2 rounded-full font-semibold text-brand-muted hover:text-brand-text text-[11px] sm:text-xs uppercase sm:tracking-wider transition-all"
          >
            Sobre
          </a>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-brand-border border-l">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Minha conta"
                  className="flex items-center gap-2.5 hover:bg-brand-text/5 p-1 pr-3 rounded-full transition-colors"
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className="flex justify-center items-center bg-brand-champagne rounded-full w-8 h-8 overflow-hidden font-sans font-bold text-brand-primaryText text-sm shrink-0">
                    <ProfileIcon />
                  </span>
                  <span className="hidden sm:flex flex-col items-start">
                    <span className="max-w-[120px] font-semibold text-brand-text text-xs truncate">
                      {user?.name}
                    </span>
                    <span className="bg-brand-champagne px-1.5 rounded font-semibold text-[9px] text-brand-goldText uppercase tracking-wider">
                      {user?.type === "ONG" ? "ONG" : "Doador"}
                    </span>
                  </span>
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

              <button
                type="button"
                onClick={logout}
                title="Sair da conta"
                className="hover:bg-red-50 p-2 rounded-full text-brand-muted hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-2 border-brand-border border-l">
              <Link
                to="/auth"
                className="hover:bg-brand-text/5 px-2 sm:px-3.5 py-2 rounded-full font-semibold text-brand-text text-[11px] sm:text-xs transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/auth?modo=cadastro"
                className="bg-brand-primary hover:bg-brand-primaryDark px-2 sm:px-4 py-2 rounded-full font-semibold text-brand-onPrimary text-[11px] sm:text-xs transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
