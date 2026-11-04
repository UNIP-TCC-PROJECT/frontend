import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaComments } from "react-icons/fa";
import { api, imagemUrl } from "../services/api";

interface Interesse {
  id: number;
  doadorId: number;
  createdAt: string;
  doador: { id: number; name: string; profileImage?: string | null };
}

export default function InteressesOng() {
  const navigate = useNavigate();
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abrindo, setAbrindo] = useState<number | null>(null);

  useEffect(() => {
    let ativo = true;
    api
      .get<Interesse[]>("/interesses/minha-ong")
      .then(({ data }) => {
        if (ativo) setInteresses(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os doadores interessados.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function abrirConversa(doadorId: number) {
    setAbrindo(doadorId);
    setErro("");
    try {
      const { data } = await api.post<{ id: number }>(`/conversas/doadores/${doadorId}`);
      navigate(`/conversas/${data.id}`);
    } catch {
      setErro("Não foi possível iniciar a conversa. Verifique se o interesse ainda está ativo.");
    } finally {
      setAbrindo(null);
    }
  }

  return (
    <main className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-3xl text-brand-text">Doadores interessados</h1>
          <p className="mt-1 text-brand-muted">Pessoas que demonstraram interesse em ajudar sua ONG.</p>
        </div>
        <button onClick={() => navigate("/conversas")} className="rounded-lg border border-brand-border px-4 py-2 font-medium text-brand-primaryText hover:bg-brand-champagne">
          Ver mensagens
        </button>
      </div>

      {erro && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{erro}</p>}
      {carregando ? (
        <p className="py-10 text-center text-brand-muted">Carregando interessados...</p>
      ) : interesses.length === 0 ? (
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-brand-text">Ainda não há doadores interessados</h2>
          <p className="mt-2 text-brand-muted">Quando alguém demonstrar interesse em ajudar, aparecerá aqui.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {interesses.map(({ id, doador, createdAt }) => {
            const foto = imagemUrl(doador.profileImage);
            return (
              <article key={id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  {foto ? (
                    <img src={foto} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-bold text-brand-primaryText">{doador.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-brand-text">{doador.name}</h2>
                    <p className="text-sm text-brand-muted">Interessado desde {new Date(createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void abrirConversa(doador.id)}
                  disabled={abrindo !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 font-semibold text-brand-onPrimary hover:bg-brand-primaryDark disabled:opacity-60"
                >
                  <FaComments aria-hidden="true" />
                  {abrindo === doador.id ? "Abrindo..." : "Iniciar conversa"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
