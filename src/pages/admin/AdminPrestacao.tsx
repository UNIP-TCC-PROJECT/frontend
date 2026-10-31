import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { accColor, accLabel, docKinds, evidenceKinds } from "../../services/accountability";
import type { AccStatus, Evidence, Expense, Financials } from "../../services/accountability";
import { fmtMoney } from "../../services/campaigns";
import { downloadFile, errorMessage } from "../../services/organizations";

interface Queue { expenses: (Expense & { organizationName: string; campaignTitle: string })[]; evidences: Evidence[] }
interface ExpenseDetail extends Expense { financials: Financials }
interface EvidenceDetail extends Evidence { delivery: { itemDescription: string; description: string; region: string; locationDetail: string | null; quantityPurchased: number; quantityDistributed: number; responsibleName: string } | null }
interface PubFile { id: string; publicacaoId: number; kind: "IMAGEM" | "DOCUMENTO"; name: string; mime: string; size: number; sha256: string; status: AccStatus; imageConsent: boolean; createdAt: string }
type Action = "INICIAR" | "APROVAR" | "REPROVAR" | "COMPLEMENTAR";

const btn = "rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50";
const Badge = ({ s }: { s: AccStatus }) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${accColor[s]}`}>{accLabel[s]}</span>;

export default function AdminPrestacao() {
  const [q, setQ] = useState<Queue | null>(null);
  const [exp, setExp] = useState<ExpenseDetail | null>(null);
  const [ev, setEv] = useState<EvidenceDetail | null>(null);
  const [pubFiles, setPubFiles] = useState<PubFile[]>([]);
  const [pf, setPf] = useState<PubFile | null>(null);
  const [reason, setReason] = useState("");
  const [publishable, setPublishable] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(async () => {
    try {
      setQ((await api.get<Queue>("/admin/accountability/queue")).data);
      setPubFiles((await api.get<PubFile[]>("/admin/publication-attachments")).data);
    } catch (e) { setErro(errorMessage(e)); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  const abrirDespesa = async (id: string) => { setPf(null); setEv(null); setReason(""); setExp((await api.get<ExpenseDetail>(`/admin/expenses/${id}`)).data); };
  const abrirAnexo = (f: PubFile) => { setExp(null); setEv(null); setReason(""); setPublishable(false); setPf(f); };
  const abrirEvidencia = async (id: string) => { setPf(null); setExp(null); setReason(""); setPublishable(false); setEv((await api.get<EvidenceDetail>(`/admin/evidences/${id}`)).data); };

  async function run(path: string, action: Action, ok: string, extra: object = {}, reload?: () => Promise<void>) {
    setErro(""); setAviso("");
    try {
      await api.post(path, { action, ...(reason ? { reason } : {}), ...extra });
      setAviso(ok); setReason(""); await carregar(); if (reload) await reload();
    } catch (e) { setErro(errorMessage(e)); }
  }

  const Actions = ({ path, canStart, withPublish, reload }: { path: string; canStart: boolean; withPublish?: boolean; reload: () => Promise<void> }) => (
    <div className="space-y-2">
      <textarea className="w-full rounded border p-2 text-sm" rows={2} placeholder="Motivo / complementação solicitada (obrigatório para reprovar ou pedir complementação)" value={reason} onChange={(e) => setReason(e.target.value)} />
      {withPublish && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={publishable} onChange={(e) => setPublishable(e.target.checked)} /> Atesto que não há dados pessoais e posso publicar este arquivo no perfil público</label>}
      <div className="flex flex-wrap gap-2">
        {canStart && <button className={`${btn} bg-blue-700`} onClick={() => void run(path, "INICIAR", "Análise iniciada.", {}, reload)}>Iniciar análise</button>}
        <button className={`${btn} bg-green-700`} onClick={() => void run(path, "APROVAR", "Aprovado.", withPublish ? { publishable } : {}, reload)}>Aprovar</button>
        <button className={`${btn} bg-red-700`} disabled={reason.trim().length < 5} onClick={() => void run(path, "REPROVAR", "Reprovado.", {}, reload)}>Reprovar</button>
        <button className={`${btn} bg-orange-600`} disabled={reason.trim().length < 5} onClick={() => void run(path, "COMPLEMENTAR", "Complementação solicitada.", {}, reload)}>Solicitar complementação</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Prestação de contas — análise</h1>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {aviso && <p role="status" className="text-sm text-green-800">{aviso}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2 rounded-lg border bg-white p-4">
          <h2 className="font-semibold">Despesas na fila ({q?.expenses.length ?? 0})</h2>
          {q?.expenses.map((e) => <button key={e.id} className="block w-full rounded border p-2 text-left text-sm hover:bg-gray-50" onClick={() => void abrirDespesa(e.id)}><div className="flex justify-between"><strong>{e.description}</strong><Badge s={e.status} /></div><div className="text-gray-500">{e.organizationName} · {e.campaignTitle} · {fmtMoney(e.amountCents)}</div></button>)}
          <h2 className="pt-2 font-semibold">Anexos de publicações ({pubFiles.length})</h2>
          {pubFiles.map((f) => <button key={f.id} className="block w-full rounded border p-2 text-left text-sm hover:bg-gray-50" onClick={() => abrirAnexo(f)}><div className="flex justify-between"><strong>{f.kind === "IMAGEM" ? "Imagem" : "Documento"} — {f.name}</strong><Badge s={f.status} /></div><div className="text-gray-500">Publicação #{f.publicacaoId}{f.kind === "IMAGEM" && !f.imageConsent ? " · SEM autorização de imagem" : ""}</div></button>)}
          <h2 className="pt-2 font-semibold">Evidências na fila ({q?.evidences.length ?? 0})</h2>
          {q?.evidences.map((v) => <button key={v.id} className="block w-full rounded border p-2 text-left text-sm hover:bg-gray-50" onClick={() => void abrirEvidencia(v.id)}><div className="flex justify-between"><strong>{evidenceKinds[v.kind]}</strong><Badge s={v.status} /></div><div className="text-gray-500">{v.description}</div></button>)}
        </section>

        <section className="space-y-3 rounded-lg border bg-white p-4 text-sm">
          {!exp && !ev && !pf && <p className="text-gray-500">Selecione um item da fila.</p>}
          {pf && (
            <>
              <div className="flex items-center justify-between"><h2 className="font-semibold">{pf.kind === "IMAGEM" ? "Imagem" : "Documento"} de publicação #{pf.publicacaoId}</h2><Badge s={pf.status} /></div>
              <p className="text-xs text-gray-600">{pf.name} · {(pf.size / 1024).toFixed(0)} KB<br /><span className="break-all font-mono">SHA-256 {pf.sha256}</span></p>
              {pf.kind === "IMAGEM" && <p className={`rounded p-2 text-xs ${pf.imageConsent ? "bg-green-50" : "bg-red-50 text-red-800"}`}>{pf.imageConsent ? "A ONG declarou ter autorização de uso da imagem." : "A ONG NÃO declarou autorização de imagem: não é possível publicar."}</p>}
              <button className="text-blue-700 underline" onClick={() => void downloadFile(`/admin/publication-attachments/${pf.id}/file`, pf.name)}>Abrir arquivo</button>
              <p className="text-xs text-gray-500">Confira rostos de crianças e pessoas vulneráveis, documentos pessoais, endereços e dados bancários: qualquer um deles impede a publicação.</p>
              {(pf.status === "ENVIADA" || pf.status === "EM_ANALISE") && <Actions path={`/admin/publication-attachments/${pf.id}/review`} canStart={pf.status === "ENVIADA"} withPublish reload={async () => setPf(null)} />}
            </>
          )}
          {exp && (
            <>
              <div className="flex items-center justify-between"><h2 className="font-semibold">{exp.description}</h2><Badge s={exp.status} /></div>
              <p>{exp.organizationName} · {exp.campaignTitle}<br />{exp.category} · <strong>{fmtMoney(exp.amountCents)}</strong> · {exp.spentAt}{exp.supplier ? ` · ${exp.supplier}` : ""}</p>
              <p className="rounded bg-gray-50 p-2 text-xs">Campanha: arrecadado {fmtMoney(exp.financials.totalRaisedCents)} · despesas aprovadas {fmtMoney(exp.financials.approvedExpensesCents)} · saldo {fmtMoney(exp.financials.balanceCents)}</p>
              <h3 className="font-medium">Comprovantes</h3>
              {exp.documents?.map((d) => (
                <div key={d.id} className="space-y-1 rounded border p-2">
                  <div className="flex items-center justify-between"><span>{docKinds[d.kind ?? "OUTRO"]} — {d.name}</span><Badge s={d.status} /></div>
                  <button className="text-blue-700 underline" onClick={() => void downloadFile(`/expense-documents/${d.id}/file`, d.name)}>Abrir arquivo</button>
                  {(d.status === "ENVIADA" || d.status === "EM_ANALISE") && <Actions path={`/admin/expense-documents/${d.id}/review`} canStart={d.status === "ENVIADA"} withPublish reload={() => abrirDespesa(exp.id)} />}
                </div>
              ))}
              {!exp.documents?.length && <p className="text-gray-500">Sem comprovantes anexados.</p>}
              {(exp.status === "ENVIADA" || exp.status === "EM_ANALISE") && (<><h3 className="font-medium">Decisão sobre a despesa</h3><Actions path={`/admin/expenses/${exp.id}/review`} canStart={exp.status === "ENVIADA"} reload={() => abrirDespesa(exp.id)} /></>)}
            </>
          )}
          {ev && (
            <>
              <div className="flex items-center justify-between"><h2 className="font-semibold">{evidenceKinds[ev.kind]}</h2><Badge s={ev.status} /></div>
              <p>{ev.description}<br /><span className="text-gray-500">{ev.takenAt} · enviado por {ev.responsibleName}</span></p>
              {ev.delivery && <p className="rounded bg-gray-50 p-2 text-xs"><strong>Entrega:</strong> {ev.delivery.itemDescription} ({ev.delivery.quantityDistributed}/{ev.delivery.quantityPurchased}) · {ev.delivery.region}<br />Local interno: {ev.delivery.locationDetail ?? "—"}<br />{ev.delivery.description}</p>}
              <button className="text-blue-700 underline" onClick={() => void downloadFile(`/evidences/${ev.id}/file`, `evidencia-${ev.id.slice(0, 8)}`)}>Abrir arquivo</button>
              <p className="text-xs text-gray-500">Confira o arquivo e os textos: rostos de beneficiários, documentos pessoais ou endereços impedem a publicação.</p>
              {(ev.status === "ENVIADA" || ev.status === "EM_ANALISE") && <Actions path={`/admin/evidences/${ev.id}/review`} canStart={ev.status === "ENVIADA"} withPublish reload={() => abrirEvidencia(ev.id)} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
