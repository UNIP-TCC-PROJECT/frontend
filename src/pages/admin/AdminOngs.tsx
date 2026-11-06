import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

interface Ong {
  id: number;
  name: string;
  email: string;
  cnpj?: string;
  category?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
}

export default function AdminOngs() {
  const navigate = useNavigate();

  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchOngs() {
      try {
        const response = await api.get("/admin/ongs");
        setOngs(response.data);
      } catch (error) {
        console.error("Erro ao buscar ONGs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOngs();
  }, []);

  const filteredOngs = ongs.filter((ong) =>
    ong.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h1 className="mb-6 font-bold text-gray-900 text-2xl">
        Organizações cadastradas
      </h1>

      {/* Estrutura para filtros */}
      <div className="flex flex-wrap items-center gap-4 bg-white mb-6 p-4 border border-gray-200 rounded-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 w-full max-w-xs text-sm"
        />
        {/* Espaço reservado para futuros filtros: categoria, status, data */}
      </div>

      {loading ? (
        <div className="py-10 text-gray-500 text-center">Carregando...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Avaliação</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOngs.map((ong) => (
                <tr key={ong.id} className="border-gray-100 border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {ong.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ong.email}</td>
                  <td className="px-4 py-3 text-gray-600">{ong.cnpj || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ★ {Number(ong.averageRating ?? 0).toFixed(1)} (
                    {ong.totalReviews ?? 0})
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(ong.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/ongs/${ong.id}`)}
                      className="text-blue-700 hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOngs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-gray-400 text-center"
                  >
                    Nenhuma ONG encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
