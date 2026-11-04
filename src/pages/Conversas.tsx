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
      className="h-10 w-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-bold text-brand-primaryText">
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
    fimMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!id || !conteudo || enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const { data } = await api.post<Mensagem>(`/conversas/${id}/mensagens`, { texto: conteudo });
      setMensagens((atuais) => [...atuais, data]);
      setTexto("");
      setConversas((atuais) => atuais.map((conversa) => conversa.id === Number(id) ? { ...conversa, ultimaMensagemEm: data.createdAt } : conversa));
    } catch {
      setErro("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (user?.type !== "ONG" && user?.type !== "DOADOR") {
    return <main className="mx-auto max-w-3xl p-8 text-center text-brand-muted">{erro || "Acesso não disponível."}</main>;
  }

  return (
    <main className="py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-3xl text-brand-text">Mensagens</h1>
          <p className="mt-1 text-brand-muted">Converse com ONGs e doadores com quem você tem contato.</p>
        </div>
        {user.type === "ONG" && <Link className="text-sm font-semibold text-brand-primaryText underline" to="/interesses">Ver doadores interessados</Link>}
      </div>

      {erro && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-red-700">{erro}</p>}
      <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-sm md:grid-cols-[300px_1fr]">
        <aside className={`${id ? "hidden md:block" : ""} border-brand-border md:border-r`}>
          <div className="border-brand-border border-b px-4 py-3 font-semibold text-brand-text">Suas conversas</div>
          {carregando ? (
            <p className="p-5 text-sm text-brand-muted">Carregando conversas...</p>
          ) : conversas.length === 0 ? (
            <p className="p-5 text-sm text-brand-muted">Você ainda não tem conversas.</p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {conversas.map((conversa) => {
                const pessoa = user.type === "ONG" ? conversa.doador : conversa.ong;
                const foto = imagemUrl(pessoa.profileImage);
                return (
                  <button key={conversa.id} type="button" onClick={() => navigate(`/conversas/${conversa.id}`)} className={`flex w-full items-center gap-3 border-brand-border border-b p-4 text-left hover:bg-brand-champagne ${String(conversa.id) === id ? "bg-brand-champagne" : ""}`}>
                    {foto ? <img src={foto} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-champagne font-bold text-brand-primaryText">{pessoa.name.charAt(0).toUpperCase()}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-brand-text">{pessoa.name}</span>
                      <span className="block text-xs text-brand-muted">{conversa.ultimaMensagemEm ? new Date(conversa.ultimaMensagemEm).toLocaleDateString("pt-BR") : "Conversa iniciada"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className={`${id ? "" : "hidden md:flex"} min-h-[560px] flex-col`}>
          {!id ? (
            <div className="hidden flex-1 items-center justify-center p-8 text-center text-brand-muted md:flex">Selecione uma conversa para ver as mensagens.</div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-brand-border border-b p-4">
                <button type="button" onClick={() => navigate("/conversas")} className="rounded-lg p-2 text-brand-primaryText hover:bg-brand-champagne md:hidden" aria-label="Voltar para conversas"><FaArrowLeft /></button>
                {outraParte && user.type === "DOADOR" && conversaSelecionada ? (
                  <Link
                    to={`/ongs/${conversaSelecionada.ongId}`}
                    className="-m-2 flex min-w-0 items-center gap-3 rounded-xl p-2 text-brand-primaryText transition-colors hover:bg-brand-champagne"
                  >
                    {avatarOutraParte}
                    <span className="truncate font-semibold hover:underline">{outraParte.name}</span>
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-3">
                    {avatarOutraParte}
                    <h2 className="truncate font-semibold text-brand-text">{outraParte?.name ?? "Conversa"}</h2>
                  </div>
                )}
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto bg-brand-background/50 p-4 sm:p-6">
                {carregandoMensagens ? <p className="text-center text-sm text-brand-muted">Carregando mensagens...</p> : mensagens.length === 0 ? <p className="pt-8 text-center text-sm text-brand-muted">Esta conversa ainda não tem mensagens. Envie a primeira.</p> : mensagens.map((mensagem) => {
                  const minha = mensagem.remetenteId === user.id;
                  return <div key={mensagem.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${minha ? "rounded-br-sm bg-brand-primary text-brand-onPrimary" : "rounded-bl-sm border border-brand-border bg-white text-brand-text"}`}><p className="whitespace-pre-wrap break-words">{mensagem.texto}</p><time className={`mt-1 block text-right text-[11px] ${minha ? "text-brand-onPrimary/80" : "text-brand-muted"}`} dateTime={mensagem.createdAt}>{new Date(mensagem.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div></div>;
                })}
                <div ref={fimMensagens} />
              </div>
              <form onSubmit={(event) => void enviar(event)} className="flex items-end gap-2 border-brand-border border-t p-3 sm:p-4">
                <label className="sr-only" htmlFor="mensagem">Escreva uma mensagem</label>
                <textarea id="mensagem" value={texto} onChange={(event) => setTexto(event.target.value)} maxLength={2000} rows={2} placeholder="Escreva sua mensagem..." className="min-h-12 flex-1 resize-y rounded-xl border border-brand-border bg-white px-3 py-2 text-brand-text outline-none focus:border-brand-primary" />
                <button type="submit" disabled={!texto.trim() || enviando || carregandoMensagens} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-brand-primary px-4 font-semibold text-brand-onPrimary hover:bg-brand-primaryDark disabled:opacity-50"><FaPaperPlane aria-hidden="true" /><span className="hidden sm:inline">{enviando ? "Enviando..." : "Enviar"}</span></button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
