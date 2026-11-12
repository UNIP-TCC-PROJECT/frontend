import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import PaymentAccountCard from "./PaymentAccountCard";
import {
  docTypes,
  downloadFile,
  errorMessage,
  fmtCnpj,
  fmtDate,
  statusColor,
  statusLabel,
} from "../../services/organizations";
import type {
  ExternalCheck,
  OrgDocument,
  Organization,
} from "../../services/organizations";

const SOURCES: Record<string, string> = {
  BRASILAPI: "BrasilAPI — cadastro na Receita",
  MAPA_OSC: "Mapa das OSCs (complementar)",
  PORTAL_TRANSPARENCIA: "Portal da Transparência — CEIS/CNEP/CEPIM",
  TRANSFEREGOV: "Transferegov — parcerias públicas (complementar)",
};
const checkColor = {
  OK: "bg-green-100 text-green-800",
  ALERTA: "bg-red-100 text-red-800",
  NAO_ENCONTRADO: "bg-gray-100 text-gray-700",
  INDISPONIVEL: "bg-amber-100 text-amber-900",
};
const checkLabel = {
  OK: "OK",
  ALERTA: "Atenção",
  NAO_ENCONTRADO: "Não encontrado (neutro)",
  INDISPONIVEL: "Indisponível",
};
const LISTAS: Record<string, string> = {
  CEIS: "CEIS — empresas inidôneas e suspensas",
  CNEP: "CNEP — empresas punidas",
  CEPIM: "CEPIM — entidades sem fins lucrativos impedidas",
};
interface Registro {
  id?: number;
  dataInicioSancao?: string | null;
  dataFinalSancao?: string | null;
  motivo?: string | null;
  orgao?: string | null;
}
const btn =
  "rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50";

interface Detail extends Organization {
  documents: OrgDocument[];
  validations: {
    id: string;
    decision: string;
    reason: string | null;
    reviewedBy: number | null;
    createdAt: string;
  }[];
  externalChecks: ExternalCheck[];
  externalCheckHistory: ExternalCheck[];
  owner?: { name: string; email: string };
}

export default function AdminValidacaoDetails() {
  const { id } = useParams();
  const [org, setOrg] = useState<Detail | null>(null);
  const [text, setText] = useState("");
  const [rejectingDocumentId, setRejectingDocumentId] = useState<string | null>(null);
  const [documentReason, setDocumentReason] = useState("");
  const [override, setOverride] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busy, setBusy] = useState(false);
  const [integracoes, setIntegracoes] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    try {
      setOrg((await api.get<Detail>(`/admin/organizations/${id}`)).data);
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, [id]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  useEffect(() => {
    const atualizarSeVisivel = () => {
      if (document.visibilityState === "visible") void carregar();
    };
    const timer = window.setInterval(atualizarSeVisivel, 10_000);
    window.addEventListener("focus", atualizarSeVisivel);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", atualizarSeVisivel);
    };
  }, [carregar]);
  useEffect(() => {
    api
      .get<Record<string, boolean>>("/admin/organizations/integrations")
      .then((r) => setIntegracoes(r.data))
      .catch(() => undefined);
  }, []);

  async function run(fn: () => Promise<unknown>, ok: string, clear = false) {
    setBusy(true);
    setErro("");
    setAviso("");
    try {
      await fn();
      setAviso(ok);
      if (clear) {
        setText("");
        setOverride("");
      }
      await carregar();
    } catch (e) {
      setErro(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const post = (path: string, body?: object) =>
    api.post(`/admin/organizations/${id}/${path}`, body);

  if (!org) return <p>{erro || "Carregando…"}</p>;
  const vigentes = org.documents.filter((d) => !d.supersededAt);
  const emAnalise = org.status === "EM_ANALISE";

  return (
    <div className="space-y-6">
      <Link to="/admin/validacoes" className="text-blue-700 text-sm underline">
        ← Voltar
      </Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-semibold text-xl">
          {org.tradeName ?? org.legalName}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[org.status]}`}
        >
          {statusLabel[org.status]}
        </span>
      </header>
      {erro && (
        <p role="alert" className="text-red-700 text-sm">
          {erro}
        </p>
      )}
      {aviso && (
        <p role="status" className="text-green-800 text-sm">
          {aviso}
        </p>
      )}

      <section className="bg-white p-4 border rounded-lg">
        <h2 className="mb-3 font-semibold">Dados cadastrais</h2>
        <dl className="gap-x-6 gap-y-2 grid md:grid-cols-2 text-sm">
          {(
            [
              ["CNPJ", fmtCnpj(org.cnpj)],
              ["Razão social", org.legalName],
              ["Nome fantasia", org.tradeName],
              ["E-mail", org.email],
              ["Telefone", org.phone],
              [
                "Endereço",
                [org.street, org.number, org.complement, org.district]
                  .filter(Boolean)
                  .join(", "),
              ],
              ["Cidade/UF", `${org.city ?? ""}/${org.state ?? ""}`],
              ["CEP", org.zip],
              ["Representante legal", org.legalRepName],
              ["CPF do representante", org.legalRepCpf],
              ["Cargo", org.legalRepRole],
              [
                "Contato do representante",
                `${org.legalRepEmail ?? ""} ${org.legalRepPhone ?? ""}`,
              ],
              [
                "Conta responsável",
                org.owner ? `${org.owner.name} (${org.owner.email})` : "—",
              ],
            ] as [string, string | null | undefined][]
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-gray-500">{k}</dt>
              <dd>{v || "—"}</dd>
            </div>
          ))}
          <div className="md:col-span-2">
            <dt className="text-gray-500">Atividades</dt>
            <dd className="whitespace-pre-wrap">{org.description || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Consultas automáticas</h2>
          <button
            className={`${btn} bg-slate-800`}
            disabled={busy}
            onClick={() =>
              void run(() => post("checks/run"), "Consultas reexecutadas.")
            }
          >
            Reexecutar consultas
          </button>
        </div>
        <p className="mb-3 text-gray-500 text-xs">
          Cadastro ativo não significa instituição confiável, e a ausência em
          uma base não indica irregularidade. Estas consultas apoiam a análise;
          não a substituem.
        </p>
        <div className="gap-3 grid md:grid-cols-2">
          {Object.keys(SOURCES).map((src) => {
            const c = org.externalChecks.find((x) => x.source === src);
            const configurada = integracoes[src];
            // Resultado gravado antes de a chave existir: a fonte hoje está configurada, mas esta consulta não reflete isso.
            const anteriorAChave =
              src === "PORTAL_TRANSPARENCIA" &&
              configurada === true &&
              c?.status === "INDISPONIVEL" &&
              /não configurada/i.test(c.summary);
            const listas =
              src === "PORTAL_TRANSPARENCIA" && c?.data
                ? (Object.entries(c.data) as [string, Registro[]][])
                : [];
            return (
              <div key={src} className="p-3 border rounded text-sm">
                <div className="flex justify-between items-center gap-2">
                  <strong>{SOURCES[src]}</strong>
                  {c && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${checkColor[c.status]}`}
                    >
                      {checkLabel[c.status]}
                    </span>
                  )}
                </div>
                {src === "PORTAL_TRANSPARENCIA" &&
                  configurada !== undefined && (
                    <p
                      className={`mt-1 text-xs ${configurada ? "text-green-800" : "text-amber-900"}`}
                    >
                      {!configurada &&
                        "Chave de API não configurada no servidor (PORTAL_TRANSPARENCIA_API_KEY). Sem ela esta consulta fica indisponível."}
                    </p>
                  )}
                {c ? (
                  <>
                    {anteriorAChave ? (
                      <p
                        role="status"
                        className="bg-amber-50 mt-1 p-2 rounded text-amber-900"
                      >
                        Esta consulta é anterior à configuração da chave. Use
                        “Reexecutar consultas” para atualizar.
                      </p>
                    ) : (
                      <p className="mt-1">{c.summary}</p>
                    )}
                    {c.findings.length > 0 && (
                      <ul className="mt-1 pl-5 text-red-800 list-disc">
                        {c.findings.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    )}
                    {listas.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {listas.map(([nome, regs]) => (
                          <div
                            key={nome}
                            className="bg-gray-50 p-2 rounded text-xs"
                          >
                            <strong>{LISTAS[nome] ?? nome}:</strong>{" "}
                            {regs.length
                              ? `${regs.length} registro(s)`
                              : "nenhum registro"}
                            {regs.length > 0 && (
                              <ul className="space-y-0.5 mt-1 pl-5 text-red-800 list-disc">
                                {regs.map((r, i) => (
                                  <li key={r.id ?? i}>
                                    {[
                                      r.motivo,
                                      r.orgao,
                                      r.dataInicioSancao &&
                                        `início ${r.dataInicioSancao}`,
                                      r.dataFinalSancao &&
                                        `fim ${r.dataFinalSancao}`,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ") || "Registro sem detalhes"}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-gray-500 text-xs">
                      Fonte: {src} · consultado em {fmtDate(c.queriedAt)}
                      {c.httpStatus ? ` · HTTP ${c.httpStatus}` : ""}
                    </p>
                    {c.data && (
                      <details className="mt-1">
                        <summary className="text-blue-700 text-xs cursor-pointer">
                          Dados retornados
                        </summary>
                        <pre className="bg-gray-50 p-2 rounded max-h-48 overflow-auto text-xs">
                          {JSON.stringify(c.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-gray-500">Ainda não consultado.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white p-4 border rounded-lg">
        <h2 className="mb-3 font-semibold">Documentos vigentes</h2>
        <p className="mb-3 text-gray-500 text-xs">
          A lista é atualizada automaticamente quando a ONG envia uma nova versão.
        </p>
        <p className="mb-3 text-gray-500 text-xs">
          Você pode aprovar ou reprovar cada documento individualmente. Ao
          reprovar, informe o motivo solicitado.
        </p>
        <ul className="space-y-2 text-sm">
          {vigentes.map((d) => {
            const anteriores = org.documents.filter(
              (versao) => versao.type === d.type && versao.supersededAt,
            ).length;
            const numeroVersao = anteriores + 1;
            return <li
              key={d.id}
              className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b"
            >
              <div>
                <strong>{docTypes[d.type] ?? d.type}</strong> — {d.name} ·{" "}
                {fmtDate(d.createdAt)}
                {numeroVersao > 1 && (
                  <span className="bg-blue-50 ml-2 px-2 py-0.5 rounded text-blue-800 text-xs font-semibold">
                    Nova entrada · versão {numeroVersao}
                  </span>
                )}
                <div className="text-gray-500 text-xs">
                  SHA-256 {d.sha256.slice(0, 16)}… · {d.status}
                  {d.reviewReason ? ` · ${d.reviewReason}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  className={`${btn} bg-slate-700`}
                  onClick={() =>
                    void downloadFile(
                      `/organizations/documents/${d.id}/file`,
                      d.name,
                    )
                  }
                >
                  Abrir
                </button>
                <button
                  className={`${btn} bg-green-700 disabled:bg-green-600 disabled:opacity-80 disabled:cursor-not-allowed`}
                  disabled={busy || d.status === "REPROVADO"}
                  aria-pressed={d.status === "APROVADO"}
                  onClick={() =>
                    d.status !== "APROVADO" &&
                    void run(
                        () =>
                          api.post(
                            `/admin/organizations/documents/${d.id}/review`,
                            { decision: "APROVAR" },
                          ),
                        "Documento aprovado.",
                      )
                  }
                >
                  {d.status === "APROVADO" ? "Aprovado" : "Aprovar"}
                </button>
                <button
                  className={`${btn} bg-red-700 disabled:bg-red-500 disabled:opacity-80 disabled:cursor-not-allowed`}
                  disabled={busy || d.status === "APROVADO"}
                  aria-pressed={d.status === "REPROVADO"}
                  onClick={() => {
                    if (d.status !== "PENDENTE") return;
                    setDocumentReason("");
                    setRejectingDocumentId((current) => current === d.id ? null : d.id);
                  }}
                >
                  {d.status === "REPROVADO"
                    ? "Reprovado"
                    : rejectingDocumentId === d.id
                      ? "Cancelar"
                      : "Reprovar"}
                </button>
              </div>
              {rejectingDocumentId === d.id && (
                <div className="basis-full space-y-2">
                  <label className="block text-xs">
                    Motivo da reprovação (mínimo de 5 caracteres)
                    <textarea
                      className="mt-1 p-2 border rounded w-full text-sm"
                      rows={2}
                      value={documentReason}
                      onChange={(e) => setDocumentReason(e.target.value)}
                      placeholder="Ex.: arquivo ilegível; envie uma versão mais nítida."
                    />
                  </label>
                  <button
                    className={`${btn} bg-red-700`}
                    disabled={busy || documentReason.trim().length < 5}
                    onClick={() =>
                      void run(
                        () =>
                          api.post(
                            `/admin/organizations/documents/${d.id}/review`,
                            { decision: "REPROVAR", reason: documentReason },
                          ),
                        "Documento reprovado.",
                      )
                    }
                  >
                    Confirmar reprovação
                  </button>
                </div>
              )}
            </li>;
          })}
          {!vigentes.length && (
            <li className="text-gray-500">Nenhum documento enviado.</li>
          )}
        </ul>
        {org.documents.some((d) => d.supersededAt) && (
          <p className="mt-2 text-gray-500 text-xs">
            {org.documents.filter((d) => d.supersededAt).length} versão(ões)
            anterior(es) substituída(s) mantida(s) no histórico.
          </p>
        )}
      </section>

      {["EM_ANALISE", "APROVADA", "AGUARDANDO_DOCUMENTACAO", "SUSPENSA"].includes(
        org.status,
      ) && (
        <section className="space-y-3 bg-white p-4 border rounded-lg">
          <h2 className="font-semibold">Decisão</h2>
          <textarea
            className="p-2 border rounded w-full text-sm"
            rows={3}
            placeholder="Motivo / mensagem (mín. 5 caracteres; 10 para solicitar documentos)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {emAnalise && (
            <input
              className="p-2 border rounded w-full text-sm"
              placeholder="Justificativa para aprovar mesmo com consulta indisponível ou alerta (opcional, mín. 10 caracteres)"
              value={override}
              onChange={(e) => setOverride(e.target.value)}
            />
          )}
          <div className="flex flex-wrap gap-2">
            {emAnalise && (
              <>
                <button
                  className={`${btn} bg-green-700`}
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () =>
                        post("decision", {
                          decision: "APROVAR",
                          ...(override ? { overrideReason: override } : {}),
                        }),
                      "Instituição aprovada.",
                      true,
                    )
                  }
                >
                  Aprovar instituição
                </button>
                <button
                  className={`${btn} bg-red-700`}
                  disabled={busy || text.trim().length < 5}
                  onClick={() =>
                    void run(
                      () =>
                        post("decision", {
                          decision: "REPROVAR",
                          reason: text,
                        }),
                      "Instituição reprovada.",
                      true,
                    )
                  }
                >
                  Reprovar
                </button>
                <button
                  className={`${btn} bg-orange-600`}
                  disabled={busy || text.trim().length < 10}
                  onClick={() =>
                    void run(
                      () => post("request-documents", { message: text }),
                      "Documentos solicitados.",
                      true,
                    )
                  }
                >
                  Solicitar documentos complementares
                </button>
              </>
            )}
            {org.status === "APROVADA" && (
              <button
                className={`${btn} bg-red-900`}
                disabled={busy || text.trim().length < 5}
                onClick={() =>
                  void run(
                    () => post("suspend", { reason: text }),
                    "Instituição suspensa.",
                    true,
                  )
                }
              >
                Suspender (derruba campanhas ativas)
              </button>
            )}
            {org.status === "SUSPENSA" && (
              <button
                className={`${btn} bg-green-700`}
                disabled={busy || text.trim().length < 5}
                onClick={() =>
                  void run(
                    () => post("reactivate", { reason: text }),
                    "Instituição reativada e aprovada.",
                    true,
                  )
                }
              >
                Reativar instituição
              </button>
            )}
          </div>
        </section>
      )}

      <PaymentAccountCard
        organizationId={org.id}
        approved={org.status === "APROVADA"}
      />

      <section className="bg-white p-4 border rounded-lg">
        <h2 className="mb-2 font-semibold">Histórico de validações</h2>
        <ul className="space-y-1 text-sm">
          {org.validations.map((v) => (
            <li key={v.id}>
              {fmtDate(v.createdAt)} — <strong>{v.decision}</strong>
              {v.reason ? `: ${v.reason}` : ""}{" "}
              <span className="text-gray-500">(admin #{v.reviewedBy})</span>
            </li>
          ))}
          {!org.validations.length && (
            <li className="text-gray-500">Sem decisões registradas.</li>
          )}
        </ul>
        <details className="mt-3">
          <summary className="text-blue-700 text-sm cursor-pointer">
            Histórico de consultas externas ({org.externalCheckHistory.length})
          </summary>
          <ul className="space-y-1 mt-2 text-xs">
            {org.externalCheckHistory.map((c) => (
              <li key={c.id}>
                {fmtDate(c.queriedAt)} · {c.source} · {c.status} — {c.summary}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
