import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { docTypes, downloadFile, errorMessage, fmtCnpj, fmtDate, statusColor, statusLabel } from "../../services/organizations";
import type { ExternalCheck, OrgDocument, Organization } from "../../services/organizations";

const SOURCES: Record<string, string> = {
  BRASILAPI: "BrasilAPI — cadastro na Receita",
  MAPA_OSC: "Mapa das OSCs (complementar)",
  PORTAL_TRANSPARENCIA: "Portal da Transparência — CEIS/CNEP/CEPIM",
  TRANSFEREGOV: "Transferegov — parcerias públicas (complementar)",
};
const checkColor = { OK: "bg-green-100 text-green-800", ALERTA: "bg-red-100 text-red-800", NAO_ENCONTRADO: "bg-gray-100 text-gray-700", INDISPONIVEL: "bg-amber-100 text-amber-900" };
const checkLabel = { OK: "OK", ALERTA: "Atenção", NAO_ENCONTRADO: "Não encontrado (neutro)", INDISPONIVEL: "Indisponível" };
const btn = "rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50";

interface Detail extends Organization {
  documents: OrgDocument[];
  validations: { id: string; decision: string; reason: string | null; reviewedBy: number | null; createdAt: string }[];
  externalChecks: ExternalCheck[];
  externalCheckHistory: ExternalCheck[];
  owner?: { name: string; email: string };
}

export default function AdminValidacaoDetails() {
  const { id } = useParams();
  const [org, setOrg] = useState<Detail | null>(null);
  const [text, setText] = useState("");
  const [override, setOverride] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busy, setBusy] = useState(false);

  const carregar = useCallback(async () => {
    try { setOrg((await api.get<Detail>(`/admin/organizations/${id}`)).data); } catch (e) { setErro(errorMessage(e)); }
  }, [id]);
  useEffect(() => { void carregar(); }, [carregar]);

  async function run(fn: () => Promise<unknown>, ok: string, clear = false) {
    setBusy(true); setErro(""); setAviso("");
    try { await fn(); setAviso(ok); if (clear) { setText(""); setOverride(""); } await carregar(); } catch (e) { setErro(errorMessage(e)); } finally { setBusy(false); }
  }
  const post = (path: string, body?: object) => api.post(`/admin/organizations/${id}/${path}`, body);

  if (!org) return <p>{erro || "Carregando…"}</p>;
  const vigentes = org.documents.filter((d) => !d.supersededAt);
  const emAnalise = org.status === "EM_ANALISE";

  return (
    <div className="space-y-6">
      <Link to="/admin/validacoes" className="text-sm text-blue-700 underline">← Voltar</Link>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{org.tradeName ?? org.legalName}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[org.status]}`}>{statusLabel[org.status]}</span>
      </header>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {aviso && <p role="status" className="text-sm text-green-800">{aviso}</p>}

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Dados cadastrais</h2>
        <dl className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
          {([
            ["CNPJ", fmtCnpj(org.cnpj)], ["Razão social", org.legalName], ["Nome fantasia", org.tradeName], ["E-mail", org.email], ["Telefone", org.phone],
            ["Endereço", [org.street, org.number, org.complement, org.district].filter(Boolean).join(", ")], ["Cidade/UF", `${org.city ?? ""}/${org.state ?? ""}`], ["CEP", org.zip],
            ["Representante legal", org.legalRepName], ["CPF do representante", org.legalRepCpf], ["Cargo", org.legalRepRole], ["Contato do representante", `${org.legalRepEmail ?? ""} ${org.legalRepPhone ?? ""}`],
            ["Conta responsável", org.owner ? `${org.owner.name} (${org.owner.email})` : "—"],
          ] as [string, string | null | undefined][]).map(([k, v]) => <div key={k}><dt className="text-gray-500">{k}</dt><dd>{v || "—"}</dd></div>)}
          <div className="md:col-span-2"><dt className="text-gray-500">Atividades</dt><dd className="whitespace-pre-wrap">{org.description || "—"}</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Consultas automáticas</h2>
          <button className={`${btn} bg-slate-800`} disabled={busy} onClick={() => void run(() => post("checks/run"), "Consultas reexecutadas.")}>Reexecutar consultas</button>
        </div>
        <p className="mb-3 text-xs text-gray-500">Cadastro ativo não significa instituição confiável, e a ausência em uma base não indica irregularidade. Estas consultas apoiam a análise; não a substituem.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.keys(SOURCES).map((src) => {
            const c = org.externalChecks.find((x) => x.source === src);
            return (
              <div key={src} className="rounded border p-3 text-sm">
                <div className="flex items-center justify-between gap-2"><strong>{SOURCES[src]}</strong>
                  {c && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${checkColor[c.status]}`}>{checkLabel[c.status]}</span>}</div>
                {c ? (<>
                  <p className="mt-1">{c.summary}</p>
                  {c.findings.length > 0 && <ul className="mt-1 list-disc pl-5 text-red-800">{c.findings.map((f) => <li key={f}>{f}</li>)}</ul>}
                  <p className="mt-1 text-xs text-gray-500">Fonte: {src} · consultado em {fmtDate(c.queriedAt)}{c.httpStatus ? ` · HTTP ${c.httpStatus}` : ""}</p>
                  {c.data && <details className="mt-1"><summary className="cursor-pointer text-xs text-blue-700">Dados retornados</summary><pre className="max-h-48 overflow-auto rounded bg-gray-50 p-2 text-xs">{JSON.stringify(c.data, null, 2)}</pre></details>}
                </>) : <p className="mt-1 text-gray-500">Ainda não consultado.</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Documentos vigentes</h2>
        <ul className="space-y-2 text-sm">
          {vigentes.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              <div><strong>{docTypes[d.type] ?? d.type}</strong> — {d.name} · {fmtDate(d.createdAt)}<div className="text-xs text-gray-500">SHA-256 {d.sha256.slice(0, 16)}… · {d.status}{d.reviewReason ? ` · ${d.reviewReason}` : ""}</div></div>
              <div className="flex gap-2">
                <button className={`${btn} bg-slate-700`} onClick={() => void downloadFile(`/organizations/documents/${d.id}/file`, d.name)}>Abrir</button>
                <button className={`${btn} bg-green-700`} disabled={busy} onClick={() => void run(() => api.post(`/admin/organizations/documents/${d.id}/review`, { decision: "APROVAR" }), "Documento aprovado.")}>Aprovar</button>
                <button className={`${btn} bg-red-700`} disabled={busy || text.trim().length < 5} title="Informe o motivo no campo abaixo" onClick={() => void run(() => api.post(`/admin/organizations/documents/${d.id}/review`, { decision: "REPROVAR", reason: text }), "Documento reprovado.")}>Reprovar</button>
              </div>
            </li>
          ))}
          {!vigentes.length && <li className="text-gray-500">Nenhum documento enviado.</li>}
        </ul>
        {org.documents.some((d) => d.supersededAt) && <p className="mt-2 text-xs text-gray-500">{org.documents.filter((d) => d.supersededAt).length} versão(ões) anterior(es) substituída(s) mantida(s) no histórico.</p>}
      </section>

      {["EM_ANALISE", "APROVADA", "AGUARDANDO_DOCUMENTACAO"].includes(org.status) && (
        <section className="space-y-3 rounded-lg border bg-white p-4">
          <h2 className="font-semibold">Decisão</h2>
          <textarea className="w-full rounded border p-2 text-sm" rows={3} placeholder="Motivo / mensagem (mín. 5 caracteres; 10 para solicitar documentos)" value={text} onChange={(e) => setText(e.target.value)} />
          {emAnalise && <input className="w-full rounded border p-2 text-sm" placeholder="Justificativa para aprovar mesmo com consulta indisponível ou alerta (opcional, mín. 10 caracteres)" value={override} onChange={(e) => setOverride(e.target.value)} />}
          <div className="flex flex-wrap gap-2">
            {emAnalise && <>
              <button className={`${btn} bg-green-700`} disabled={busy} onClick={() => void run(() => post("decision", { decision: "APROVAR", ...(override ? { overrideReason: override } : {}) }), "Instituição aprovada.", true)}>Aprovar instituição</button>
              <button className={`${btn} bg-red-700`} disabled={busy || text.trim().length < 5} onClick={() => void run(() => post("decision", { decision: "REPROVAR", reason: text }), "Instituição reprovada.", true)}>Reprovar</button>
              <button className={`${btn} bg-orange-600`} disabled={busy || text.trim().length < 10} onClick={() => void run(() => post("request-documents", { message: text }), "Documentos solicitados.", true)}>Solicitar documentos complementares</button>
            </>}
            {org.status === "APROVADA" && <button className={`${btn} bg-red-900`} disabled={busy || text.trim().length < 5} onClick={() => void run(() => post("suspend", { reason: text }), "Instituição suspensa.", true)}>Suspender (derruba campanhas ativas)</button>}
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 font-semibold">Histórico de validações</h2>
        <ul className="space-y-1 text-sm">
          {org.validations.map((v) => <li key={v.id}>{fmtDate(v.createdAt)} — <strong>{v.decision}</strong>{v.reason ? `: ${v.reason}` : ""} <span className="text-gray-500">(admin #{v.reviewedBy})</span></li>)}
          {!org.validations.length && <li className="text-gray-500">Sem decisões registradas.</li>}
        </ul>
        <details className="mt-3"><summary className="cursor-pointer text-sm text-blue-700">Histórico de consultas externas ({org.externalCheckHistory.length})</summary>
          <ul className="mt-2 space-y-1 text-xs">{org.externalCheckHistory.map((c) => <li key={c.id}>{fmtDate(c.queriedAt)} · {c.source} · {c.status} — {c.summary}</li>)}</ul>
        </details>
      </section>
    </div>
  );
}
