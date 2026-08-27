import { Link, useLocation, useNavigate } from "react-router-dom";

import { useState, useRef, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

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
    <header className="top-0 left-0 z-20 fixed bg-white shadow w-full">
      <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
        <Link to="/" className="font-bold text-blue-700 text-2xl">
          DoaFácil
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/ongs"
            className={`font-medium hover:text-blue-700 ${location.pathname.startsWith("/ongs") ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-1" : ""}`}
          >
            ONGs
          </Link>

          <a href="#sobre" className="font-medium hover:text-blue-700">
            Sobre
          </a>

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Minha conta"
                className="flex justify-center items-center hover:bg-slate-100 border border-slate-200 rounded-full w-9 h-9 transition"
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
              className="hover:bg-blue-700 px-4 py-1 border border-blue-700 rounded-full font-medium text-blue-700 hover:text-white transition"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
