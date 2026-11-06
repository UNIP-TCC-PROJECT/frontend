import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaUndo } from "react-icons/fa";
import { docKinds } from "../../services/accountability";
import { fmtMoney } from "../../services/campaigns";
import { fileUrl, fmtDateTime, fmtDay } from "../../services/transparency";
import type { Ledger, LedgerMovement } from "../../services/transparency";

const typeInfo = {
  ENTRADA: { label: "Doação recebida", Icon: FaArrowUp, tone: "text-emerald-700" },
  ESTORNO: { label: "Doação estornada", Icon: FaUndo, tone: "text-brand-goldText" },
  DESPESA: { label: "Despesa aprovada", Icon: FaArrowDown, tone: "text-brand-text" },
} as const;

function Movement({ m, glossary }: { m: LedgerMovement; glossary: string }) {
  const { label, Icon, tone } = typeInfo[m.type];
  return (
    <li className="rounded-2xl border border-brand-border bg-brand-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 ${tone}`}><Icon aria-hidden /></span>
          <div>
            <div className="text-sm font-semibold text-brand-text">{label}{m.category ? ` · ${m.category}` : ""}</div>
            <div className="text-xs text-brand-muted">{m.type === "DESPESA" ? fmtDay(m.at) : fmtDateTime(m.at)}{m.campaignTitle ? ` · ${m.campaignTitle}` : ""}</div>
          </div>
        </div>
        <div className={`text-base font-semibold ${tone}`}>{m.amountCents < 0 ? "− " : "+ "}{fmtMoney(Math.abs(m.amountCents))}</div>
      </div>
      <p className="mt-2 text-sm text-brand-text">{m.description}</p>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-brand-goldText">Ver detalhes</summary>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-brand-muted sm:grid-cols-2">
          <div><dt className="inline font-semibold">Situação: </dt><dd className="inline">{m.status === "APROVADA" ? "Aprovada pela plataforma" : m.status === "CONFIRMADA" ? "Confirmada pelo provedor de pagamento" : "Estornada"}</dd></div>
          <div><dt className="inline font-semibold">Responsável: </dt><dd className="inline">{m.responsible}</dd></div>
          {m.recordedAt && <div><dt className="inline font-semibold">Registrada em: </dt><dd className="inline">{fmtDateTime(m.recordedAt)}</dd></div>}
          {m.approvedAt && <div><dt className="inline font-semibold">Aprovada em: </dt><dd className="inline">{fmtDateTime(m.approvedAt)}</dd></div>}
          <div><dt className="inline font-semibold">Valor original: </dt><dd className="inline">{fmtMoney(Math.abs(m.amountCents))}</dd></div>
        </dl>
        {m.documents && m.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-brand-text">Documentos analisados</div>
            {m.documents.map((d) => (
              <div key={d.id} className="rounded-xl bg-brand-background p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-brand-text">{docKinds[d.kind] ?? d.kind} · {(d.size / 1024).toFixed(0)} KB</span>
                  {d.downloadable ? <a className="font-semibold underline" href={fileUrl("expense-documents", d.id)} target="_blank" rel="noreferrer">Abrir arquivo</a> : <span className="text-brand-muted">Analisado, não publicado para proteger dados pessoais</span>}
                </div>
                <div className="mt-1 break-all font-mono text-[11px] text-brand-muted" title={glossary}>SHA-256: {d.sha256}</div>
              </div>
            ))}
          </div>
        )}
      </details>
    </li>
  );
}

/** "Ver dados completos": movimentações com data/hora, documentos com hash, histórico e glossário. */
export default function FinanceFull({ ledger }: { ledger: Ledger }) {
  const [shown, setShown] = useState(10);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-brand-champagne p-4 text-sm text-brand-primaryText">
        <strong>Como ler:</strong>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
          {Object.values(ledger.glossary).map((g) => <li key={g}>{g}</li>)}
        </ul>
      </div>

      <section aria-labelledby="mov-titulo">
        <h4 id="mov-titulo" className="mb-2 text-base font-semibold text-brand-text">Movimentações ({ledger.movements.length})</h4>
        {ledger.movements.length === 0 ? <p className="text-sm text-brand-muted">Ainda não há movimentações confirmadas.</p> : (
          <>
            <ul className="space-y-3">{ledger.movements.slice(0, shown).map((m, i) => <Movement key={`${m.type}-${m.id ?? i}-${m.at}`} m={m} glossary={ledger.glossary.sha256} />)}</ul>
            {shown < ledger.movements.length && <button type="button" onClick={() => setShown((s) => s + 10)} className="mt-3 rounded-full border border-brand-border px-5 py-2 text-sm font-semibold text-brand-primaryText hover:bg-brand-champagne">Mostrar mais</button>}
          </>
        )}
      </section>

      <section aria-labelledby="hist-titulo">
        <h4 id="hist-titulo" className="mb-2 text-base font-semibold text-brand-text">Histórico de alterações</h4>
        <p className="mb-2 text-xs text-brand-muted">{ledger.glossary.historico}</p>
        <ol className="space-y-2 border-l-2 border-brand-border pl-4 text-sm">
          {ledger.history.slice(0, 30).map((h, i) => <li key={`${h.at}-${i}`}><span className="text-xs text-brand-muted">{fmtDateTime(h.at)}</span><div className="text-brand-text">{h.label}</div></li>)}
          {ledger.history.length === 0 && <li className="text-brand-muted">Sem registros.</li>}
        </ol>
      </section>

      <p className="text-xs text-brand-muted">{ledger.note}</p>
    </div>
  );
}
