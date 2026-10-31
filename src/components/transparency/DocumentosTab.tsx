import { Link } from "react-router-dom";
import { FaFileAlt, FaLock } from "react-icons/fa";
import { accLabel, docKinds, evidenceKinds } from "../../services/accountability";
import { fmtMoney } from "../../services/campaigns";
import { fileUrl, fmtDay } from "../../services/transparency";
import type { TransparencyProfile } from "../../services/transparency";

const card = "rounded-2xl border border-brand-border bg-brand-surface p-4";
const docState: Record<string, { label: string; tone: string }> = {
  RECEBIDO: { label: "Recebido", tone: "bg-brand-champagne text-brand-goldText" },
  ANALISADO_APROVADO: { label: "Aprovado", tone: "bg-emerald-50 text-emerald-800" },
  ANALISADO_REPROVADO: { label: "Reprovado", tone: "bg-red-50 text-red-800" },
};
const Pill = ({ tone, children }: { tone: string; children: string }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{children}</span>;

export default function DocumentosTab({ profile }: { profile: TransparencyProfile }) {
  return (
    <div className="space-y-10">
      <p className="rounded-2xl bg-brand-champagne p-4 text-sm text-brand-primaryText">
        Aqui ficam os documentos e comprovantes. Só é possível abrir arquivos que a plataforma analisou e autorizou a divulgação.
        Documentos com dados pessoais ou bancários nunca são publicados — nesses casos aparece apenas a situação da análise.
      </p>

      <section aria-labelledby="d-inst">
        <h2 id="d-inst" className="mb-3 text-xl font-sans text-brand-text">Documentos institucionais</h2>
        <ul className="space-y-2">
          {profile.validation.documents.map((d) => (
            <li key={d.type} className={`${card} flex flex-wrap items-center justify-between gap-2`}>
              <span className="flex items-center gap-2 text-sm text-brand-text"><FaLock className="text-brand-gold" aria-hidden />{d.label}<span className="text-xs text-brand-muted">· recebido em {fmtDay(d.receivedAt)}{d.analyzedAt ? ` · analisado em ${fmtDay(d.analyzedAt)}` : ""}</span></span>
              <Pill tone={docState[d.state]?.tone ?? ""}>{docState[d.state]?.label ?? d.state}</Pill>
            </li>
          ))}
          {profile.validation.documents.length === 0 && <li className="text-sm text-brand-muted">Nenhum documento registrado.</li>}
        </ul>
        <p className="mt-2 text-xs text-brand-muted">O conteúdo destes documentos é mantido em sigilo; a plataforma os analisa e informa a situação.</p>
      </section>

      <section aria-labelledby="d-comp">
        <h2 id="d-comp" className="mb-3 text-xl font-sans text-brand-text">Notas fiscais e comprovantes de despesas</h2>
        <ul className="space-y-3">
          {profile.expenses.map((e) => (
            <li key={e.id} className={`${card} space-y-1`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-brand-text">{e.description}</strong><Pill tone="bg-emerald-50 text-emerald-800">{accLabel[e.status]}</Pill></div>
              <p className="text-xs text-brand-muted">{fmtDay(e.date)} · {e.category} · {fmtMoney(e.amountCents)}{e.campaignTitle ? ` · ${e.campaignTitle}` : ""}</p>
              {e.documents.length ? (
                <p className="flex flex-wrap gap-3 text-sm">{e.documents.map((d) => <a key={d.id} className="inline-flex items-center gap-1 font-medium underline" href={fileUrl("expense-documents", d.id)} target="_blank" rel="noreferrer"><FaFileAlt aria-hidden />{docKinds[d.kind] ?? d.kind}</a>)}</p>
              ) : <p className="text-xs text-brand-muted">{e.documentNote ?? "Sem comprovante publicado."}</p>}
              {e.publicationIds.length > 0 && <Link className="text-xs font-medium text-brand-goldText underline" to={`/publicacoes/${e.publicationIds[0]}/prestacao`}>Ver publicação e prestação desta ação</Link>}
            </li>
          ))}
          {profile.expenses.length === 0 && <li className="text-sm text-brand-muted">Nenhuma despesa aprovada ainda. Despesas em análise não são exibidas como comprovadas.</li>}
        </ul>
      </section>

      <section aria-labelledby="d-evid">
        <h2 id="d-evid" className="mb-1 text-xl font-sans text-brand-text">Evidências de entregas e atividades</h2>
        <p className="mb-3 text-xs text-brand-muted">
          {profile.evidenceSummary.awaitingAnalysis + profile.evidenceSummary.needsComplement > 0 ? `${profile.evidenceSummary.awaitingAnalysis} aguardando análise e ${profile.evidenceSummary.needsComplement} com pedido de complementação: ainda não são consideradas comprovadas. ` : ""}
          {profile.evidenceSummary.approvedNotPublished > 0 ? `${profile.evidenceSummary.approvedNotPublished} aprovada(s) mantida(s) privada(s) para proteger as pessoas atendidas.` : ""}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.gallery.map((e) => (
            <figure key={e.id} className={`${card} space-y-2 text-xs`}>
              {e.mime.startsWith("image/") ? <img src={fileUrl("evidences", e.id)} alt={e.description} loading="lazy" className="h-40 w-full rounded-xl object-cover" /> : <a className="underline" href={fileUrl("evidences", e.id)}>Abrir relatório (PDF)</a>}
              <figcaption className="space-y-1"><strong>{evidenceKinds[e.kind]}</strong> · {fmtDay(e.date)}<div className="text-brand-muted">{e.description}</div><Pill tone="bg-emerald-50 text-emerald-800">{accLabel[e.status]}</Pill></figcaption>
            </figure>
          ))}
        </div>
        {profile.gallery.length === 0 && <p className="text-sm text-brand-muted">Nenhuma evidência aprovada e publicável ainda.</p>}
      </section>
    </div>
  );
}
