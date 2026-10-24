import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegClock } from "react-icons/fa";

import { api, imagemUrl } from "../services/api";
import { useAuth } from "../context/useAuth";
import PublicacaoForm from "../components/PublicacaoForm";
import FavoritoButton from "../components/FavoritoButton";

interface Publicacao {
  id: number;
  description: string;
  imageUrl: string;
  ongId: number;
  ong: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  createdAt: string;
}

interface PublicacoesResponse {
  items: Publicacao[];
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
      <h1 className="mb-6 text-3xl font-sans text-brand-text">
        Publicações das ONGs
      </h1>

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
              <article
                key={publicacao.id}
                className="mx-auto w-full max-w-xl space-y-6 bg-[#FFBE1F] p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-[2px] border-[#A51645] bg-[#FFD43B] p-2 shadow-[4px_4px_0_#5B4210] sm:p-3">
                  <Link
                    to={`/ongs/${publicacao.ongId}`}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    {publicacao.ong.profileImage ? (
                      <img
                        src={imagemUrl(publicacao.ong.profileImage) ?? ""}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-full border-2 border-[#A51645] bg-white object-cover sm:h-8 sm:w-8"
                      />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#A51645] bg-[#F4EBDD] text-sm font-bold text-black sm:h-8 sm:w-8 sm:text-base">
                        {publicacao.ong.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="break-words text-sm font-bold leading-tight text-black sm:text-base">
                      {publicacao.ong.name}
                    </span>
                  </Link>

                  {user?.type === "DOADOR" && user.status === "ATIVO" && (
                    <FavoritoButton ongId={publicacao.ongId} />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xl font-extrabold text-black sm:text-3xl">
                  <time dateTime={publicacao.createdAt}>
                    {new Date(publicacao.createdAt).toLocaleDateString("pt-BR")}
                  </time>

                  <time
                    dateTime={publicacao.createdAt}
                    className="flex items-center gap-3"
                  >
                    <FaRegClock
                      aria-hidden="true"
                      className="text-3xl sm:text-5xl"
                    />
                    {new Date(publicacao.createdAt).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )}
                  </time>
                </div>

                <div className="border-[4px] border-[#A51645] bg-[#FFD43B] p-2 shadow-[8px_8px_0_#5B4210] sm:p-3">
                  <img
                    src={imagemUrl(publicacao.imageUrl) ?? ""}
                    alt={`Publicação de ${publicacao.ong.name}`}
                    className="aspect-square w-full object-cover"
                  />
                </div>

                <div className="border-[3px] border-[#A51645] bg-[#FFD43B] p-4 shadow-[6px_6px_0_#5B4210] sm:p-5">
                  <p className="whitespace-pre-wrap break-words text-base font-medium leading-relaxed text-black sm:text-lg">
                    {publicacao.description}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/publicacoes/${publicacao.id}`}
                    className="border-[4px] border-[#A51645] bg-[#FFD43B] px-6 py-3 text-lg font-extrabold text-[#A51645] shadow-[6px_6px_0_#5B4210] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_#5B4210] sm:px-8 sm:text-2xl"
                  >
                    Ver publicação
                  </Link>
                </div>
              </article>
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