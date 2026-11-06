import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import HistoricoMedalhaBranca from "../../components/HistoricoMedalhaBranca";

interface Ong {
  id: number;
  name: string;
  email: string;
  cnpj?: string;
  phone?: string;
  description?: string;
  category?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
}

export default function AdminOngDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ong, setOng] = useState<Ong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOng() {
      try {
        const response = await api.get(`/admin/ongs/${id}`);
        setOng(response.data);
      } catch (err) {
        setError("Não foi possível carregar esta ONG.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOng();
  }, [id]);

  if (loading) {
    return <div className="py-10 text-gray-500 text-center">Carregando...</div>;
  }

  if (error || !ong) {
    return (
      <div className="py-10 text-gray-500 text-center">
        {error || "ONG não encontrada."}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/admin")}
        className="mb-6 font-medium text-blue-700 hover:text-blue-800"
      >
        ← Voltar para lista
      </button>

      <div className="bg-white p-8 border border-gray-200 rounded-xl">
        <h1 className="mb-1 font-bold text-gray-900 text-2xl">{ong.name}</h1>
        {ong.category && (
          <p className="mb-4 text-blue-700 capitalize">{ong.category}</p>
        )}

        <dl className="gap-4 grid grid-cols-1 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{ong.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CNPJ</dt>
            <dd className="text-gray-900">{ong.cnpj || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Telefone</dt>
            <dd className="text-gray-900">{ong.phone || "Não informado"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Avaliação</dt>
            <dd className="text-gray-900">
              ★ {Number(ong.averageRating ?? 0).toFixed(1)} (
              {ong.totalReviews ?? 0} avaliações)
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Cadastrada em</dt>
            <dd className="text-gray-900">
              {new Date(ong.createdAt).toLocaleDateString("pt-BR")}
            </dd>
          </div>
        </dl>

        <div className="mt-6 text-gray-700">
          <h2 className="mb-1 font-semibold text-gray-900">Descrição</h2>
          <p>{ong.description || "Sem descrição cadastrada."}</p>
        </div>
      </div>

      <div className="mt-6"><HistoricoMedalhaBranca ongId={ong.id} /></div>

      {/* Espaço reservado para ações administrativas futuras */}
      <div className="bg-white mt-6 p-6 border border-gray-300 border-dashed rounded-xl">
        <h2 className="mb-3 font-semibold text-gray-900">
          Ações administrativas
        </h2>
        <p className="mb-4 text-gray-500 text-sm">
          Funcionalidades de moderação (restrição, suspensão, banimento e
          denúncias) serão adicionadas aqui.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="bg-gray-100 px-4 py-2 rounded-lg text-gray-400 text-sm cursor-not-allowed"
          >
            Restringir
          </button>
          <button
            disabled
            className="bg-gray-100 px-4 py-2 rounded-lg text-gray-400 text-sm cursor-not-allowed"
          >
            Suspender
          </button>
          <button
            disabled
            className="bg-gray-100 px-4 py-2 rounded-lg text-gray-400 text-sm cursor-not-allowed"
          >
            Banir
          </button>
          <button
            disabled
            className="bg-gray-100 px-4 py-2 rounded-lg text-gray-400 text-sm cursor-not-allowed"
          >
            Ver denúncias
          </button>
        </div>
      </div>
    </div>
  );
}
