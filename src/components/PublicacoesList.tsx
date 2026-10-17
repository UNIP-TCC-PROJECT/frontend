import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imagemUrl } from "../services/api";

interface Publicacao {
  id: number;
  description: string;
  imageUrl: string;
  ongId: number;
  createdAt: string;
}

interface PublicacoesResponse {
  items: Publicacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PublicacoesListProps {
  ongId: number;
}

export default function PublicacoesList({ ongId }: PublicacoesListProps) {
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro("");

    api
      .get<PublicacoesResponse>(`/publicacoes/ong/${ongId}`, {
        params: { page: pagina, limit: 5 },
      })
      .then(({ data }) => {
        if (!ativo) return;
        setPublicacoes(data.items);
        setTotalPaginas(data.totalPages);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as publicações.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [ongId, pagina]);

  return (
    <section className="mb-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-sm">
      <h2 className="mb-5 text-xl font-sans text-brand-text">
        Publicações da ONG
      </h2>

      {carregando && (
        <p className="text-brand-muted">Carregando publicações...</p>
      )}

      {!carregando && erro && (
        <p role="alert" className="text-red-600">
          {erro}
        </p>
      )}

      {!carregando && !erro && publicacoes.length === 0 && (
        <p className="text-brand-muted">
          Esta ONG ainda não publicou nada.
        </p>
      )}

      {!carregando && !erro && publicacoes.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {publicacoes.map((publicacao) => (
              <Link
                key={publicacao.id}
                to={`/publicacoes/${publicacao.id}`}
                aria-label={`Ver publicação: ${publicacao.description}`}
                className="group block overflow-hidden rounded-xl border border-brand-border transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <article>
                  <img
                    src={imagemUrl(publicacao.imageUrl) ?? ""}
                    alt="Imagem da publicação da ONG"
                    className="h-56 w-full object-cover transition group-hover:brightness-95"
                  />

                  <div className="p-4">
                    <p className="whitespace-pre-wrap text-brand-text">
                      {publicacao.description}
                    </p>
                    <time
                      dateTime={publicacao.createdAt}
                      className="mt-3 block text-sm text-brand-muted"
                    >
                      {new Date(publicacao.createdAt).toLocaleDateString(
                        "pt-BR",
                      )}
                    </time>
                    <span className="mt-3 inline-block font-medium text-brand-primaryText underline">
                      Ver publicação
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação das publicações"
              className="mt-6 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => setPagina((atual) => atual - 1)}
                disabled={pagina === 1}
                className="rounded-lg border border-brand-border px-4 py-2 text-brand-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm text-brand-muted">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                onClick={() => setPagina((atual) => atual + 1)}
                disabled={pagina === totalPaginas}
                className="rounded-lg border border-brand-border px-4 py-2 text-brand-text disabled:cursor-not-allowed disabled:opacity-50"
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
