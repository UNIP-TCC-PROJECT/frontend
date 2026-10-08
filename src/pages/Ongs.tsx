import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { api } from "../services/api";
import { CATEGORIES as categories } from "../constants/categories";

export default function Ongs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestedCategory = searchParams.get("categoria") ?? "";
  const category = categories.some((item) => item.value === requestedCategory)
    ? requestedCategory
    : "";

  function selectCategory(value: string) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set("categoria", value);
    } else {
      nextParams.delete("categoria");
    }

    setSearchParams(nextParams);
  }

  useEffect(() => {
    async function fetchOngs() {
      try {
        const response = await api.get("/users/ongs");

        setOngs(response.data);
      } catch (error) {
        console.error("Erro ao buscar ONGs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOngs();
  }, []);

  const filteredOngs = ongs.filter((ong: any) => {
    const matchName = ong?.name?.toLowerCase()?.includes(search.toLowerCase());

    const matchCategory = category ? ong?.category === category : true;

    return matchName && matchCategory;
  });

  return (
    <>
      {/* Título */}
      <h1 className="mb-2 font-sans text-brand-text text-3xl md:text-4xl">
        ONGs disponíveis
      </h1>

      <p className="mb-8 text-brand-muted">
        Encontre instituições confiáveis para apoiar
      </p>

      {/* Filtros */}
      <div className="flex md:flex-row flex-col md:items-center gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ONG..."
          className="bg-brand-surface shadow-sm px-4 py-2 border border-brand-text/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-goldText/30 w-full md:w-72"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => selectCategory(cat.value)}
              className={`px-5 py-2 rounded-full border text-sm font-medium shadow-sm transition ${
                category === cat.value
                  ? "bg-brand-primary text-brand-onPrimary border-brand-primary"
                  : "bg-brand-surface text-brand-primaryText border-brand-text/15 hover:bg-brand-champagne"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {category && (
            <button
              onClick={() => selectCategory("")}
              className="bg-brand-text/10 ml-2 px-4 py-2 border border-brand-text/15 rounded-full text-brand-muted text-xs"
            >
              Limpar filtro
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-10 text-brand-muted text-center">
          Carregando ONGs...
        </div>
      )}

      {/* Lista de ONGs */}
      {!loading && (
        <div className="gap-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOngs.length === 0 && (
            <div className="col-span-full py-12 text-brand-muted text-center">
              Nenhuma ONG encontrada.
            </div>
          )}

          {filteredOngs.map((ong: any) => (
            <div
              key={ong.id}
              className="group flex flex-col bg-brand-surface shadow-xs hover:shadow-md p-6 border border-brand-border hover:border-brand-text/30 rounded-2xl transition-all"
            >
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="flex justify-center items-center bg-brand-champagne rounded-full ring-2 ring-brand-primary/20 w-12 h-12 font-sans font-bold text-brand-primaryText text-lg shrink-0">
                  {ong.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sans font-bold text-brand-text group-hover:text-brand-primaryText text-base line-clamp-1 transition-colors">
                      {ong.name}
                    </h3>
                    {ong.medalhaVerde && (
                      <FaCheckCircle
                        className="text-brand-gold shrink-0"
                        title="CNPJ verificado na Receita Federal"
                      />
                    )}
                  </div>
                  {ong?.city && (
                    <p className="mt-0.5 text-brand-muted text-[11px]">{ong.city}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 mb-3.5">
                {ong.category ? (
                  <span className="bg-brand-champagne px-3 py-1 rounded-full font-semibold text-brand-goldText text-[10px] tracking-wider uppercase">
                    {ong.category}
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1 bg-brand-background px-2.5 py-1 border border-brand-border rounded-full text-xs">
                  <span className="text-amber-500">★</span>
                  <span className="font-bold text-brand-text">
                    {Number(ong.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-brand-muted text-[10px]">
                    ({ong.totalReviews ?? 0})
                  </span>
                </div>
              </div>

              <p className="flex-1 mb-4 text-brand-muted text-xs leading-relaxed line-clamp-3">
                {ong.description || "Sem descrição disponível."}
              </p>

              <button
                onClick={() => navigate(`/ongs/${ong.id}`)}
                className="bg-brand-primary hover:bg-brand-primaryDark shadow-xs mt-auto px-4 py-2.5 rounded-full font-semibold text-brand-onPrimary text-xs text-center transition-all"
              >
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
