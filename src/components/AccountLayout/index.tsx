import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FaBuilding,
  FaBullhorn,
  FaBullseye,
  FaChevronDown,
  FaFileInvoiceDollar,
  FaHandHoldingHeart,
  FaHeart,
  FaUser,
  FaUsers,
} from "react-icons/fa";

import { useAuth } from "../../context/useAuth";

interface AccountLink {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const COMMON: AccountLink[] = [{ to: "/perfil", label: "Minha conta", icon: FaUser }];

const DONOR: AccountLink[] = [
  { to: "/minhas-doacoes", label: "Minhas doações", icon: FaHandHoldingHeart },
  { to: "/ongs-favoritas", label: "ONGs favoritas", icon: FaHeart },
];

const ONG: AccountLink[] = [
  { to: "/minha-instituicao", label: "Minha instituição", icon: FaBuilding },
  { to: "/minhas-campanhas", label: "Campanhas e arrecadação", icon: FaBullhorn },
  { to: "/prestacao-de-contas", label: "Prestação de contas", icon: FaFileInvoiceDollar },
  { to: "/minhas-metas", label: "Minhas metas", icon: FaBullseye },
  { to: "/interesses", label: "Doadores interessados", icon: FaUsers },
];

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function linkClass(active: boolean) {
  return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-brand-primary text-brand-onPrimary"
      : "text-brand-muted hover:bg-brand-text/5 hover:text-brand-text"
  }`;
}

/**
 * Moldura das páginas da área da conta: navegação lateral no desktop (lg+) e dropdown no mobile.
 * As páginas filhas são renderizadas em <Outlet />; o acesso por perfil continua nos guards de cada rota.
 */
export default function AccountLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    ...COMMON,
    ...(user?.type === "DOADOR" && user.status === "ATIVO" ? DONOR : []),
    ...(user?.type === "ONG" ? ONG : []),
  ];
  const current = links.find((l) => isActive(pathname, l.to)) ?? links[0];

  // Fecha o dropdown ao navegar, ao clicar fora e com Esc.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const CurrentIcon = current.icon;

  return (
    <div className="lg:gap-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Desktop: barra lateral fixa ao rolar */}
      <aside className="hidden lg:block">
        <nav
          aria-label="Navegação da conta"
          className="top-28 sticky bg-brand-surface/95 p-3 border border-brand-border rounded-2xl"
        >
          <div className="mb-2 px-3.5 py-2">
            <p className="font-semibold text-brand-text text-sm truncate">{user?.name}</p>
            <p className="text-brand-muted text-xs">
              {user?.type === "ONG" ? "Conta de ONG" : "Conta de doador"}
            </p>
          </div>
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = isActive(pathname, to);
              return (
                <li key={to}>
                  <Link to={to} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                    <Icon aria-hidden className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile/tablet: dropdown com a seção atual */}
      <div className="relative mb-6 lg:hidden" ref={dropdownRef}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="account-nav-list"
          aria-label="Navegar pela conta"
          onClick={() => setOpen((v) => !v)}
          className="flex justify-between items-center gap-3 bg-brand-surface px-4 py-3 border border-brand-border rounded-xl w-full font-semibold text-brand-text text-sm"
        >
          <span className="flex items-center gap-3">
            <CurrentIcon aria-hidden className="w-4 h-4 text-brand-goldText" />
            {current.label}
          </span>
          <FaChevronDown
            aria-hidden
            className={`w-3 h-3 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul
            id="account-nav-list"
            className="top-full right-0 left-0 z-10 absolute space-y-1 bg-brand-surface shadow-lg mt-2 p-2 border border-brand-border rounded-2xl fade-in"
          >
            {links.map(({ to, label, icon: Icon }) => {
              const active = isActive(pathname, to);
              return (
                <li key={to}>
                  <Link to={to} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                    <Icon aria-hidden className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* As páginas trazem seu próprio contêiner (max-w, mx-auto, padding, fundo, altura mínima): aqui ele passa a preencher a coluna. */}
      <div className="min-w-0 [&>*]:!mx-0 [&>*]:!p-0 [&>*]:!max-w-none [&>*]:!min-h-0 [&>*]:!bg-transparent">
        <Outlet />
      </div>
    </div>
  );
}
