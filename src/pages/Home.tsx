import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaCheckCircle,
  FaShieldAlt,
  FaHandSparkles,
} from "react-icons/fa";
import { api, imagemUrl } from "../services/api";
import { CATEGORIES as categories } from "../constants/categories";
import { useAuth } from "../context/useAuth";

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

interface PublicacaoResumo {
  id: number;
  description: string;
  imageUrl: string | null;
  ongId: number;
  ong: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  createdAt: string;
}

interface PublicacoesRecentesResponse {
  items: PublicacaoResumo[];
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publicacoesRecentes, setPublicacoesRecentes] = useState<
    PublicacaoResumo[]
  >([]);
  const [carregandoPublicacoes, setCarregandoPublicacoes] = useState(false);
  const [erroPublicacoes, setErroPublicacoes] = useState("");

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

  useEffect(() => {
    if (user?.type !== "DOADOR" && user?.type !== "ONG") {
      setPublicacoesRecentes([]);
      setCarregandoPublicacoes(false);
      return;
    }

    let ativo = true;

    setCarregandoPublicacoes(true);
    setErroPublicacoes("");

    api
      .get<PublicacoesRecentesResponse>("/publicacoes", {
        params: { page: 1, limit: 6 },
      })
      .then(({ data }) => {
        if (ativo) setPublicacoesRecentes(data.items);
      })
      .catch(() => {
        if (ativo) {
          setErroPublicacoes("Não foi possível carregar as publicações.");
        }
      })
      .finally(() => {
        if (ativo) setCarregandoPublicacoes(false);
      });

    return () => {
      ativo = false;
    };
  }, [user]);

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
  const isOng = user?.type === "ONG";
  const isDoador = user?.type === "DOADOR";

  return (
    <>
      {/* Hero */}
      <section className="relative left-1/2 -mx-[50vw] -mt-32 bg-gradient-to-b from-brand-champagne to-brand-background pt-40 pb-16 w-screen">
        <div className="items-center gap-10 grid grid-cols-1 lg:grid-cols-12 mx-auto px-3 sm:px-6 max-w-7xl">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-brand-surface px-3.5 py-1 border border-brand-border rounded-full font-semibold text-brand-text text-xs uppercase tracking-wider">
              <FaHandSparkles className="w-3.5 h-3.5 text-[#DBB24C]" />
              Plataforma de conexão transparente
            </div>

            <h1 className="font-sans text-brand-text text-4xl md:text-5xl leading-[1.1]">
              {isOng ? "Encontre ajuda real com " : "Ajude causas reais com "}
              <span className="text-brand-primaryText italic">
                transparência
              </span>
            </h1>

            <p className="max-w-xl text-brand-muted text-lg">
              {isOng
                ? "Agora você pode encontrar doadores e ver o interesse deles na sua causa. Para conquistar o selo Medalha Branca, acesse seu perfil e solicite uma verificação adicional."
                : isDoador
                  ? "Você agora pode buscar ONGs para ajudar, prestar serviços e demonstrar interesse. Boa jornada."
                  : "Encontre ONGs verificadas para apoiar com doações, materiais ou trabalho voluntário."}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={isOng ? "/interesses" : "/ongs"}
                className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs px-8 py-3 rounded-full font-semibold text-brand-onPrimary transition-all"
              >
                {isOng ? "Acessar doadores interessados" : "Acessar ONGs"}
              </Link>

              <Link
                to={user ? "/publicacoes" : "/auth?modo=cadastro"}
                className="bg-brand-surface hover:bg-brand-champagne px-8 py-3 border border-brand-text/15 rounded-full font-semibold text-brand-text transition-all"
              >
                {user ? "Publicações" : "Cadastrar minha ONG"}
              </Link>
            </div>
          </div>

          <div className="space-y-4 bg-brand-surface shadow-xs p-6 border border-brand-border rounded-3xl lg:col-span-5">
            <h3 className="pb-3 border-brand-border border-b font-semibold text-brand-muted text-xs uppercase tracking-widest">
              Impacto da plataforma
            </h3>
            <div className="gap-3 grid grid-cols-2">
              <div className="bg-brand-background p-4 border border-brand-border rounded-2xl">
                <div className="flex items-center gap-2 mb-1 text-[#DBB24C]">
                  <FaBuilding className="w-4 h-4" />
                  <span className="font-sans font-bold text-brand-text text-2xl">
                    {loading ? "..." : ongs.length}
                  </span>
                </div>
                <span className="font-medium text-brand-muted text-xs">
                  ONGs cadastradas
                </span>
              </div>
              <div className="bg-brand-background p-4 border border-brand-border rounded-2xl">
                <div className="flex items-center gap-2 mb-1 text-[#DBB24C]">
                  <FaShieldAlt className="w-4 h-4" />
                  <span className="font-sans font-bold text-brand-text text-2xl">
                    {loading ? "..." : verifiedCount}
                  </span>
                </div>
                <span className="font-medium text-brand-muted text-xs">
                  Com CNPJ verificado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section
        id="sobre"
        className="gap-6 grid grid-cols-1 md:grid-cols-3 mb-12 pt-12 scroll-mt-28"
      >
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
            className="flex flex-col items-center bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-border hover:border-brand-text/30 rounded-2xl text-center transition-all"
          >
            <FaCheckCircle className="mb-2 text-[#DBB24C] text-3xl" />
            <h3 className="mb-1 font-semibold text-brand-text text-lg">
              {item.title}
            </h3>
            <p className="text-brand-muted text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Categorias */}
      <section className="mb-16">
        <h2 className="mb-4 font-sans text-brand-text text-2xl">Categorias</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className="bg-brand-surface hover:bg-brand-champagne shadow-sm px-6 py-2 border border-brand-text/15 rounded-full font-medium text-brand-primaryText transition"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {(isDoador || isOng) && (
        <section className="mb-20">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-sans text-brand-text text-2xl">
              Publicações recentes
            </h2>
            <Link
              to="/publicacoes"
              className="font-semibold text-brand-primaryText underline"
            >
              Ver todas as publicações
            </Link>
          </div>

          {carregandoPublicacoes && (
            <p className="py-8 text-center text-brand-muted">
              Carregando publicações...
            </p>
          )}

          {!carregandoPublicacoes && erroPublicacoes && (
            <p role="alert" className="py-8 text-center text-red-600">
              {erroPublicacoes}
            </p>
          )}

          {!carregandoPublicacoes &&
            !erroPublicacoes &&
            publicacoesRecentes.length === 0 && (
              <p className="py-8 text-center text-brand-muted">
                Ainda não há publicações recentes.
              </p>
            )}

          {!carregandoPublicacoes &&
            !erroPublicacoes &&
            publicacoesRecentes.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {publicacoesRecentes.map((publicacao) => (
                  <Link
                    key={publicacao.id}
                    to={`/publicacoes/${publicacao.id}`}
                    aria-label={`Abrir publicação de ${publicacao.ong.name}`}
                    className="group overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <article>
                      <div className="flex items-center gap-2 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-semibold text-brand-primaryText">
                          {publicacao.ong.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-sm font-semibold text-brand-text">
                          {publicacao.ong.name}
                        </span>
                      </div>

                      {publicacao.imageUrl && (
                        <img
                          src={imagemUrl(publicacao.imageUrl) ?? ""}
                          alt={`Publicação de ${publicacao.ong.name}`}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      )}

                      <div className="p-4">
                        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
                          {publicacao.description}
                        </p>
                        <time
                          dateTime={publicacao.createdAt}
                          className="mt-3 block text-xs text-brand-muted"
                        >
                          {new Date(publicacao.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </time>
                        <span className="mt-3 inline-block text-sm font-semibold text-brand-primaryText underline">
                          Ver publicação
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
        </section>
      )}

      {/* ONGs em destaque */}
      {!user && (
        <section className="mb-20">
          <h2 className="mb-6 font-sans text-brand-text text-2xl">
            ONGs em destaque
          </h2>

          {loading && (
            <p className="py-8 text-brand-muted text-center">
              Carregando ONGs...
            </p>
          )}

          {error && (
            <p role="alert" className="py-8 text-brand-muted text-center">
              {error}
            </p>
          )}

          {!loading && !error && featuredOngs.length === 0 && (
            <p className="py-8 text-brand-muted text-center">
              Ainda não há ONGs cadastradas.
            </p>
          )}

          {!loading && featuredOngs.length > 0 && (
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
              {featuredOngs.map((ong) => (
                <div
                  key={ong.id}
                  className="group relative flex flex-col bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-border hover:border-brand-text/30 rounded-2xl transition-all"
                >

                  <div className="flex items-center gap-3 mb-3 pr-10">
                    <div className="flex justify-center items-center bg-brand-champagne rounded-full ring-2 ring-brand-primary/20 w-11 h-11 font-sans font-bold text-brand-primaryText shrink-0">
                      {ong.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-brand-text group-hover:text-brand-primaryText text-base transition-colors">
                        {ong.name}
                      </h3>
                      {(ong.city || ong.state) && (
                        <span className="text-brand-muted text-xs">
                          {[ong.city, ong.state].filter(Boolean).join(" - ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2 text-sm">
                    <span className="text-[#DBB24C]">★</span>
                    <span className="font-medium text-brand-text">
                      {Number(ong.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-brand-text/40">
                      ({ong.totalReviews ?? 0})
                    </span>
                  </div>
                  <p className="flex-1 mb-4 text-brand-muted text-sm line-clamp-3 leading-relaxed">
                    {ong.category || "Categoria não informada."}{" "}
                  </p>
                  <Link
                    to={`/ongs/${ong.id}`}
                    className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs mt-auto px-4 py-2.5 rounded-full font-semibold text-brand-onPrimary text-xs text-center transition-all"
                  >
                    Ver perfil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
