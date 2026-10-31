import { FaBoxOpen, FaCoins, FaFileInvoice, FaHourglassHalf, FaPiggyBank, FaReceipt } from "react-icons/fa";
import type { ComponentType } from "react";
import { fmtMoney } from "../../services/campaigns";
import type { Financials } from "../../services/accountability";
import type { Ledger } from "../../services/transparency";

const monthLabel = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

function Stat({ icon: Icon, label, value, hint }: { icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
      <div className="flex items-center gap-2 text-xs text-brand-muted"><Icon className="text-brand-gold" aria-hidden />{label}</div>
      <div className="mt-1 text-xl font-semibold text-brand-text">{value}</div>
      <p className="mt-1 text-xs text-brand-muted">{hint}</p>
    </div>
  );
}

/** Visão simplificada: números derivados dos registros (arrecadação confirmada e despesas aprovadas). */
export default function FinanceSimple({ totals: t, monthly, proofCount }: { totals: Financials; monthly?: Ledger["monthly"]; proofCount: number }) {
  const used = t.totalRaisedCents > 0 ? Math.min(100, Math.round((t.approvedExpensesCents / t.totalRaisedCents) * 100)) : 0;
  const max = Math.max(1, ...(monthly ?? []).flatMap((m) => [m.raisedCents, m.approvedExpensesCents]));
  const registered = t.approvedExpensesCount + t.pendingExpensesCount + t.needsComplementCount;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={FaCoins} label="Total arrecadado" value={fmtMoney(t.totalRaisedCents)} hint="Somente pagamentos confirmados." />
        <Stat icon={FaReceipt} label="Despesas aprovadas" value={fmtMoney(t.approvedExpensesCents)} hint={`${t.approvedExpensesCount} despesa(s) com comprovante analisado.`} />
        <Stat icon={FaPiggyBank} label="Saldo disponível" value={fmtMoney(t.balanceCents)} hint="Arrecadado menos despesas aprovadas." />
        <Stat icon={FaHourglassHalf} label="Despesas em análise" value={`${t.pendingExpensesCount} · ${fmtMoney(t.pendingExpensesCents)}`} hint={`${registered} despesa(s) registrada(s) no total. Em análise não contam como comprovadas.`} />
        <Stat icon={FaBoxOpen} label="Entregas registradas" value={`${t.deliveriesRegistered}`} hint={`${t.deliveriesVerified} com evidência aprovada.`} />
        <Stat icon={FaFileInvoice} label="Comprovantes disponíveis" value={`${proofCount}`} hint="Arquivos que a plataforma analisou e pode divulgar." />
      </div>

      {t.totalRaisedCents > 0 && (
        <figure className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <figcaption className="mb-2 text-sm font-medium text-brand-text">Do que foi arrecadado, quanto já tem despesa aprovada</figcaption>
          <div role="img" aria-label={`${used}% do arrecadado já tem despesa aprovada`} className="flex h-4 overflow-hidden rounded-full bg-brand-border">
            <div className="bg-brand-primaryText" style={{ width: `${used}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-brand-muted"><span>{used}% com despesa aprovada</span><span>{100 - used}% em saldo</span></div>
        </figure>
      )}

      {monthly && monthly.length > 0 && (
        <figure className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-brand-text">
            <span>Por mês</span>
            <span className="flex gap-3 text-xs font-normal text-brand-muted">
              <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-brand-goldLight" />Arrecadado</span>
              <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-brand-primaryText" />Despesas aprovadas</span>
            </span>
          </figcaption>
          <div className="flex h-36 items-end gap-3 overflow-x-auto pb-1" role="img" aria-label="Gráfico mensal de valores arrecadados e despesas aprovadas">
            {monthly.map((m) => (
              <div key={m.month} className="flex min-w-[3rem] flex-1 flex-col items-center gap-1">
                <div className="flex h-28 w-full items-end justify-center gap-1">
                  <div className="w-1/2 max-w-[1.5rem] rounded-t bg-brand-goldLight" style={{ height: `${Math.max(2, (Math.max(0, m.raisedCents) / max) * 100)}%` }} title={`Arrecadado: ${fmtMoney(m.raisedCents)}`} />
                  <div className="w-1/2 max-w-[1.5rem] rounded-t bg-brand-primaryText" style={{ height: `${Math.max(2, (m.approvedExpensesCents / max) * 100)}%` }} title={`Despesas aprovadas: ${fmtMoney(m.approvedExpensesCents)}`} />
                </div>
                <span className="text-[10px] text-brand-muted">{monthLabel(m.month)}</span>
              </div>
            ))}
          </div>
          <ul className="sr-only">{monthly.map((m) => <li key={m.month}>{monthLabel(m.month)}: arrecadado {fmtMoney(m.raisedCents)}, despesas aprovadas {fmtMoney(m.approvedExpensesCents)}</li>)}</ul>
        </figure>
      )}
    </div>
  );
}
