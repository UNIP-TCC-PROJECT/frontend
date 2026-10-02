import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBuilding, FaCheckCircle, FaShieldAlt, FaHandSparkles } from "react-icons/fa";
import { api } from "../services/api";
import { CATEGORIES as categories } from "../constants/categories";

interface Ong {
  id: number;
  name: string;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  description?: string;
  averageRating?: number | string | null;
  totalReviews?: number | null;
  medalhaVerde?: boolean;
}

export default function Home() {
  const navigate = useNavigate();

  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchOngs() {
      try {
        const response = await api.get<Ong[]>("/users/ongs");

        if (!Array.isArray(response.data)) {
          throw new Error("A API retornou um formato inválido.");
        }

        if (active) {
          setOngs(response.data);
        }
      } catch (err) {
        console.error("Erro ao buscar ONGs:", err);
        if (active) {
          setError("Não foi possível carregar as ONGs em destaque.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOngs();

    return () => {
      active = false;
    };
  }, []);

  const handleCategoryClick = (cat: string) => {
    navigate(`/ongs?categoria=${cat}`);
  };

  const verifiedCount = ongs.filter((ong) => ong.medalhaVerde).length;

  const featuredOngs = [...ongs]
    .sort((a, b) => {
      const ratingDifference =
        Number(b.averageRating ?? 0) - Number(a.averageRating ?? 0);

      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      return Number(b.totalReviews ?? 0) - Number(a.totalReviews ?? 0);
    })
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative left-1/2 -mx-[50vw] -mt-32 bg-gradient-to-b from-brand-sage to-transparent px-4 pt-40 pb-16 w-screen">
        <div className="items-center gap-10 grid grid-cols-1 lg:grid-cols-12 mx-auto max-w-6xl">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-brand-surface px-3.5 py-1 border border-brand-primary/20 rounded-full font-semibold text-brand-primary text-xs uppercase tracking-wider">
              <FaHandSparkles className="w-3.5 h-3.5" />
              Plataforma de conexão transparente
            </div>

            <h1 className="font-serif text-brand-text text-4xl md:text-5xl leading-[1.1]">
              Ajude causas reais com{" "}
              <span className="text-brand-primary italic">transparência</span>
            </h1>

            <p className="max-w-xl text-brand-text/70 text-lg">
              Encontre ONGs verificadas para apoiar com doações, materiais ou
              trabalho voluntário.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/ongs"
                className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs px-8 py-3 rounded-full font-semibold text-brand-background transition-all"
              >
                Acessar ONGs
              </Link>
              <Link
                to="/auth?modo=cadastro"
                className="bg-brand-surface hover:bg-brand-sage px-8 py-3 border border-brand-text/15 rounded-full font-semibold text-brand-text transition-all"
              >
                Cadastrar minha ONG
              </Link>
            </div>
          </div>

          <div className="space-y-4 bg-brand-surface shadow-xs p-6 border border-brand-text/10 rounded-3xl lg:col-span-5">
            <h3 className="pb-3 border-brand-text/10 border-b font-semibold text-brand-text/50 text-xs uppercase tracking-widest">
              Impacto da plataforma
            </h3>
            <div className="gap-3 grid grid-cols-2">
              <div className="bg-brand-background p-4 border border-brand-text/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-1 text-brand-primary">
                  <FaBuilding className="w-4 h-4" />
                  <span className="font-serif font-bold text-brand-text text-2xl">
                    {loading ? "..." : ongs.length}
                  </span>
                </div>
                <span className="font-medium text-brand-text/60 text-xs">
                  ONGs cadastradas
                </span>
              </div>
              <div className="bg-brand-background p-4 border border-brand-text/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-1 text-brand-primary">
                  <FaShieldAlt className="w-4 h-4" />
                  <span className="font-serif font-bold text-brand-text text-2xl">
                    {loading ? "..." : verifiedCount}
                  </span>
                </div>
                <span className="font-medium text-brand-text/60 text-xs">
                  Com CNPJ verificado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section id="sobre" className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto mb-12 px-4 pt-12 max-w-4xl scroll-mt-28">
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
            className="flex flex-col items-center bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-text/10 hover:border-brand-text/30 rounded-2xl text-center transition-all"
          >
            <FaCheckCircle className="mb-2 text-brand-primary text-3xl" />
            <h3 className="mb-1 font-semibold text-brand-text text-lg">{item.title}</h3>
            <p className="text-brand-text/60 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mx-auto mb-16 px-4 max-w-3xl">
        <h2 className="mb-4 font-serif text-brand-text text-2xl">Categorias</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-brand-surface hover:bg-brand-sage shadow-sm px-6 py-2 border border-brand-text/15 rounded-full font-medium text-brand-primary transition"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ONGs em destaque */}
      <section className="mx-auto mb-20 px-4 max-w-5xl">
        <h2 className="mb-6 font-serif text-brand-text text-2xl">
          ONGs em destaque
        </h2>

        {loading && (
          <p className="py-8 text-brand-text/60 text-center">Carregando ONGs...</p>
        )}

        {error && (
          <p role="alert" className="py-8 text-brand-text/60 text-center">
            {error}
          </p>
        )}

        {!loading && !error && featuredOngs.length === 0 && (
          <p className="py-8 text-brand-text/60 text-center">
            Ainda não há ONGs cadastradas.
          </p>
        )}

        {!loading && featuredOngs.length > 0 && (
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
            {featuredOngs.map((ong) => (
              <div
                key={ong.id}
                className="group flex flex-col bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-text/10 hover:border-brand-text/30 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex justify-center items-center bg-brand-sage rounded-full ring-2 ring-brand-primary/20 w-11 h-11 font-serif font-bold text-brand-primary shrink-0">
                    {ong.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-brand-text group-hover:text-brand-primary text-base transition-colors">
                      {ong.name}
                    </h3>
                    {(ong.city || ong.state) && (
                      <span className="text-brand-text/60 text-xs">
                        {[ong.city, ong.state].filter(Boolean).join(" - ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium text-brand-text">
                    {Number(ong.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-brand-text/40">
                    ({ong.totalReviews ?? 0})
                  </span>
                </div>
                <p className="flex-1 mb-4 text-brand-text/70 text-sm line-clamp-3 leading-relaxed">
                  {ong.description || ong.category || "Sem descrição disponível."}
                </p>
                <Link
                  to={`/ongs/${ong.id}`}
                  className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs mt-auto px-4 py-2.5 rounded-full font-semibold text-brand-background text-xs text-center transition-all"
                >
                  Ver perfil
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
