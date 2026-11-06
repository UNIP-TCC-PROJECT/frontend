import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { api, imagemUrl } from "../services/api";

interface Conversa {
  id: number;
  doadorId: number;
  ongId: number;
  ultimaMensagemEm: string | null;
  createdAt: string;
  doador: { id: number; name: string; profileImage?: string | null };
  ong: { id: number; name: string; profileImage?: string | null };
}

interface Mensagem {
  id: number;
  conversaId: number;
  remetenteId: number;
  texto: string;
  createdAt: string;
}

const ATUALIZACAO_MS = 5000;

const mesmaLista = (a: Conversa[], b: Conversa[]) =>
  a.length === b.length &&
  a.every(
    (c, i) => c.id === b[i].id && c.ultimaMensagemEm === b[i].ultimaMensagemEm,
  );

const mesmasMensagens = (a: Mensagem[], b: Mensagem[]) =>
  a.length === b.length &&
  a.every((m, i) => m.id === b[i].id && m.texto === b[i].texto);

export default function Conversas() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimMensagens = useRef<HTMLDivElement>(null);
  const envios = useRef(0);
  const conversaSelecionada = useMemo(
    () => conversas.find((conversa) => String(conversa.id) === id),
    [conversas, id],
  );
  const outraParte = conversaSelecionada
    ? user?.type === "ONG"
      ? conversaSelecionada.doador
      : conversaSelecionada.ong
    : null;
  const avatarOutraParte = outraParte?.profileImage ? (
    <img
      src={imagemUrl(outraParte.profileImage) ?? ""}
      alt=""
      className="rounded-full w-10 h-10 object-cover shrink-0"
    />
  ) : (
    <span className="flex justify-center items-center bg-brand-champagne rounded-full w-10 h-10 font-bold text-brand-primaryText shrink-0">
      {outraParte?.name.charAt(0).toUpperCase() ?? "?"}
    </span>
  );

  useEffect(() => {
    if (user?.type !== "ONG" && user?.type !== "DOADOR") {
      setErro("A caixa de mensagens é exclusiva para doadores e ONGs.");
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    api
      .get<Conversa[]>("/conversas")
      .then(({ data }) => {
        if (ativo) setConversas(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar suas conversas.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [user?.id, user?.type]);

  useEffect(() => {
    if (!id) {
      setMensagens([]);
      return;
    }
    let ativo = true;
    setCarregandoMensagens(true);
    setErro("");
    api
      .get<Mensagem[]>(`/conversas/${id}/mensagens`)
      .then(({ data }) => {
        if (ativo) setMensagens(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível abrir esta conversa.");
      })
      .finally(() => {
        if (ativo) setCarregandoMensagens(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (user?.type !== "ONG" && user?.type !== "DOADOR") return;
    let ativo = true;
    let ocupado = false;
    const atualizar = async () => {
      if (document.hidden || ocupado) return;
      ocupado = true;
      const versao = envios.current;
      try {
        const [lista, mensagensNovas] = await Promise.all([
          api.get<Conversa[]>("/conversas"),
          id
            ? api.get<Mensagem[]>(`/conversas/${id}/mensagens`)
            : Promise.resolve(null),
        ]);
        if (!ativo || versao !== envios.current) return;
        setConversas((atuais) =>
          mesmaLista(atuais, lista.data) ? atuais : lista.data,
        );
        if (mensagensNovas)
          setMensagens((atuais) =>
            mesmasMensagens(atuais, mensagensNovas.data)
              ? atuais
              : mensagensNovas.data,
          );
      } catch {
        /* tenta de novo no próximo ciclo */
      } finally {
        ocupado = false;
      }
    };
    const timer = window.setInterval(() => void atualizar(), ATUALIZACAO_MS);
    const aoVoltar = () => void atualizar();
    window.addEventListener("focus", aoVoltar);
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", aoVoltar);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [id, user?.id, user?.type]);

  useEffect(() => {
    fimMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!id || !conteudo || enviando) return;
    setEnviando(true);
    setErro("");
    envios.current += 1;
    try {
      const { data } = await api.post<Mensagem>(`/conversas/${id}/mensagens`, {
        texto: conteudo,
      });
      setMensagens((atuais) => [...atuais, data]);
      setTexto("");
      setConversas((atuais) =>
        atuais.map((conversa) =>
          conversa.id === Number(id)
            ? { ...conversa, ultimaMensagemEm: data.createdAt }
            : conversa,
        ),
      );
    } catch {
      setErro("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (user?.type !== "ONG" && user?.type !== "DOADOR") {
    return (
      <main className="mx-auto p-8 max-w-3xl text-brand-muted text-center">
        {erro || "Acesso não disponível."}
      </main>
    );
  }

  return (
    <main className="py-6">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
        <div>
          <h1 className="font-sans text-brand-text text-3xl">Mensagens</h1>
          <p className="mt-1 text-brand-muted">
            Converse com ONGs e doadores com quem você tem contato.
          </p>
        </div>
        {user.type === "ONG" && (
          <Link
            className="font-semibold text-brand-primaryText text-sm underline"
            to="/interesses"
          >
            Ver doadores interessados
          </Link>
        )}
      </div>

      {erro && (
        <p role="alert" className="bg-red-50 mb-3 p-3 rounded-xl text-red-700">
          {erro}
        </p>
      )}
      <section className="grid md:grid-cols-[300px_1fr] bg-brand-surface shadow-sm border border-brand-border rounded-2xl min-h-[560px] overflow-hidden">
        <aside
          className={`${id ? "hidden md:block" : ""} border-brand-border md:border-r`}
        >
          <div className="px-4 py-3 border-brand-border border-b font-semibold text-brand-text">
            Suas conversas
          </div>
          {carregando ? (
            <p className="p-5 text-brand-muted text-sm">
              Carregando conversas...
            </p>
          ) : conversas.length === 0 ? (
            <p className="p-5 text-brand-muted text-sm">
              Você ainda não tem conversas.
            </p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {conversas.map((conversa) => {
                const pessoa =
                  user.type === "ONG" ? conversa.doador : conversa.ong;
                const foto = imagemUrl(pessoa.profileImage);
                return (
                  <button
                    key={conversa.id}
                    type="button"
                    onClick={() => navigate(`/conversas/${conversa.id}`)}
                    className={`flex w-full items-center gap-3 border-brand-border border-b p-4 text-left hover:bg-brand-champagne ${String(conversa.id) === id ? "bg-brand-champagne" : ""}`}
                  >
                    {foto ? (
                      <img
                        src={foto}
                        alt=""
                        className="rounded-full w-11 h-11 object-cover"
                      />
                    ) : (
                      <span className="flex justify-center items-center bg-brand-champagne rounded-full w-11 h-11 font-bold text-brand-primaryText shrink-0">
                        {pessoa.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-brand-text truncate">
                        {pessoa.name}
                      </span>
                      <span className="block text-brand-muted text-xs">
                        {conversa.ultimaMensagemEm
                          ? new Date(
                              conversa.ultimaMensagemEm,
                            ).toLocaleDateString("pt-BR")
                          : "Conversa iniciada"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className={`${id ? "" : "hidden md:flex"} min-h-[560px] flex-col`}>
          {!id ? (
            <div className="hidden md:flex flex-1 justify-center items-center p-8 text-brand-muted text-center">
              Selecione uma conversa para ver as mensagens.
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 p-4 border-brand-border border-b">
                <button
                  type="button"
                  onClick={() => navigate("/conversas")}
                  className="md:hidden hover:bg-brand-champagne p-2 rounded-lg text-brand-primaryText"
                  aria-label="Voltar para conversas"
                >
                  <FaArrowLeft />
                </button>
                {outraParte && user.type === "DOADOR" && conversaSelecionada ? (
                  <Link
                    to={`/ongs/${conversaSelecionada.ongId}`}
                    className="flex items-center gap-3 hover:bg-brand-champagne -m-2 p-2 rounded-xl min-w-0 text-brand-primaryText transition-colors"
                  >
                    {avatarOutraParte}
                    <span className="font-semibold hover:underline truncate">
                      {outraParte.name}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    {avatarOutraParte}
                    <h2 className="font-semibold text-brand-text truncate">
                      {outraParte?.name ?? "Conversa"}
                    </h2>
                  </div>
                )}
              </header>
              <div className="flex-1 space-y-3 bg-brand-background/50 p-4 sm:p-6 overflow-y-auto">
                {carregandoMensagens ? (
                  <p className="text-brand-muted text-sm text-center">
                    Carregando mensagens...
                  </p>
                ) : mensagens.length === 0 ? (
                  <p className="pt-8 text-brand-muted text-sm text-center">
                    Esta conversa ainda não tem mensagens. Envie a primeira.
                  </p>
                ) : (
                  mensagens.map((mensagem) => {
                    const minha = mensagem.remetenteId === user.id;
                    return (
                      <div
                        key={mensagem.id}
                        className={`flex ${minha ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${minha ? "rounded-br-sm bg-brand-primary text-brand-onPrimary" : "rounded-bl-sm border border-brand-border bg-white text-brand-text"}`}
                        >
                          <p className="break-words whitespace-pre-wrap">
                            {mensagem.texto}
                          </p>
                          <time
                            className={`mt-1 block text-right text-[11px] ${minha ? "text-brand-onPrimary/80" : "text-brand-muted"}`}
                            dateTime={mensagem.createdAt}
                          >
                            {new Date(mensagem.createdAt).toLocaleString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </time>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={fimMensagens} />
              </div>
              <form
                onSubmit={(event) => void enviar(event)}
                className="flex items-end gap-2 p-3 sm:p-4 border-brand-border border-t"
              >
                <label className="sr-only" htmlFor="mensagem">
                  Escreva uma mensagem
                </label>
                <textarea
                  id="mensagem"
                  value={texto}
                  onChange={(event) => setTexto(event.target.value)}
                  maxLength={2000}
                  rows={2}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 bg-white px-3 py-2 border border-brand-border focus:border-brand-primary rounded-xl outline-none min-h-12 text-brand-text resize-y"
                />
                <button
                  type="submit"
                  disabled={!texto.trim() || enviando || carregandoMensagens}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 px-4 rounded-xl h-12 font-semibold text-brand-onPrimary shrink-0"
                >
                  <FaPaperPlane aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {enviando ? "Enviando..." : "Enviar"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
