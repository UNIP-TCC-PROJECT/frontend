import { Link, useLocation, useNavigate } from "react-router-dom";

import { useState, useRef, useEffect } from "react";
import { FaHandHoldingHeart, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

import { useAuth } from "../../context/useAuth";
import { CATEGORIES } from "../../constants/categories";
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
    <header className="top-0 left-0 z-20 fixed bg-brand-background/95 backdrop-blur-md border-b border-brand-text/10 w-full">
      <div className="flex justify-between items-center mx-auto px-6 py-3.5 max-w-7xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex justify-center items-center bg-brand-primary rounded-full w-10 h-10 text-brand-background transition-transform group-hover:scale-105 shrink-0">
            <FaHandHoldingHeart className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-2xl text-brand-text tracking-tight">
              Doa<span className="text-brand-primary italic">Fácil</span>
            </span>
            <p className="hidden sm:block -mt-1 font-medium text-[10px] text-brand-text/60 uppercase tracking-wide">
              Intermediação transparente & segura
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <div className="relative flex items-stretch" ref={categoriesRef}>
            <Link
              to="/ongs"
              className={`py-2 pl-3.5 rounded-l-full text-xs font-semibold uppercase tracking-wider transition-all ${location.pathname.startsWith("/ongs")
                ? "bg-brand-primary text-brand-background"
                : "text-brand-text/70 hover:bg-brand-text/5 hover:text-brand-text"
                }`}
            >
              ONGs
            </Link>
            <button
              type="button"
              aria-label="Categorias de ONGs"
              onClick={() => setCategoriesOpen((v) => !v)}
              className={`flex items-center py-2 pr-3 pl-1.5 rounded-r-full transition-all ${location.pathname.startsWith("/ongs")
                ? "bg-brand-primary text-brand-background"
                : "text-brand-text/70 hover:bg-brand-text/5 hover:text-brand-text"
                }`}
            >
              <FaChevronDown className="w-2.5 h-2.5" />
            </button>

            {categoriesOpen && (
              <div className="top-full left-0 z-30 absolute bg-brand-surface shadow-lg mt-2 p-2 border border-brand-text/10 rounded-2xl w-52 fade-in">
                <span className="block px-3.5 py-1.5 font-semibold text-[10px] text-brand-text/50 uppercase tracking-wider">
                  Categorias
                </span>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.value}
                    to={`/ongs?categoria=${category.value}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="block hover:bg-brand-sage px-3.5 py-2 rounded-lg font-medium text-brand-text text-sm transition-colors"
                  >
                    {category.label}
                  </Link>
                ))}
                <Link
                  to="/ongs"
                  onClick={() => setCategoriesOpen(false)}
                  className="block hover:bg-brand-sage mt-1 px-3.5 py-2 border-brand-text/10 border-t rounded-lg font-semibold text-brand-primary text-sm transition-colors"
                >
                  Ver todas as ONGs
                </Link>
              </div>
            )}
          </div>

          <a
            href="/#sobre"
            className="hover:bg-brand-text/5 px-3.5 py-2 rounded-full font-semibold text-brand-text/70 hover:text-brand-text text-xs uppercase tracking-wider transition-all"
          >
            Sobre
          </a>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-brand-text/10 border-l">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Minha conta"
                  className="flex items-center gap-2.5 hover:bg-brand-text/5 p-1 pr-3 rounded-full transition-colors"
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className="flex justify-center items-center bg-brand-sage rounded-full w-8 h-8 overflow-hidden font-serif font-bold text-brand-primary text-sm shrink-0">
                    <ProfileIcon />
                  </span>
                  <span className="hidden sm:flex flex-col items-start">
                    <span className="max-w-[120px] font-semibold text-brand-text text-xs truncate">
                      {user?.name}
                    </span>
                    <span className="bg-brand-sage px-1.5 rounded font-semibold text-[9px] text-brand-primary uppercase tracking-wider">
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
                className="hover:bg-red-50 p-2 rounded-full text-brand-text/50 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-2 border-brand-text/10 border-l">
              <Link
                to="/auth"
                className="hover:bg-brand-text/5 px-3.5 py-2 rounded-full font-semibold text-brand-text text-xs transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/auth?modo=cadastro"
                className="bg-brand-primary hover:bg-brand-primaryDark px-4 py-2 rounded-full font-semibold text-brand-background text-xs transition-colors"
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
