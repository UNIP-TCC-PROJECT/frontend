import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">Painel Admin</span>
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-300 hover:text-white"
          >
            ONGs
          </button>
          <button
            onClick={() => navigate("/admin/validacoes")}
            className="text-sm text-gray-300 hover:text-white"
          >
            Validação de ONGs
          </button>
          <button
            onClick={() => navigate("/admin/prestacao-de-contas")}
            className="text-sm text-gray-300 hover:text-white"
          >
            Prestação de contas
          </button>
          <button
            onClick={() => navigate("/admin/admins/novo")}
            className="text-sm text-gray-300 hover:text-white"
          >
            Novo Admin
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">{user?.name}</span>
          <button
            onClick={logout}
            className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}