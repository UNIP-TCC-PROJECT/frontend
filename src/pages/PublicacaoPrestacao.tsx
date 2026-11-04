import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ProgressBar from "../components/ProgressBar";
import { docKinds, evidenceKinds } from "../services/accountability";
import { fmtMoney } from "../services/campaigns";
import { fileUrl, fmtDay, loadPostAccountability, shortHash } from "../services/transparency";
import type { PostAccountability } from "../services/transparency";

const card = "rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-xs";

/** "Ver prestação de contas desta ação": os registros reais ligados a uma publicação. */
export default function PublicacaoPrestacao() {
  const { id } = useParams();
  const [a, setA] = useState<PostAccountability | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    loadPostAccountability(id!).then((d) => ativo && setA(d)).catch(() => ativo && setErro("Não foi possível carregar a prestação de contas desta publicação."));
    return () => { ativo = false; };
  }, [id]);

  if (erro) return <main className="mx-auto max-w-3xl py-8"><p role="alert" className="text-red-600">{erro}</p><Link to="/publicacoes" className="underline">Voltar</Link></main>;
  if (!a) return <p className="mx-auto max-w-3xl py-8 text-brand-muted" aria-live="polite">Carregando…</p>;

  const nothing = !a.campaign && !a.expense && !a.delivery;
  return (
    <main className="mx-auto max-w-3xl space-y-5 py-8">
      <Link to={`/publicacoes/${a.publication.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-primaryText"><FaArrowLeft aria-hidden />Voltar para a publicação</Link>
      <header>
        <h1 className="text-2xl font-sans text-brand-text">Prestação de contas desta ação</h1>
        <p className="mt-1 text-sm text-brand-muted">{a.organizationName} · {a.publication.categoryLabel} · {fmtDay(a.publication.createdAt)}</p>
        <p className="mt-3 whitespace-pre-wrap text-brand-text">{a.publication.description}</p>
      </header>

      {nothing && <p className={`${card} text-sm text-brand-muted`}>Esta publicação ainda não tem registros aprovados ligados a ela.</p>}

      {a.campaign && (
        <section className={`${card} space-y-2`}>
          <h2 className="text-lg text-brand-text">Campanha</h2>
          <Link className="font-semibold text-brand-goldText underline" to={`/campanhas/${a.campaign.id}`}>{a.campaign.title}</Link>
          <ProgressBar value={a.campaign.financials.totalRaisedCents} goal={Math.max(1, a.campaign.financials.totalRaisedCents)} />
          <p className="text-sm text-brand-muted">Arrecadado {fmtMoney(a.campaign.financials.totalRaisedCents)} · despesas aprovadas {fmtMoney(a.campaign.financials.approvedExpensesCents)} · saldo {fmtMoney(a.campaign.financials.balanceCents)}</p>
        </section>
      )}

      {a.expense && (
        <section className={`${card} space-y-2`}>
          <h2 className="text-lg text-brand-text">Compra / despesa aprovada</h2>
          <p className="text-brand-text">{a.expense.description}</p>
          <p className="text-sm text-brand-muted">{a.expense.category} · <strong className="text-brand-text">{fmtMoney(a.expense.amountCents)}</strong> · {fmtDay(a.expense.date)}{a.expense.approvedAt ? ` · aprovada em ${fmtDay(a.expense.approvedAt)}` : ""}</p>
          {a.expense.documents.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {a.expense.documents.map((d) => (
                <li key={d.id}><a className="font-medium underline" href={fileUrl("expense-documents", d.id)} target="_blank" rel="noreferrer">{docKinds[d.kind] ?? d.kind}</a> <span className="text-xs text-brand-muted" title="Impressão digital do arquivo: ajuda a detectar alterações, mas não comprova sozinha a autenticidade.">SHA-256 {shortHash(d.sha256)}</span></li>
              ))}
            </ul>
          ) : <p className="text-xs text-brand-muted">Comprovante analisado, mas não publicado para proteger dados pessoais.</p>}
        </section>
      )}

      {a.delivery && (
        <section className={`${card} space-y-3`}>
          <h2 className="text-lg text-brand-text">Entrega / distribuição</h2>
          <p className="font-semibold text-brand-text">{a.delivery.item}</p>
          <p className="text-sm text-brand-muted">Adquirido {a.delivery.quantityPurchased} {a.delivery.unit ?? ""} · distribuído {a.delivery.quantityDistributed} {a.delivery.unit ?? ""} · {fmtDay(a.delivery.date)} · {a.delivery.region}</p>
          <p className="text-sm text-brand-text">{a.delivery.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {a.delivery.evidences.map((e) => (
              <figure key={e.id} className="space-y-1 rounded-xl border border-brand-border p-2 text-xs">
                {e.mime.startsWith("image/") ? <img src={fileUrl("evidences", e.id)} alt={e.description} loading="lazy" className="h-40 w-full rounded-lg object-cover" /> : <a className="underline" href={fileUrl("evidences", e.id)}>Abrir relatório (PDF)</a>}
                <figcaption><strong>{evidenceKinds[e.kind]}</strong> · {fmtDay(e.date)}<br />{e.description}<br /><span className="text-brand-muted" title="Impressão digital do arquivo">SHA-256 {shortHash(e.sha256)}</span></figcaption>
              </figure>
            ))}
            {a.delivery.evidences.length === 0 && <p className="text-xs text-brand-muted">Evidências analisadas, mas não publicadas para proteger as pessoas atendidas.</p>}
          </div>
        </section>
      )}

      {(a.pending.expense || a.pending.delivery) && (
        <p className={`${card} bg-brand-champagne text-sm text-brand-primaryText`}>
          {a.pending.expense && "A despesa ligada a esta publicação ainda está em análise. "}
          {a.pending.delivery && "A entrega ligada a esta publicação ainda não tem evidência aprovada. "}
          Itens em análise não são considerados comprovados e por isso não são exibidos.
        </p>
      )}

      {a.relatedPublications.length > 0 && (
        <section className={card}>
          <h2 className="text-lg text-brand-text">Outras publicações sobre o mesmo registro</h2>
          <ul className="mt-2 list-disc pl-5 text-sm">{a.relatedPublications.map((r) => <li key={r.id}><Link className="underline" to={`/publicacoes/${r.id}`}>Publicação de {fmtDay(r.createdAt)}</Link></li>)}</ul>
        </section>
      )}

      <p className="text-xs text-brand-muted">{a.note} <Link className="underline" to={`/ongs`}>Ver todas as ONGs</Link></p>
    </main>
  );
}
