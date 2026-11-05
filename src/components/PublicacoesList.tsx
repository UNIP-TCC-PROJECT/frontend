import { useEffect, useState } from "react";
import { api } from "../services/api";
import PublicationCard, { type PublicationCardData } from "./PublicationCard";

type Publicacao = Omit<PublicationCardData, "ong">;

interface PublicacoesResponse {
  items: Publicacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PublicacoesListProps {
  ongId: number;
  ongName: string;
  profileImage?: string;
}

export default function PublicacoesList({ ongId, ongName, profileImage }: PublicacoesListProps) {
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
    <section className="mb-8">
      <h2 className="mb-5 text-2xl font-sans text-brand-text">
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
          <div className="space-y-8">
            {publicacoes.map((publicacao) => (
              <PublicationCard
                key={publicacao.id}
                publication={{
                  ...publicacao,
                  ong: { id: ongId, name: ongName, profileImage },
                }}
              />
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
