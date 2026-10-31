import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imagemUrl } from "../services/api";
import { CATEGORIES } from "../services/transparency";
import type { PostsPage } from "../services/transparency";
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

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");
    api
      .get<PostsPage>("/publicacoes", { params: { page: pagina, limit: 5, ...(categoria ? { category: categoria } : {}) } })
      .then(({ data }) => ativo && setData(data))
      .catch(() => ativo && setErro("Não foi possível carregar as publicações."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [pagina, categoria, atualizacao]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-brand-primaryDark bg-brand-primary text-brand-onPrimary" : "border-brand-border bg-brand-surface text-brand-primaryText hover:bg-brand-champagne"}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-sans text-brand-text">Publicações das ONGs</h1>
      <p className="mb-6 text-sm text-brand-muted">Acompanhe o que as instituições validadas estão fazendo. Cada publicação mostra o que já foi analisado pela plataforma.</p>

      {user?.type === "ONG" && user.status === "ATIVO" && (
        <PublicacaoForm onCreated={() => { setPagina(1); setAtualizacao((v) => v + 1); }} />
      )}

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
        <button type="button" className={chip(categoria === "")} aria-pressed={categoria === ""} onClick={() => { setCategoria(""); setPagina(1); }}>Todas</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={chip(categoria === c.id)} aria-pressed={categoria === c.id} onClick={() => { setCategoria(c.id); setPagina(1); }}>{c.label}</button>
        ))}
      </div>

      {carregando && <p className="text-brand-muted" aria-live="polite">Carregando publicações...</p>}
      {!carregando && erro && <p role="alert" className="text-red-600">{erro}</p>}
      {!carregando && !erro && data?.items.length === 0 && <p className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-brand-muted">Ainda não há publicações{categoria ? " nesta categoria" : ""}.</p>}

      {!carregando && !erro && data && data.items.length > 0 && (
        <>
          <div className="space-y-8">
            {data.items.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 px-1">
                  <Link to={`/ongs/${p.ongId}`} className="flex min-w-0 items-center gap-2">
                    {p.ong?.profileImage ? (
                      <img src={imagemUrl(p.ong.profileImage) ?? ""} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-semibold text-brand-primaryText">{p.ong?.name.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="truncate font-semibold text-brand-text">{p.ong?.name}</span>
                  </Link>
                  {user?.type === "DOADOR" && user.status === "ATIVO" && <FavoritoButton ongId={p.ongId} />}
                </div>
                <PostCard post={p} />
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <nav aria-label="Paginação do feed" className="mt-8 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setPagina((v) => v - 1)} disabled={pagina === 1} className="rounded-full border border-brand-border px-4 py-2 text-sm text-brand-text disabled:opacity-50">Anterior</button>
              <span className="text-sm text-brand-muted">Página {pagina} de {data.totalPages}</span>
              <button type="button" onClick={() => setPagina((v) => v + 1)} disabled={pagina === data.totalPages} className="rounded-full border border-brand-border px-4 py-2 text-sm text-brand-text disabled:opacity-50">Próxima</button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
