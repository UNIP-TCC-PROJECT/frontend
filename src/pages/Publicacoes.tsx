import { useEffect, useState } from "react";

import { api } from "../services/api";
import { useAuth } from "../context/useAuth";
import PublicacaoForm from "../components/PublicacaoForm";
import PublicationCard, { type PublicationCardData } from "../components/PublicationCard";

interface PublicacoesResponse {
  items: PublicationCardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Publicacoes() {
  const { user } = useAuth();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [atualizacao, setAtualizacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro("");

    api
      .get<PublicacoesResponse>("/publicacoes", {
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
  }, [pagina, atualizacao]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">


      {user?.type === "ONG" && user.status === "ATIVO" && (
        <PublicacaoForm
          onCreated={() => {
            setPagina(1);
            setAtualizacao((valor) => valor + 1);
          }}
        />
      )}

      {carregando && (
        <p className="text-brand-muted">Carregando publicações...</p>
      )}

      {!carregando && erro && (
        <p role="alert" className="text-red-600">
          {erro}
        </p>
      )}

      {!carregando && !erro && publicacoes.length === 0 && (
        <p className="text-brand-muted">Ainda não há publicações.</p>
      )}

      {!carregando && !erro && publicacoes.length > 0 && (
        <>
          <div className="space-y-6">
            {publicacoes.map((publicacao) => (
              <PublicationCard key={publicacao.id} publication={publicacao} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação do feed"
              className="mt-6 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => setPagina((valor) => valor - 1)}
                disabled={pagina === 1}
                className="rounded-lg border border-brand-border px-4 py-2 text-brand-text disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm text-brand-muted">
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                onClick={() => setPagina((valor) => valor + 1)}
                disabled={pagina === totalPaginas}
                className="rounded-lg border border-brand-border px-4 py-2 text-brand-text disabled:opacity-50"
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
