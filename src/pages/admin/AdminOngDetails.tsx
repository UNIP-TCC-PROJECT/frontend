import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { AnaliseMedalhaBranca } from "../../components/MedalhaBranca";

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
    return <div className="py-10 text-center text-gray-500">Carregando...</div>;
  }

  if (error || !ong) {
    return (
      <div className="py-10 text-center text-gray-500">
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

      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{ong.name}</h1>
        {ong.category && (
          <p className="mb-4 capitalize text-blue-700">{ong.category}</p>
        )}

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
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

      <AnaliseMedalhaBranca ongId={ong.id} />

      {/* Espaço reservado para ações administrativas futuras */}
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6">
        <h2 className="mb-3 font-semibold text-gray-900">Ações administrativas</h2>
        <p className="mb-4 text-sm text-gray-500">
          Funcionalidades de moderação (restrição, suspensão, banimento e denúncias)
          serão adicionadas aqui.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400"
          >
            Restringir
          </button>
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400"
          >
            Suspender
          </button>
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400"
          >
            Banir
          </button>
          <button
            disabled
            className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-400"
          >
            Ver denúncias
          </button>
        </div>
      </div>
    </div>
  );
}
