import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { api, imagemUrl } from "../services/api";
import { docKinds, evidenceKinds } from "../services/accountability";
import type { Financials } from "../services/accountability";
import { fmtMoney } from "../services/campaigns";
import { fmtCnpj, fmtDate } from "../services/organizations";

interface PubEvidence { id: string; kind: string; mime: string; description: string; date: string }
interface Profile {
  organization: { id: string; name: string; legalName: string; cnpj: string; description: string; city: string | null; state: string | null; validatedAt: string | null };
  totals: Financials;
  campaigns: ({ id: string; title: string; status: string; goalCents: number } & Financials)[];
  expenses: { id: string; date: string; category: string; description: string; amountCents: number; campaignTitle: string | null; supplier: string | null; documents: { id: string; kind: string }[] }[];
  deliveries: { id: string; date: string; item: string; quantityPurchased: number; quantityDistributed: number; unit: string | null; region: string; description: string; campaignTitle: string | null; evidences: PubEvidence[] }[];
  campaignEvidences: (PubEvidence & { campaignTitle: string | null })[];
  notice: string;
}

const file = (kind: "evidences" | "expense-documents", id: string) => imagemUrl(`/transparency/${kind}/${id}/file`)!;

function Evidence({ e }: { e: PubEvidence }) {
  return (
    <figure className="space-y-1 text-xs">
      {e.mime.startsWith("image/") ? <img src={file("evidences", e.id)} alt={e.description} className="h-32 w-full rounded object-cover" loading="lazy" /> : <a className="underline" href={file("evidences", e.id)}>Abrir relatório (PDF)</a>}
      <figcaption>{evidenceKinds[e.kind]} · {e.date}<br />{e.description}</figcaption>
    </figure>
  );
}

export default function Transparencia() {
  const { id } = useParams();
  const [p, setP] = useState<Profile | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => { api.get<Profile>(`/transparency/organizations/${id}`).then((r) => setP(r.data)).catch(() => setErro("Perfil de transparência não encontrado.")); }, [id]);
  if (!p) return <p className="p-8">{erro || "Carregando…"}</p>;
  const t = p.totals;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-text">Transparência — {p.organization.name}</h1>
        <p className="text-sm text-brand-muted">CNPJ {fmtCnpj(p.organization.cnpj)} · {p.organization.city}/{p.organization.state} · instituição validada{p.organization.validatedAt ? ` em ${fmtDate(p.organization.validatedAt).split(",")[0]}` : ""}</p>
        <p className="text-sm">{p.organization.description}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {([["Total arrecadado", fmtMoney(t.totalRaisedCents)], ["Despesas aprovadas", fmtMoney(t.approvedExpensesCents)], ["Saldo restante", fmtMoney(t.balanceCents)], ["Despesas em análise", `${t.pendingExpensesCount} (${fmtMoney(t.pendingExpensesCents)})`], ["Entregas registradas", t.deliveriesRegistered], ["Entregas com evidência aprovada", t.deliveriesVerified]] as [string, string | number][]).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-brand-border bg-brand-surface p-4"><div className="text-xs text-brand-muted">{k}</div><div className="text-lg font-semibold">{v}</div></div>
        ))}
        <p className="text-xs text-brand-muted sm:col-span-3">{p.notice}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Campanhas</h2>
        {p.campaigns.map((c) => (
          <div key={c.id} className="space-y-1 rounded-xl border border-brand-border bg-brand-surface p-4 text-sm">
            <Link className="font-semibold underline" to={`/campanhas/${c.id}`}>{c.title}</Link>
            <ProgressBar value={c.totalRaisedCents} goal={c.goalCents} />
            <p>Arrecadado {fmtMoney(c.totalRaisedCents)} · gasto aprovado {fmtMoney(c.approvedExpensesCents)} · saldo {fmtMoney(c.balanceCents)}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Despesas aprovadas</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-brand-muted"><tr><th className="p-3">Data</th><th>Descrição</th><th>Categoria</th><th>Fornecedor</th><th>Valor</th><th>Comprovantes</th></tr></thead>
            <tbody>
              {p.expenses.map((e) => (
                <tr key={e.id} className="border-t align-top">
                  <td className="p-3">{e.date}</td><td>{e.description}<div className="text-xs text-brand-muted">{e.campaignTitle}</div></td><td>{e.category}</td><td>{e.supplier ?? "—"}</td><td>{fmtMoney(e.amountCents)}</td>
                  <td>{e.documents.length ? e.documents.map((d) => <a key={d.id} className="mr-2 underline" href={file("expense-documents", d.id)}>{docKinds[d.kind]}</a>) : <span className="text-xs text-brand-muted">Verificado pela plataforma (arquivo não público)</span>}</td>
                </tr>
              ))}
              {!p.expenses.length && <tr><td colSpan={6} className="p-4 text-brand-muted">Nenhuma despesa aprovada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Entregas e ações</h2>
        {p.deliveries.map((d) => (
          <article key={d.id} className="space-y-2 rounded-xl border border-brand-border bg-brand-surface p-4 text-sm">
            <h3 className="font-semibold">{d.item} — {d.quantityDistributed} de {d.quantityPurchased} {d.unit ?? ""} distribuídos</h3>
            <p className="text-brand-muted">{d.date} · {d.region}{d.campaignTitle ? ` · ${d.campaignTitle}` : ""}</p>
            <p>{d.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">{d.evidences.map((e) => <Evidence key={e.id} e={e} />)}</div>
          </article>
        ))}
        {!p.deliveries.length && <p className="text-sm text-brand-muted">Nenhuma entrega com evidência aprovada ainda.</p>}
        {p.campaignEvidences.length > 0 && <div className="grid gap-3 sm:grid-cols-4">{p.campaignEvidences.map((e) => <Evidence key={e.id} e={e} />)}</div>}
      </section>
      <p className="text-xs text-brand-muted">Dados pessoais de doadores, fornecedores pessoa física e beneficiários nunca são exibidos. Fotos têm metadados removidos.</p>
    </div>
  );
}
