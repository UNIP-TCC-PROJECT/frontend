import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { api } from "../services/api";

const categories = [
  { label: "Animais", value: "animais" },
  { label: "Crianças", value: "criancas" },
  { label: "Alimentos", value: "alimentos" },
  { label: "Roupas", value: "roupas" },
];

type FeaturedOng = {
  id: number;
  name: string;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  averageRating?: number | string | null;
  totalReviews?: number | null;
};

export default function Home() {
  const navigate = useNavigate();

  const [featuredOngs, setFeaturedOngs] = useState<FeaturedOng[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchFeaturedOngs() {
      try {
        const response = await api.get<FeaturedOng[]>("/users/ongs");

        if (!Array.isArray(response.data)) {
          throw new Error("A API retornou um formato inválido.");
        }

        if (active) {
          const rankedOngs = [...response.data].sort((a, b) => {
            const ratingDifference =
              Number(b.averageRating ?? 0) - Number(a.averageRating ?? 0);

            if (ratingDifference !== 0) {
              return ratingDifference;
            }

            return Number(b.totalReviews ?? 0) - Number(a.totalReviews ?? 0);
          });

          if (active) {
            setFeaturedOngs(rankedOngs.slice(0, 3));
          }
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar as ONGs em destaque.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchFeaturedOngs();

    return () => {
      active = false;
    };
  }, []);

  const handleCategoryClick = (cat: string) => {
    navigate(`/ongs?categoria=${cat}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-transparent px-4 pt-32 pb-12 text-center">
        <h1 className="mb-4 font-extrabold text-gray-900 text-4xl md:text-5xl">
          Ajude causas reais com transparência
        </h1>
        <p className="mb-8 text-gray-600 text-lg md:text-xl">
          Encontre ONGs confiáveis para apoiar
        </p>
        <Link
          to="/ongs"
          className="bg-blue-700 hover:bg-blue-800 shadow px-8 py-3 rounded-lg font-semibold text-white transition"
        >
          Acessar ONGs
        </Link>
      </section>

      {/* Confiança */}
      <section className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto mb-12 px-4 max-w-4xl">
        {[
          {
            title: "ONGs com perfis completos",
            desc: "Transparência nas informações e histórico.",
          },
          {
            title: "Informações públicas e transparentes",
            desc: "Dados abertos para sua confiança.",
          },
          {
            title: "Plataforma focada em confiança",
            desc: "Segurança e seriedade nas doações.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-white shadow p-6 border border-gray-100 rounded-xl text-center"
          >
            <FaCheckCircle className="mb-2 text-green-500 text-3xl" />
            <h3 className="mb-1 font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mx-auto mb-16 px-4 max-w-3xl">
        <h2 className="mb-4 font-bold text-gray-800 text-2xl">Categorias</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-white hover:bg-blue-50 shadow-sm px-6 py-2 border border-blue-200 rounded-full font-medium text-blue-700 transition"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ONGs em destaque */}
      <section className="mx-auto mb-20 px-4 max-w-5xl">
        <h2 className="mb-6 font-bold text-gray-800 text-2xl">
          ONGs em destaque
        </h2>
        {loading && <p role="status">Carregando ONGs...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && featuredOngs.length === 0 && (
          <p>Nenhuma ONG cadastrada no momento.</p>
        )}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          {featuredOngs.map((ong) => (
            <div
              key={ong.id}
              className="flex flex-col bg-white shadow p-6 border border-gray-100 rounded-xl"
            >
              <h3 className="mb-1 font-semibold text-lg">{ong.name}</h3>

              <div className="flex items-center gap-1 mb-2 text-sm">
                <span className="text-yellow-500">★</span>
                <span className="font-medium text-gray-700">
                  {Number(ong.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-gray-400">({ong.totalReviews ?? 0})</span>
              </div>

              {(ong.city || ong.state) && (
                <span className="mb-1 text-blue-700 text-sm">
                  {[ong.city, ong.state].filter(Boolean).join(" - ")}
                </span>
              )}

              <p className="flex-1 mb-4 text-gray-600">
                {ong.category || "Categoria não informada."}
              </p>
              <Link
                to={`/ongs/${ong.id}`}
                className="bg-blue-700 hover:bg-blue-800 shadow mt-auto px-4 py-2 rounded font-medium text-white text-center transition"
              >
                Ver perfil
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
