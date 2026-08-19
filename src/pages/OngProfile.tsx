import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "../components/Card";
import { StarRating } from "../components/StarRating";

export default function OngProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ong, setOng] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOng() {
      try {
        const response = await axios.get("http://localhost:3000/users/ongs");
        const encontrada = response.data.find(
          (item: any) => String(item.id) === String(id)
        );
        setOng(encontrada || null);
      } catch (error) {
        console.error("Erro ao buscar ONG:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOng();
  }, [id]);

  if (loading) {
    return <div className="py-10 text-gray-500 text-center">Carregando...</div>;
  }

  if (!ong) {
    return (
      <div className="py-10 text-gray-500 text-center">
        ONG não encontrada.
        <div className="mt-4">
          <button
            onClick={() => navigate("/ongs")}
            className="text-blue-700 underline"
          >
            Voltar para a lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-extrabold text-gray-900 text-3xl">{ong.name}</h1>

      {ong.city && <p className="mb-2 text-blue-700">{ong.city}</p>}

      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-500 text-xl">★</span>
        <span className="font-semibold text-gray-800">
          {Number(ong.averageRating ?? 0).toFixed(1)}
        </span>
        <span className="text-gray-500 text-sm">
          ({ong.totalReviews ?? 0} avaliações)
        </span>
      </div>

      <p className="mb-6 text-gray-700">
        {ong.description || "Sem descrição disponível."}
      </p>

      <div>
        <h2 className="mb-2 font-semibold text-gray-800">Avalie esta ONG</h2>
        <StarRating
          ongId={ong.id}
          onRated={(novaMedia, novoTotal) =>
            setOng((prev: any) => ({
              ...prev,
              averageRating: novaMedia,
              totalReviews: novoTotal,
            }))
          }
        />
      </div>
    </Card>
  );
}