import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { api, imagemUrl } from "../services/api";
import { accLabel, docKinds, evidenceKinds } from "../services/accountability";
import type { AccStatus, Financials } from "../services/accountability";
import { fmtMoney } from "../services/campaigns";
import { fmtCnpj, fmtDate } from "../services/organizations";

type Prov = "DECLARADA" | "FONTE_EXTERNA" | "DOCUMENTO_RECEBIDO" | "DOCUMENTO_ANALISADO" | "EVIDENCIA_APROVADA" | "AUDITORIA";
interface PubEvidence { id: string; kind: string; mime: string; description: string; date: string; status: AccStatus; campaignTitle: string | null; deliveryId: string | null; provenance: Prov[] }
interface Profile {
  identification: { id: string; name: string; legalName: string; cnpj: string; description: string; city: string | null; state: string | null; registeredAt: string; provenance: Prov[] };
  validation: {
    status: string; validatedAt: string | null; lastCheckedAt: string | null; statusNote: string;
    receita: { situacaoCadastral: string | null; naturezaJuridica: string | null; cnaePrincipal: string | null; inicioAtividade: string | null; municipio: string | null; uf: string | null; queriedAt: string; provenance: Prov[] } | null;
    sources: { source: string; label: string; result: string; resultLabel: string; queriedAt: string; provenance: Prov[] }[];
    documents: { type: string; label: string; receivedAt: string; state: string; analyzedAt: string | null; provenance: Prov[] }[];
  };
  audit: { validationRecordedAt: string | null; documentsReviewed: number; expenseReviews: number; evidenceReviews: number; lastReviewAt: string | null; note: string };
  totals: Financials;
  campaigns: ({ id: string; title: string; status: string; goalCents: number; percentReached: number; startsAt: string | null; endsAt: string | null; expenses: { id: string; date: string; category: string; description: string; amountCents: number }[]; provenance: Prov[] } & Financials)[];
  expenses: { id: string; date: string; category: string; description: string; amountCents: number; campaignTitle: string | null; supplier: string | null; status: AccStatus; documents: { id: string; kind: string }[]; documentNote: string | null; provenance: Prov[] }[];
  deliveries: { id: string; date: string; item: string; quantityPurchased: number; quantityDistributed: number; unit: string | null; region: string; description: string; campaignTitle: string | null; purchase: { description: string; amountCents: number; date: string } | null; evidences: PubEvidence[]; provenance: Prov[] }[];
  deliveriesAwaitingVerification: number;
  gallery: PubEvidence[];
  evidenceSummary: { published: number; approvedNotPublished: number; awaitingAnalysis: number; needsComplement: number; note: string };
  timeline: { type: string; at: string; title: string; detail?: string; campaignTitle?: string | null; provenance: Prov[] }[];
  legend: Record<Prov, { label: string; description: string }>;
  notice: string;
}

const chipColor: Record<Prov, string> = {
  DECLARADA: "bg-gray-100 text-gray-700",
  FONTE_EXTERNA: "bg-sky-100 text-sky-800",
  DOCUMENTO_RECEBIDO: "bg-amber-100 text-amber-900",
  DOCUMENTO_ANALISADO: "bg-emerald-100 text-emerald-800",
  EVIDENCIA_APROVADA: "bg-green-100 text-green-800",
  AUDITORIA: "bg-violet-100 text-violet-800",
};
const docState: Record<string, string> = { RECEBIDO: "Recebido (ainda não analisado)", ANALISADO_APROVADO: "Analisado e aprovado", ANALISADO_REPROVADO: "Analisado e reprovado" };
const card = "rounded-xl border border-brand-border bg-brand-surface p-4";
const file = (kind: "evidences" | "expense-documents", id: string) => imagemUrl(`/transparency/${kind}/${id}/file`)!;
const date = (d?: string | null) => (d ? fmtDate(d).split(",")[0] : "—");

function Chips({ p, legend }: { p: Prov[]; legend: Profile["legend"] }) {
  return <span className="inline-flex flex-wrap gap-1">{p.map((x) => <span key={x} title={legend[x].description} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chipColor[x]}`}>{legend[x].label}</span>)}</span>;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-20 space-y-3"><h2 className="text-lg font-semibold text-brand-text">{title}</h2>{children}</section>;
}

function EvidenceFigure({ e, legend }: { e: PubEvidence; legend: Profile["legend"] }) {
  return (
    <figure className={`${card} space-y-2 text-xs`}>
      {e.mime.startsWith("image/") ? <img src={file("evidences", e.id)} alt={e.description} className="h-40 w-full rounded object-cover" loading="lazy" /> : <a className="underline" href={file("evidences", e.id)}>Abrir relatório (PDF)</a>}
      <figcaption className="space-y-1">
        <strong>{evidenceKinds[e.kind]}</strong> · {e.date}{e.campaignTitle ? ` · ${e.campaignTitle}` : ""}
        <div>{e.description}</div>
        <div className="flex items-center gap-2"><span className="font-semibold text-green-800">{accLabel[e.status]}</span><Chips p={e.provenance} legend={legend} /></div>
      </figcaption>
    </figure>
  );
}

export default function Transparencia() {
  const { id } = useParams();
  const [p, setP] = useState<Profile | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => { api.get<Profile>(`/transparency/organizations/${id}`).then((r) => setP(r.data)).catch(() => setErro("Perfil de transparência não encontrado.")); }, [id]);
  if (!p) return <p className="p-8">{erro || "Carregando…"}</p>;
  const { identification: org, validation: v, totals: t, legend } = p;

  return (
    <div className="space-y-10 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-brand-text">Transparência — {org.name}</h1>
        <nav className="flex flex-wrap gap-3 text-sm text-brand-goldText underline">
          {[["identificacao", "Identificação"], ["financeiro", "Financeiro"], ["comprovantes", "Comprovantes"], ["galeria", "Evidências"], ["entregas", "Entregas"], ["linha-do-tempo", "Linha do tempo"], ["legenda", "Como ler"]].map(([a, l]) => <a key={a} href={`#${a}`}>{l}</a>)}
        </nav>
      </header>

      <Section id="identificacao" title="Identificação e validação">
        <div className={`${card} space-y-1 text-sm`}>
          <div><strong>{org.legalName}</strong> · CNPJ {fmtCnpj(org.cnpj)} · {org.city}/{org.state}</div>
          <p>{org.description} <Chips p={org.provenance} legend={legend} /></p>
          <div className="grid gap-x-6 gap-y-1 text-brand-muted sm:grid-cols-3">
            <div>Cadastro na plataforma: {date(org.registeredAt)}</div>
            <div>Situação: <strong className="text-green-800">Validada</strong>{v.validatedAt ? ` em ${date(v.validatedAt)}` : ""}</div>
            <div>Última consulta cadastral: {date(v.lastCheckedAt)}</div>
          </div>
          <p className="text-xs text-brand-muted">{v.statusNote}</p>
        </div>

        <h3 className="font-medium">Fontes públicas consultadas</h3>
        {v.sources.length ? (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="text-brand-muted"><tr><th className="py-1">Fonte</th><th>Resultado</th><th>Consultada em</th><th /></tr></thead>
            <tbody>{v.sources.map((s) => <tr key={s.source} className="border-t align-top"><td className="py-2 pr-2">{s.label}</td><td className="pr-2">{s.resultLabel}</td><td className="pr-2">{date(s.queriedAt)}</td><td><Chips p={s.provenance} legend={legend} /></td></tr>)}</tbody>
          </table></div>
        ) : <p className="text-sm text-brand-muted">Nenhuma consulta externa registrada para esta instituição.</p>}

        {v.receita && (
          <div className={`${card} space-y-1 text-sm`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">Informações institucionais — cadastro na Receita</h3><Chips p={v.receita.provenance} legend={legend} /></div>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              <div>Situação cadastral: {v.receita.situacaoCadastral ?? "—"}</div>
              <div>Natureza jurídica: {v.receita.naturezaJuridica ?? "—"}</div>
              <div>Atividade principal: {v.receita.cnaePrincipal ?? "—"}</div>
              <div>Início da atividade: {v.receita.inicioAtividade ?? "—"}</div>
              <div>Município/UF: {v.receita.municipio ?? "—"}/{v.receita.uf ?? "—"}</div>
              <div>Consultado em: {date(v.receita.queriedAt)}</div>
            </div>
            <p className="text-xs text-brand-muted">Cadastro ativo na Receita não equivale a garantia de boa gestão.</p>
          </div>
        )}

        <h3 className="font-medium">Documentos institucionais analisados</h3>
        <p className="text-xs text-brand-muted">Os documentos em si não são públicos (podem conter dados pessoais). Aqui consta apenas o que foi recebido e analisado.</p>
        <ul className="space-y-1 text-sm">{v.documents.map((d) => <li key={d.type} className="flex flex-wrap items-center gap-2"><span>{d.label} — recebido em {date(d.receivedAt)} · {docState[d.state]}{d.analyzedAt ? ` em ${date(d.analyzedAt)}` : ""}</span><Chips p={d.provenance} legend={legend} /></li>)}</ul>

        <div className={`${card} space-y-1 text-sm`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">Auditoria</h3><Chips p={["AUDITORIA"]} legend={legend} /></div>
          <p>{p.audit.documentsReviewed} análise(s) de documentos institucionais · {p.audit.expenseReviews} decisão(ões) sobre despesas · {p.audit.evidenceReviews} decisão(ões) sobre evidências{p.audit.lastReviewAt ? ` · última em ${date(p.audit.lastReviewAt)}` : ""}</p>
          <p className="text-xs text-brand-muted">{p.audit.note}</p>
        </div>
      </Section>

      <Section id="financeiro" title="Transparência financeira">
        <div className="grid gap-3 sm:grid-cols-3">
          {([["Total arrecadado (pagamentos confirmados)", fmtMoney(t.totalRaisedCents)], ["Despesas aprovadas", fmtMoney(t.approvedExpensesCents)], ["Saldo restante", fmtMoney(t.balanceCents)], ["Despesas em análise", `${t.pendingExpensesCount} (${fmtMoney(t.pendingExpensesCents)})`], ["Entregas registradas", `${t.deliveriesRegistered}`], ["Entregas com evidência aprovada", `${t.deliveriesVerified}`]] as [string, string][]).map(([k, val]) => <div key={k} className={card}><div className="text-xs text-brand-muted">{k}</div><div className="text-lg font-semibold">{val}</div></div>)}
        </div>
        <p className="text-xs text-brand-muted">{p.notice}</p>
        {p.campaigns.map((c) => (
          <article key={c.id} className={`${card} space-y-2 text-sm`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><Link className="font-semibold underline" to={`/campanhas/${c.id}`}>{c.title}</Link><span className="text-xs text-brand-muted">{c.status}</span></div>
            <ProgressBar value={c.totalRaisedCents} goal={c.goalCents} />
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-5">
              <div>Meta: {fmtMoney(c.goalCents)}</div><div>Arrecadado: {fmtMoney(c.totalRaisedCents)}</div><div>Despesas aprovadas: {fmtMoney(c.approvedExpensesCents)}</div><div>Saldo: {fmtMoney(c.balanceCents)}</div><div><strong>{c.percentReached.toLocaleString("pt-BR")}%</strong> da meta</div>
            </div>
            <Chips p={c.provenance} legend={legend} />
            <details><summary className="cursor-pointer text-brand-goldText">Histórico de despesas aprovadas ({c.expenses.length})</summary>
              <ul className="mt-2 space-y-1">{c.expenses.map((e) => <li key={e.id}>{e.date} · {e.category} · {e.description} — <strong>{fmtMoney(e.amountCents)}</strong></li>)}{!c.expenses.length && <li className="text-brand-muted">Nenhuma despesa aprovada nesta campanha.</li>}</ul>
            </details>
          </article>
        ))}
        {!p.campaigns.length && <p className="text-sm text-brand-muted">Nenhuma campanha publicada.</p>}
      </Section>

      <Section id="comprovantes" title="Despesas aprovadas e comprovantes">
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-brand-muted"><tr><th className="p-3">Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Situação</th><th>Comprovante</th></tr></thead>
            <tbody>{p.expenses.map((e) => (
              <tr key={e.id} className="border-t align-top">
                <td className="p-3">{e.date}</td>
                <td>{e.description}<div className="text-xs text-brand-muted">{e.campaignTitle}{e.supplier ? ` · ${e.supplier}` : ""}</div><Chips p={e.provenance} legend={legend} /></td>
                <td>{e.category}</td><td>{fmtMoney(e.amountCents)}</td><td className="font-semibold text-green-800">{accLabel[e.status]}</td>
                <td>{e.documents.length ? e.documents.map((d) => <a key={d.id} className="mr-2 underline" href={file("expense-documents", d.id)}>{docKinds[d.kind]}</a>) : <span className="text-xs text-brand-muted">{e.documentNote ?? "Sem comprovante publicado."}</span>}</td>
              </tr>))}
              {!p.expenses.length && <tr><td colSpan={6} className="p-4 text-brand-muted">Nenhuma despesa aprovada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="galeria" title="Galeria de evidências">
        <p className="text-xs text-brand-muted">Somente evidências aprovadas e publicáveis. {p.evidenceSummary.awaitingAnalysis + p.evidenceSummary.needsComplement > 0 ? `${p.evidenceSummary.awaitingAnalysis} aguardando análise e ${p.evidenceSummary.needsComplement} com pedido de complementação: ainda não são consideradas comprovadas e não são exibidas. ` : ""}{p.evidenceSummary.approvedNotPublished > 0 ? `${p.evidenceSummary.approvedNotPublished} aprovada(s) mantida(s) privada(s) para proteger dados pessoais.` : ""}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{p.gallery.map((e) => <EvidenceFigure key={e.id} e={e} legend={legend} />)}</div>
        {!p.gallery.length && <p className="text-sm text-brand-muted">Nenhuma evidência aprovada e publicável ainda.</p>}
      </Section>

      <Section id="entregas" title="Registro de entregas">
        {p.deliveriesAwaitingVerification > 0 && <p className="text-xs text-brand-muted">{p.deliveriesAwaitingVerification} entrega(s) registrada(s) ainda sem evidência aprovada: seus detalhes só são exibidos após a verificação.</p>}
        {p.deliveries.map((d) => (
          <article key={d.id} className={`${card} space-y-2 text-sm`}>
            <h3 className="font-semibold">{d.item}</h3>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-4">
              <div>Adquirido: {d.quantityPurchased} {d.unit ?? ""}</div><div>Distribuído: {d.quantityDistributed} {d.unit ?? ""}</div><div>Data: {d.date}</div><div>Região: {d.region}</div>
            </div>
            {d.purchase && <p className="text-brand-muted">Compra associada: {d.purchase.description} — {fmtMoney(d.purchase.amountCents)} em {d.purchase.date}</p>}
            <p>{d.description}</p>
            <Chips p={d.provenance} legend={legend} />
            <div className="grid gap-3 sm:grid-cols-3">{d.evidences.map((e) => <EvidenceFigure key={e.id} e={e} legend={legend} />)}</div>
          </article>
        ))}
        {!p.deliveries.length && <p className="text-sm text-brand-muted">Nenhuma entrega verificada ainda.</p>}
      </Section>

      <Section id="linha-do-tempo" title="Linha do tempo">
        <ol className="space-y-3 border-l-2 border-brand-border pl-4 text-sm">
          {p.timeline.map((ev, i) => (
            <li key={i} className="space-y-0.5">
              <div className="text-xs text-brand-muted">{date(ev.at)}{ev.campaignTitle ? ` · ${ev.campaignTitle}` : ""}</div>
              <div><strong>{ev.title}</strong>{ev.detail ? ` — ${ev.detail}` : ""}</div>
              <Chips p={ev.provenance} legend={legend} />
            </li>
          ))}
          {!p.timeline.length && <li className="text-brand-muted">Sem eventos registrados.</li>}
        </ol>
      </Section>

      <Section id="legenda" title="Como ler estas informações">
        <p className="text-sm text-brand-muted">A plataforma não atribui selo de confiabilidade nem nota. Cada informação indica de onde vem, para que você mesmo avalie.</p>
        <dl className="grid gap-3 sm:grid-cols-2">{(Object.keys(legend) as Prov[]).map((k) => <div key={k} className={card}><dt><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${chipColor[k]}`}>{legend[k].label}</span></dt><dd className="mt-1 text-sm">{legend[k].description}</dd></div>)}</dl>
        <p className="text-xs text-brand-muted">Dados pessoais de doadores, fornecedores pessoa física e beneficiários nunca são exibidos. Fotos têm os metadados removidos.</p>
      </Section>
    </div>
  );
}
