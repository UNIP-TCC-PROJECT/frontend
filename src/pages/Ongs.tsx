import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { api } from "../services/api";
import { CATEGORIES as categories } from "../constants/categories";
import { useAuth } from "../context/useAuth";
import FavoritoButton from "../components/FavoritoButton";
import SelosDaOng from "../components/selos/SelosDaOng";
import { carregarSelos, isCadastroVerificado, posicaoNivelTransparencia } from "../services/selos";
import type { SelosPorOng } from "../services/selos";
import { LEVEL_ORDER, levelNames } from "../services/transparency";
import type { LevelCode } from "../services/transparency";

interface Ong {
  id: number;
  name: string;
  category?: string | null;
  city?: string | null;
  description?: string | null;
  averageRating?: number | string | null;
  totalReviews?: number | null;
}

// Permite encontrar nomes com ou sem acentos, por exemplo "São" e "Sao".
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export default function Ongs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [somenteCadastroVerificado, setSomenteCadastroVerificado] = useState(false);
  const [nivelMinimoTransparencia, setNivelMinimoTransparencia] = useState<LevelCode | "">("");
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [selosPorOng, setSelosPorOng] = useState<SelosPorOng>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

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

  function limparFiltros() {
    setSearch("");
    setSomenteCadastroVerificado(false);
    setNivelMinimoTransparencia("");
    selectCategory("");
  }

  useEffect(() => {
    let ativo = true;

    async function fetchOngs() {
      try {
        const response = await api.get<Ong[]>("/users/ongs");
        if (ativo) setOngs(response.data);
        // As medalhas vêm de um endpoint próprio; se ele falhar, a lista continua funcionando sem elas.
        carregarSelos(response.data.map((ong) => ong.id))
          .then((selos) => ativo && setSelosPorOng(selos))
          .catch(() => undefined);
      } catch (error) {
        console.error("Erro ao buscar ONGs:", error);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void fetchOngs();
    return () => {
      ativo = false;
    };
  }, []);

  const buscaNormalizada = normalizarTexto(search.trim());
  const temFiltros = Boolean(
    buscaNormalizada || category || somenteCadastroVerificado || nivelMinimoTransparencia,
  );

  const filteredOngs = ongs.filter((ong) => {
    const matchName = normalizarTexto(ong.name ?? "").includes(buscaNormalizada);
    const matchCategory = !category || ong.category === category;
    const selos = selosPorOng[ong.id];
    const matchCadastroVerificado = !somenteCadastroVerificado || isCadastroVerificado(selos);
    const matchNivelTransparencia =
      !nivelMinimoTransparencia || posicaoNivelTransparencia(selos) >= LEVEL_ORDER.indexOf(nivelMinimoTransparencia);

    return matchName && matchCategory && matchCadastroVerificado && matchNivelTransparencia;
  });

  return (
    <>
      <h1 className="mb-2 font-sans text-brand-text text-3xl md:text-4xl">
        ONGs disponíveis
      </h1>

      <p className="mb-8 text-brand-muted">
        Encontre instituições confiáveis para apoiar
      </p>

      {user?.type === "DOADOR" && user.status === "ATIVO" && (
        <div className="mb-6">
          <Link
            to="/ongs-favoritas"
            className="inline-flex items-center gap-2 rounded-full border border-brand-primary bg-brand-surface px-5 py-2.5 text-sm font-semibold text-brand-primaryText shadow-sm transition-colors hover:bg-brand-champagne"
          >
            <FaStar aria-hidden="true" className="text-brand-gold" />
            Minhas ONGs favoritas
          </Link>
        </div>
      )}

      {/* Os filtros são combinados com a operação E (AND). */}
      <section
        aria-label="Filtros de ONGs"
        className="mb-8 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm"
      >
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label htmlFor="buscar-ong" className="mb-2 block text-sm font-semibold text-brand-text">
              Buscar por nome
            </label>
            <input
              id="buscar-ong"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Digite o nome da ONG..."
              className="w-full rounded-lg border border-brand-text/15 bg-brand-surface px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-goldText/30"
            />
          </div>

          {temFiltros && (
            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-full border border-brand-text/15 px-4 py-2 text-sm font-semibold text-brand-primaryText transition hover:bg-brand-champagne"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        <div className="mb-5">
          <p className="mb-3 text-sm font-semibold text-brand-text">Área de atuação</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectCategory("")}
              aria-pressed={!category}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                !category
                  ? "border-brand-primary bg-brand-primary text-brand-onPrimary"
                  : "border-brand-text/15 bg-brand-surface text-brand-primaryText hover:bg-brand-champagne"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => selectCategory(cat.value)}
                aria-pressed={category === cat.value}
                className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                  category === cat.value
                    ? "border-brand-primary bg-brand-primary text-brand-onPrimary"
                    : "border-brand-text/15 bg-brand-surface text-brand-primaryText hover:bg-brand-champagne"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-brand-text">
            <input
              type="checkbox"
              checked={somenteCadastroVerificado}
              onChange={(event) => setSomenteCadastroVerificado(event.target.checked)}
              className="h-4 w-4 accent-brand-primary"
            />
            <FaCheckCircle aria-hidden="true" className="text-emerald-600" />
            Somente com cadastro verificado
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-brand-text">
            Transparência mínima
            <select
              value={nivelMinimoTransparencia}
              onChange={(event) => setNivelMinimoTransparencia(event.target.value as LevelCode | "")}
              className="rounded-lg border border-brand-text/15 bg-brand-surface px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-goldText/30"
            >
              <option value="">Qualquer nível</option>
              {LEVEL_ORDER.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {levelNames[nivel]} ou superior
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!loading && !erro && (
        <p aria-live="polite" className="mb-5 text-sm text-brand-muted">
          {filteredOngs.length} {filteredOngs.length === 1 ? "ONG encontrada" : "ONGs encontradas"}
        </p>
      )}

      {loading && (
        <div className="py-10 text-center text-brand-muted">Carregando ONGs...</div>
      )}

      {!loading && erro && (
        <div role="alert" className="py-12 text-center text-red-600">
          Não foi possível carregar as ONGs. Atualize a página para tentar novamente.
        </div>
      )}

      {!loading && !erro && filteredOngs.length === 0 && (
        <div className="rounded-2xl border border-brand-border bg-brand-surface px-6 py-12 text-center">
          <h2 className="mb-2 text-lg font-semibold text-brand-text">
            {temFiltros ? "Nenhuma ONG encontrada" : "Nenhuma ONG disponível no momento"}
          </h2>
          <p className="mb-5 text-sm text-brand-muted">
            {temFiltros
              ? "Tente mudar os critérios ou limpar os filtros para ver outras ONGs."
              : "Ainda não existem ONGs disponíveis para exibir."}
          </p>
          {temFiltros && (
            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-onPrimary transition hover:bg-brand-primaryDark"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {!loading && !erro && filteredOngs.length > 0 && (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOngs.map((ong) => (
            <div
              key={ong.id}
              className="group relative flex flex-col rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-xs transition-all hover:border-brand-text/30 hover:shadow-md"
            >
              {user?.type === "DOADOR" && user.status === "ATIVO" && (
                <div className="absolute right-4 top-4 z-10">
                  <FavoritoButton ongId={ong.id} iconOnly />
                </div>
              )}

              <div className="mb-3.5 flex items-start gap-3.5 pr-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-sans text-lg font-bold text-brand-primaryText ring-2 ring-brand-primary/20">
                  {ong.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="line-clamp-1 font-sans text-base font-bold text-brand-text transition-colors group-hover:text-brand-primaryText">
                      {ong.name}
                    </h3>
                  </div>
                  {ong.city && (
                    <p className="mt-0.5 text-[11px] text-brand-muted">{ong.city}</p>
                  )}
                </div>
              </div>

              <div className="mb-3.5 min-h-[1.75rem]">
                <SelosDaOng selos={selosPorOng[ong.id]} />
              </div>

              <div className="mb-3.5 flex items-center justify-between gap-2">
                {ong.category ? (
                  <span className="rounded-full bg-brand-champagne px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-goldText">
                    {categories.find((cat) => cat.value === ong.category)?.label ?? ong.category}
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1 rounded-full border border-brand-border bg-brand-background px-2.5 py-1 text-xs">
                  <span className="text-amber-500">★</span>
                  <span className="font-bold text-brand-text">
                    {Number(ong.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-brand-muted">
                    ({ong.totalReviews ?? 0})
                  </span>
                </div>
              </div>

              <p className="mb-4 line-clamp-3 flex-1 text-xs leading-relaxed text-brand-muted">
                {ong.description || "Sem descrição disponível."}
              </p>

              <button
                type="button"
                onClick={() => navigate(`/ongs/${ong.id}`)}
                className="mt-auto rounded-full bg-brand-primary px-4 py-2.5 text-center text-xs font-semibold text-brand-onPrimary shadow-xs transition-all hover:bg-brand-primaryDark"
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
