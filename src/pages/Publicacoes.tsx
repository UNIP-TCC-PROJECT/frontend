import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imagemUrl } from "../services/api";
import { CATEGORIES } from "../services/transparency";
import type { PostsPage } from "../services/transparency";
import { CONTENT_RESTRICTED_MESSAGE, type ContentAccess } from "../services/organizations";
import { useAuth } from "../context/useAuth";
import FavoritoButton from "../components/FavoritoButton";
import PublicacaoForm from "../components/PublicacaoForm";
import PostCard from "../components/transparency/PostCard";

export default function Publicacoes() {
  const { user } = useAuth();
  const [data, setData] = useState<PostsPage | null>(null);
  const [pagina, setPagina] = useState(1);
  const [categoria, setCategoria] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [contentAccess, setContentAccess] = useState<ContentAccess | null>(null);

  useEffect(() => {
    if (user?.type !== "ONG") {
      setContentAccess(null);
      return;
    }
    let ativo = true;
    api.get<ContentAccess>("/organizations/me/content-access")
      .then(({ data }) => { if (ativo) setContentAccess(data); })
      .catch(() => { if (ativo) setContentAccess({ canSubmit: false, canPublishWithoutReview: false }); });
    return () => { ativo = false; };
  }, [user?.id, user?.type]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    api
      .get<PostsPage>("/publicacoes", {
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
  }, [pagina, categoria, atualizacao]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-brand-primaryDark bg-brand-primary text-brand-onPrimary" : "border-brand-border bg-brand-surface text-brand-primaryText hover:bg-brand-champagne"}`;

  return (
    <main className="py-8">
      <h1 className="mb-2 font-sans text-brand-text text-3xl">
        Publicações das ONGs
      </h1>
      <p className="mb-6 text-brand-muted text-sm">
        Acompanhe as atualizações de ONGs com CNPJ conferido. Publicações de
        ONGs sem Medalha Branca passam por análise antes de aparecer; com a
        Medalha Branca, podem ser exibidas sem análise prévia.
      </p>

      {user?.type === "ONG" && user.status === "ATIVO" && contentAccess?.canSubmit && (
        <PublicacaoForm
          onCreated={() => {
            setPagina(1);
            setAtualizacao((v) => v + 1);
          }}
        />
      )}
      {user?.type === "ONG" && user.status === "ATIVO" && contentAccess && !contentAccess.canSubmit && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {contentAccess.restricted ? CONTENT_RESTRICTED_MESSAGE : (
            <>
              Para enviar publicações, conclua a conferência automática do CNPJ. Depois disso, suas publicações passam por análise; com a Medalha Branca, ficam disponíveis imediatamente.
              <Link to="/minha-instituicao" className="ml-1 font-semibold underline">Verificar instituição</Link>
            </>
          )}
        </p>
      )}
      {user?.type === "ONG" && contentAccess?.canSubmit && !contentAccess.canPublishWithoutReview && (
        <p className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Suas publicações e a imagem enviada serão exibidas juntas depois da aprovação da plataforma. Documentos anexados continuam com análise própria.
        </p>
      )}

      <div
        className="flex flex-wrap gap-2 mb-5"
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
          Ainda não há publicações{categoria ? " nesta categoria" : ""}.
        </p>
      )}

      {!carregando && !erro && data && data.items.length > 0 && (
        <>
          <div className="gap-8 grid md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-2 px-1">
                  <Link
                    to={`/ongs/${p.ongId}`}
                    className="flex items-center gap-2 min-w-0"
                  >
                    {p.ong?.profileImage ? (
                      <img
                        src={imagemUrl(p.ong.profileImage) ?? ""}
                        alt=""
                        className="rounded-full w-9 h-9 object-cover shrink-0"
                      />
                    ) : (
                      <span className="flex justify-center items-center bg-brand-champagne rounded-full w-9 h-9 font-semibold text-brand-primaryText shrink-0">
                        {p.ong?.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="font-semibold text-brand-text truncate">
                      {p.ong?.name}
                    </span>
                  </Link>
                  {user?.type === "DOADOR" && user.status === "ATIVO" && (
                    <FavoritoButton ongId={p.ongId} />
                  )}
                </div>
                <PostCard post={p} />
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <nav
              aria-label="Paginação do feed"
              className="flex justify-center items-center gap-4 mt-8"
            >
              <button
                type="button"
                onClick={() => setPagina((v) => v - 1)}
                disabled={pagina === 1}
                className="disabled:opacity-50 px-4 py-2 border border-brand-border rounded-full text-brand-text text-sm"
              >
                Anterior
              </button>
              <span className="text-brand-muted text-sm">
                Página {pagina} de {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPagina((v) => v + 1)}
                disabled={pagina === data.totalPages}
                className="disabled:opacity-50 px-4 py-2 border border-brand-border rounded-full text-brand-text text-sm"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
