import { useEffect, useState } from "react";
import { api } from "../services/api";
import { CATEGORIES } from "../services/transparency";
import type { PostsPage } from "../services/transparency";
import PostCard from "./transparency/PostCard";

interface PublicacoesListProps {
  ongId: number;
}

/** Feed de publicações da ONG: cards, filtro por categoria e paginação. */
export default function PublicacoesList({ ongId }: PublicacoesListProps) {
  const [data, setData] = useState<PostsPage | null>(null);
  const [pagina, setPagina] = useState(1);
  const [categoria, setCategoria] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    api
      .get<PostsPage>(`/publicacoes/ong/${ongId}`, {
        params: {
          page: pagina,
          limit: 5,
          ...(categoria ? { category: categoria } : {}),
        },
      })
      .then(({ data }) => ativo && setData(data))
      .catch(
        () => ativo && setErro("Não foi possível carregar as publicações."),
      )
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [ongId, pagina, categoria]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-brand-primaryDark bg-brand-primary text-brand-onPrimary" : "border-brand-border bg-brand-surface text-brand-primaryText hover:bg-brand-champagne"}`;

  return (
    <section aria-labelledby="pub-titulo" className="space-y-4">
      <h2 id="pub-titulo" className="font-sans text-brand-text text-xl">
        Publicações da ONG
      </h2>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por categoria"
      >
        <button
          type="button"
          className={chip(categoria === "")}
          aria-pressed={categoria === ""}
          onClick={() => {
            setCategoria("");
            setPagina(1);
          }}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={chip(categoria === c.id)}
            aria-pressed={categoria === c.id}
            onClick={() => {
              setCategoria(c.id);
              setPagina(1);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-brand-muted text-xs">
        Publicações são conteúdo da própria instituição. Apenas arquivos
        analisados pela plataforma aparecem como evidências; o selo de cada
        publicação mostra o que já foi analisado.
      </p>

      {carregando && (
        <p className="text-brand-muted" aria-live="polite">
          Carregando publicações...
        </p>
      )}
      {!carregando && erro && (
        <p role="alert" className="text-red-600">
          {erro}
        </p>
      )}
      {!carregando && !erro && data?.items.length === 0 && (
        <p className="bg-brand-surface p-6 border border-brand-border rounded-2xl text-brand-muted">
          {categoria
            ? "Nenhuma publicação nesta categoria."
            : "Esta ONG ainda não publicou nada."}
        </p>
      )}

      {!carregando && !erro && data && data.items.length > 0 && (
        <>
          <div className="space-y-5">
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <nav
              aria-label="Paginação das publicações"
              className="flex justify-center items-center gap-4"
            >
              <button
                type="button"
                onClick={() => setPagina((a) => a - 1)}
                disabled={pagina === 1}
                className="disabled:opacity-50 px-4 py-2 border border-brand-border rounded-full text-brand-text text-sm disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-brand-muted text-sm">
                Página {pagina} de {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPagina((a) => a + 1)}
                disabled={pagina === data.totalPages}
                className="disabled:opacity-50 px-4 py-2 border border-brand-border rounded-full text-brand-text text-sm disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
