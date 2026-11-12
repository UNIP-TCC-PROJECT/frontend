import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { api, imagemUrl } from "../services/api";
import { errorMessage } from "../services/organizations";

interface Pessoa {
  id: number;
  name: string;
  type: string;
  profileImage?: string | null;
}
interface Atendimento {
  id: number;
  usuarioId: number;
  usuario: Pessoa;
  ultimaMensagemEm: string | null;
  createdAt: string;
}
interface Mensagem {
  id: number;
  conversaId: number;
  remetenteId: number;
  remetente: Pessoa;
  texto: string;
  createdAt: string;
}
const ENDPOINT = "/sac/conversas";
const INTERVALO = 5000;

export default function Sac() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <CaixaSac
      key={`${user.id}-${user.type}`}
      usuarioId={user.id}
      admin={user.type === "ADMIN"}
    />
  );
}

function CaixaSac({ usuarioId, admin }: { usuarioId: number; admin: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const base = admin ? "/admin/sac" : "/sac";
  const [conversas, setConversas] = useState<Atendimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const atual = conversas.find((c) => String(c.id) === id);

  useEffect(() => {
    let ativo = true;
    let ocupado = false;
    const carregar = async () => {
      if (ocupado) return;
      ocupado = true;
      try {
        const { data } = await api.get<Atendimento[]>(ENDPOINT);
        if (ativo) {
          setConversas(data);
          setErro("");
        }
      } catch (e) {
        if (ativo)
          setErro(
            errorMessage(e) || "Não foi possível carregar o atendimento.",
          );
      } finally {
        ocupado = false;
        if (ativo) setCarregando(false);
      }
    };
    void carregar();
    const atualizar = () => {
      if (!document.hidden) void carregar();
    };
    const timer = window.setInterval(atualizar, INTERVALO);
    window.addEventListener("focus", atualizar);
    return () => {
      ativo = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", atualizar);
    };
  }, [tentativa]);

  async function iniciar() {
    if (iniciando) return;
    setIniciando(true);
    setErro("");
    try {
      const { data } = await api.post<{ id: number }>(ENDPOINT);
      setTentativa((n) => n + 1);
      navigate(`${base}/${data.id}`);
    } catch (e) {
      setErro(errorMessage(e) || "Não foi possível iniciar o atendimento.");
    } finally {
      setIniciando(false);
    }
  }

  return (
    <main className="py-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="font-sans text-brand-text text-3xl">
            Atendimento SAC
          </h1>
          <p className="mt-1 text-brand-muted">
            {admin
              ? "Responda às dúvidas de doadores e ONGs. Os administradores compartilham esta caixa de atendimento."
              : "Fale diretamente com a administração do Donatio. Sua conversa fica disponível para você e para a equipe de atendimento."}
          </p>
        </div>
        {!admin && (
          <button
            type="button"
            onClick={() => void iniciar()}
            disabled={iniciando || carregando}
            className="bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 px-5 py-3 rounded-xl font-semibold text-brand-onPrimary"
          >
            {iniciando
              ? "Abrindo..."
              : conversas.length
                ? "Continuar atendimento"
                : "Iniciar atendimento"}
          </button>
        )}
      </div>
      {erro && (
        <div
          role="alert"
          className="bg-red-50 mb-3 p-3 rounded-xl text-red-700"
        >
          {erro}{" "}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setTentativa((n) => n + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}
      <section className="grid md:grid-cols-[300px_1fr] bg-brand-surface shadow-sm border border-brand-border rounded-2xl min-h-[560px] overflow-hidden">
        <aside
          className={`${id ? "hidden md:block" : ""} border-brand-border md:border-r`}
        >
          <h2 className="px-4 py-3 border-brand-border border-b font-semibold text-brand-text">
            {admin ? "Atendimentos" : "Seu atendimento"}
          </h2>
          {carregando ? (
            <p role="status" className="p-5 text-brand-muted">
              Carregando atendimentos...
            </p>
          ) : conversas.length === 0 ? (
            <p className="p-5 text-brand-muted text-sm">
              {admin
                ? "Nenhum atendimento iniciado pelos usuários."
                : "Precisa de ajuda? Selecione Iniciar atendimento para enviar sua mensagem."}
            </p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {conversas.map((c) => {
                const nome = admin ? c.usuario.name : "Equipe Donatio";
                const foto = admin ? imagemUrl(c.usuario.profileImage) : null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate(`${base}/${c.id}`)}
                    aria-current={String(c.id) === id ? "page" : undefined}
                    className={`flex w-full items-center gap-3 border-brand-border border-b p-4 text-left hover:bg-brand-champagne ${String(c.id) === id ? "bg-brand-champagne" : ""}`}
                  >
                    {foto ? (
                      <img
                        src={foto}
                        alt=""
                        className="rounded-full w-11 h-11 object-cover"
                      />
                    ) : (
                      <span className="flex justify-center items-center bg-brand-champagne rounded-full w-11 h-11 font-bold text-brand-primaryText shrink-0">
                        {nome.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-semibold text-brand-text truncate">
                        {nome}
                      </span>
                      {admin && (
                        <span className="block text-brand-muted text-xs">
                          {c.usuario.type === "ONG" ? "ONG" : "Doador"}
                        </span>
                      )}
                      <span className="block text-brand-muted text-xs">
                        {c.ultimaMensagemEm
                          ? new Date(c.ultimaMensagemEm).toLocaleString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Atendimento iniciado"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>
        <div
          className={`${id ? "flex" : "hidden md:flex"} min-w-0 min-h-[560px] flex-col`}
        >
          {!id ? (
            <p className="m-auto p-8 text-brand-muted text-center">
              {admin
                ? "Selecione um atendimento para responder."
                : "Inicie ou selecione seu atendimento para conversar com a equipe."}
            </p>
          ) : atual ? (
            <ConversaSac
              key={atual.id}
              conversa={atual}
              usuarioId={usuarioId}
              admin={admin}
              voltar={() => navigate(base)}
            />
          ) : (
            <div className="m-auto p-8 text-center text-brand-muted">
              <p>
                {carregando
                  ? "Carregando..."
                  : "Atendimento não encontrado ou indisponível para esta conta."}
              </p>
              <button className="mt-3 underline" onClick={() => navigate(base)}>
                Voltar aos atendimentos
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ConversaSac({
  conversa,
  usuarioId,
  admin,
  voltar,
}: {
  conversa: Atendimento;
  usuarioId: number;
  admin: boolean;
  voltar: () => void;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fim = useRef<HTMLDivElement>(null);
  const versao = useRef(0);
  const envioEmCurso = useRef(false);
  const montado = useRef(true);
  const endpoint = `${ENDPOINT}/${conversa.id}/mensagens`;

  useEffect(() => {
    montado.current = true;
    let ativo = true;
    let ocupado = false;
    const carregar = async () => {
      if (ocupado || envioEmCurso.current) return;
      ocupado = true;
      const inicio = versao.current;
      try {
        const { data } = await api.get<Mensagem[]>(endpoint);
        if (ativo && inicio === versao.current) {
          setMensagens((anteriores) =>
            anteriores.length === data.length &&
            anteriores.every((m, i) => m.id === data[i].id)
              ? anteriores
              : data,
          );
          setErro("");
        }
      } catch (e) {
        if (ativo)
          setErro(
            errorMessage(e) || "Não foi possível atualizar as mensagens.",
          );
      } finally {
        ocupado = false;
        if (ativo) setCarregando(false);
      }
    };
    void carregar();
    const atualizar = () => {
      if (!document.hidden) void carregar();
    };
    const timer = window.setInterval(atualizar, INTERVALO);
    window.addEventListener("focus", atualizar);
    return () => {
      ativo = false;
      montado.current = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", atualizar);
    };
  }, [endpoint]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensagens]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo || conteudo.length > 2000 || envioEmCurso.current) return;
    envioEmCurso.current = true;
    versao.current += 1;
    setEnviando(true);
    setErro("");
    try {
      const { data } = await api.post<Mensagem>(endpoint, { texto: conteudo });
      if (montado.current) {
        setMensagens((m) => [...m, data]);
        setTexto("");
      }
    } catch (e) {
      if (montado.current)
        setErro(
          errorMessage(e) ||
            "Não foi possível enviar. Sua mensagem foi mantida para tentar novamente.",
        );
    } finally {
      versao.current += 1;
      envioEmCurso.current = false;
      if (montado.current) setEnviando(false);
    }
  }

  return (
    <>
      <header className="flex items-center gap-3 p-4 border-brand-border border-b">
        <button
          type="button"
          onClick={voltar}
          className="md:hidden p-2 rounded-lg hover:bg-brand-champagne"
          aria-label="Voltar aos atendimentos"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="font-semibold text-brand-text">
            {admin ? conversa.usuario.name : "Equipe Donatio"}
          </h2>
          <p className="text-xs text-brand-muted">
            {admin
              ? conversa.usuario.type === "ONG"
                ? "Atendimento de ONG"
                : "Atendimento de doador"
              : "Conversa com a administração"}
          </p>
        </div>
      </header>
      <div
        role="log"
        aria-label="Mensagens do atendimento"
        aria-live="polite"
        className="flex-1 space-y-3 bg-brand-background/50 p-4 sm:p-6 max-h-[60vh] overflow-y-auto"
      >
        {carregando ? (
          <p className="text-brand-muted text-sm text-center">
            Carregando mensagens...
          </p>
        ) : mensagens.length === 0 ? (
          <p className="pt-8 text-brand-muted text-center">
            {admin
              ? "Este usuário ainda não enviou uma mensagem."
              : "Conte como podemos ajudar você."}
          </p>
        ) : (
          mensagens.map((m) => {
            const minha = m.remetenteId === usuarioId;
            return (
              <div
                key={m.id}
                className={`flex ${minha ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-3 shadow-sm ${minha ? "rounded-br-sm bg-brand-primary text-brand-onPrimary" : "rounded-bl-sm border border-brand-border bg-white text-brand-text"}`}
                >
                  <p className="mb-1 text-xs font-semibold">
                    {m.remetente.type === "ADMIN"
                      ? `${m.remetente.name} · Administração`
                      : minha
                        ? "Você"
                        : m.remetente.name}
                  </p>
                  <p className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {m.texto}
                  </p>
                  <time
                    dateTime={m.createdAt}
                    className="mt-1 block text-right text-[11px] opacity-80"
                  >
                    {new Date(m.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={fim} />
      </div>
      {erro && (
        <p role="alert" className="bg-red-50 px-4 py-2 text-red-700 text-sm">
          {erro}
        </p>
      )}
      <form
        onSubmit={(event) => void enviar(event)}
        className="flex items-end gap-2 p-3 sm:p-4 border-brand-border border-t"
      >
        <label className="sr-only" htmlFor="mensagem-sac">
          Escreva uma mensagem para o atendimento
        </label>
        <textarea
          id="mensagem-sac"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          maxLength={2000}
          rows={2}
          placeholder="Escreva sua mensagem..."
          className="flex-1 min-w-0 bg-white px-3 py-2 border border-brand-border focus:border-brand-primary rounded-xl outline-none min-h-12 text-brand-text resize-y"
        />
        <button
          type="submit"
          aria-label={enviando ? "Enviando mensagem" : "Enviar mensagem"}
          disabled={!texto.trim() || enviando || carregando}
          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark disabled:opacity-50 px-4 rounded-xl h-12 font-semibold text-brand-onPrimary shrink-0"
        >
          <FaPaperPlane aria-hidden="true" />
          <span className="hidden sm:inline">
            {enviando ? "Enviando..." : "Enviar"}
          </span>
        </button>
      </form>
    </>
  );
}
