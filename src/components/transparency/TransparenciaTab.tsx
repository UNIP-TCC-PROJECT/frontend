import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../ProgressBar";
import { evidenceKinds } from "../../services/accountability";
import { fmtMoney } from "../../services/campaigns";
import { fileUrl, fmtDay, loadLedger } from "../../services/transparency";
import type { Ledger, TransparencyProfile } from "../../services/transparency";
import FinanceFull from "./FinanceFull";
import FinanceSimple from "./FinanceSimple";
import { LevelLadder } from "./LevelBadge";

const card = "rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-xs";
const H = ({ children, id }: { children: string; id: string }) => <h2 id={id} className="mb-3 text-xl font-sans text-brand-text">{children}</h2>;

export default function TransparenciaTab({ profile }: { profile: TransparencyProfile }) {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [ledgerErr, setLedgerErr] = useState("");
  const [full, setFull] = useState(false);

  useEffect(() => {
    let ativo = true;
    loadLedger(profile.identification.id).then((l) => ativo && setLedger(l)).catch(() => ativo && setLedgerErr("Não foi possível carregar os dados completos agora."));
    return () => { ativo = false; };
  }, [profile.identification.id]);

  const proofCount = profile.expenses.reduce((n, e) => n + e.documents.length, 0) + profile.gallery.length;
  const empty = profile.totals.totalRaisedCents === 0 && profile.totals.approvedExpensesCents === 0 && profile.totals.pendingExpensesCount === 0;

  return (
    <div className="space-y-10">
      <section aria-labelledby="t-nivel">
        <H id="t-nivel">Nível de transparência</H>
        <LevelLadder level={profile.transparencyLevel} />
        <p className="mt-3 text-xs text-brand-muted">Clique em uma medalha para ver os critérios, o que já foi atendido e o que está pendente. Calculado automaticamente; a instituição não escolhe o próprio nível.</p>
      </section>

      <section aria-labelledby="t-fontes">
        <H id="t-fontes">Fontes públicas consultadas</H>
        {profile.validation.sources.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.validation.sources.map((s) => (
              <li key={s.source} className={card}>
                <div className="text-sm font-semibold text-brand-text">{s.label}</div>
                <div className="mt-1 text-xs text-brand-muted">{s.resultLabel}</div>
                <div className="mt-1 text-xs text-brand-muted">Consultada em {fmtDay(s.queriedAt)}</div>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-brand-muted">Nenhuma consulta externa registrada.</p>}
        <p className="mt-2 text-xs text-brand-muted">Uma consulta sem apontamentos não equivale a garantia de regularidade; ela mostra o que as bases públicas indicavam na data.</p>
      </section>

      <section aria-labelledby="t-fin">
        <H id="t-fin">Para onde vão as doações</H>
        {empty ? (
          <p className={`${card} text-sm text-brand-muted`}>Esta instituição ainda não recebeu doações confirmadas pela plataforma. Os números aparecem aqui assim que houver movimentação.</p>
        ) : (
          <FinanceSimple totals={profile.totals} monthly={ledger?.monthly} proofCount={proofCount} />
        )}
        <div className="mt-4">
          <button type="button" aria-expanded={full} aria-controls="dados-completos" onClick={() => setFull((v) => !v)} className="rounded-full border border-brand-primaryDark bg-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-onPrimary shadow-sm transition hover:bg-brand-primaryDark">
            {full ? "Ocultar dados completos" : "Ver dados completos"}
          </button>
          {ledgerErr && <p role="alert" className="mt-2 text-sm text-red-600">{ledgerErr}</p>}
          <div id="dados-completos" className="mt-4" hidden={!full}>
            {full && (ledger ? <FinanceFull ledger={ledger} /> : !ledgerErr && <p className="text-sm text-brand-muted" aria-live="polite">Carregando dados completos…</p>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="t-camp">
        <H id="t-camp">Campanhas</H>
        {profile.campaigns.length === 0 && <p className="text-sm text-brand-muted">Nenhuma campanha publicada.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.campaigns.map((c) => (
            <article key={c.id} className={`${card} space-y-2`}>
              <div className="flex items-start justify-between gap-2"><Link className="font-semibold text-brand-text underline" to={`/campanhas/${c.id}`}>{c.title}</Link><span className="shrink-0 rounded-full bg-brand-champagne px-2 py-0.5 text-[11px] font-semibold text-brand-goldText">{c.status}</span></div>
              <ProgressBar value={c.totalRaisedCents} goal={c.goalCents} />
              <p className="text-xs text-brand-muted">{fmtMoney(c.totalRaisedCents)} de {fmtMoney(c.goalCents)} ({c.percentReached.toLocaleString("pt-BR")}%) · saldo {fmtMoney(c.balanceCents)}</p>
              {c.publicationIds.length > 0 && <Link className="text-xs font-medium text-brand-goldText underline" to={`/publicacoes/${c.publicationIds[0]}`}>{c.publicationIds.length} publicação(ões) sobre esta campanha</Link>}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="t-ent">
        <H id="t-ent">Entregas e atividades</H>
        {profile.deliveriesAwaitingVerification > 0 && <p className="mb-3 text-xs text-brand-muted">{profile.deliveriesAwaitingVerification} entrega(s) registrada(s) ainda sem evidência aprovada: os detalhes só aparecem após a verificação.</p>}
        {profile.deliveries.length === 0 && <p className="text-sm text-brand-muted">Nenhuma entrega verificada ainda.</p>}
        <div className="space-y-4">
          {profile.deliveries.map((d) => (
            <article key={d.id} className={`${card} space-y-3`}>
              <h3 className="font-semibold text-brand-text">{d.item}</h3>
              <p className="text-sm text-brand-muted">Adquirido {d.quantityPurchased} {d.unit ?? ""} · distribuído {d.quantityDistributed} {d.unit ?? ""} · {fmtDay(d.date)} · {d.region}</p>
              <p className="text-sm text-brand-text">{d.description}</p>
              {d.purchase && <p className="text-xs text-brand-muted">Compra associada: {d.purchase.description} — {fmtMoney(d.purchase.amountCents)}</p>}
              <div className="grid gap-3 sm:grid-cols-3">
                {d.evidences.map((e) => (
                  <figure key={e.id} className="space-y-1 text-xs">
                    {e.mime.startsWith("image/") ? <img src={fileUrl("evidences", e.id)} alt={e.description} loading="lazy" className="h-36 w-full rounded-xl object-cover" /> : <a className="underline" href={fileUrl("evidences", e.id)}>Abrir relatório (PDF)</a>}
                    <figcaption className="text-brand-muted">{evidenceKinds[e.kind]} · {e.description}</figcaption>
                  </figure>
                ))}
              </div>
              {d.publicationIds.length > 0 && <Link className="text-xs font-medium text-brand-goldText underline" to={`/publicacoes/${d.publicationIds[0]}`}>Ver publicação sobre esta entrega</Link>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
