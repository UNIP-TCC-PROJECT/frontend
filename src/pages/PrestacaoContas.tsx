import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { accColor, accLabel, categories, docKinds, evidenceKinds } from "../services/accountability";
import type { Delivery, Evidence, Expense, Financials } from "../services/accountability";
import { fmtMoney } from "../services/campaigns";
import { downloadFile, errorMessage, fmtDate } from "../services/organizations";

interface Summary extends Financials { campaigns: ({ id: string; title: string; status: string } & Financials)[] }

const input = "w-full rounded-xl border border-brand-text/15 px-3 py-2 text-sm";
const btn = "rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50";
const card = "space-y-3 rounded-2xl border border-brand-border bg-brand-surface p-6";
const today = () => new Date().toISOString().slice(0, 10);
const Badge = ({ s }: { s: keyof typeof accLabel }) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${accColor[s]}`}>{accLabel[s]}</span>;

export default function PrestacaoContas() {
  const [sum, setSum] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [eForm, setEForm] = useState({ campaignId: "", description: "", category: categories[0], supplier: "", supplierDocument: "", amount: "", spentAt: today() });
  const [dForm, setDForm] = useState({ campaignId: "", expenseId: "", itemDescription: "", quantityPurchased: "", quantityDistributed: "", unit: "", region: "", locationDetail: "", description: "", deliveredAt: today() });
  const [vForm, setVForm] = useState({ kind: "FOTO_ENTREGA", description: "", takenAt: today(), link: "" });
  const [vFile, setVFile] = useState<File | null>(null);
  const [kindByExpense, setKindByExpense] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    try {
      const [s, e, d, v] = await Promise.all([api.get<Summary>("/my/accountability/summary"), api.get<Expense[]>("/my/expenses"), api.get<Delivery[]>("/my/deliveries"), api.get<Evidence[]>("/my/evidences")]);
      setSum(s.data); setExpenses(e.data); setDeliveries(d.data); setEvidences(v.data);
    } catch (x) { setErro(errorMessage(x)); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setErro(""); setAviso("");
    try { await fn(); setAviso(ok); await carregar(); } catch (x) { setErro(errorMessage(x)); }
  }
  const campOptions = sum?.campaigns ?? [];

  const salvarDespesa = (e: FormEvent) => {
    e.preventDefault();
    return run(async () => {
      await api.post("/my/expenses", { campaignId: eForm.campaignId, description: eForm.description, category: eForm.category, amountCents: Math.round(Number(eForm.amount.replace(",", ".")) * 100), spentAt: eForm.spentAt, ...(eForm.supplier ? { supplier: eForm.supplier } : {}), ...(eForm.supplierDocument ? { supplierDocument: eForm.supplierDocument } : {}) });
      setEForm({ ...eForm, description: "", supplier: "", supplierDocument: "", amount: "" });
    }, "Despesa registrada. Anexe a nota fiscal ou o recibo.");
  };
  const anexar = (id: string, file?: File) => {
    if (!file) return;
    const fd = new FormData(); fd.append("kind", kindByExpense[id] ?? "NOTA_FISCAL"); fd.append("file", file);
    return run(() => api.post(`/my/expenses/${id}/documents`, fd), "Comprovante enviado para análise.");
  };
  const salvarEntrega = (e: FormEvent) => {
    e.preventDefault();
    return run(async () => {
      await api.post("/my/deliveries", { campaignId: dForm.campaignId, itemDescription: dForm.itemDescription, quantityPurchased: Number(dForm.quantityPurchased), quantityDistributed: Number(dForm.quantityDistributed), description: dForm.description, deliveredAt: dForm.deliveredAt, region: dForm.region, ...(dForm.expenseId ? { expenseId: dForm.expenseId } : {}), ...(dForm.unit ? { unit: dForm.unit } : {}), ...(dForm.locationDetail ? { locationDetail: dForm.locationDetail } : {}) });
      setDForm({ ...dForm, itemDescription: "", quantityPurchased: "", quantityDistributed: "", description: "", locationDetail: "" });
    }, "Entrega registrada. Envie fotos como evidência.");
  };
  const enviarEvidencia = (e: FormEvent) => {
    e.preventDefault();
    if (!vFile || !vForm.link) { setErro("Escolha o arquivo e a entrega/campanha relacionada."); return; }
    const fd = new FormData();
    fd.append("kind", vForm.kind); fd.append("description", vForm.description); fd.append("takenAt", vForm.takenAt); fd.append("file", vFile);
    fd.append(vForm.link.startsWith("d:") ? "deliveryRecordId" : "campaignId", vForm.link.slice(2));
    return run(async () => { await api.post("/my/evidences", fd); setVFile(null); setVForm({ ...vForm, description: "" }); }, "Evidência enviada para análise (ainda não é pública).");
  };

  if (!sum) return <p className="p-8">{erro || "Carregando…"}</p>;
  return (
    <div className="space-y-8 py-8">
      <h1 className="text-2xl font-semibold">Prestação de contas</h1>
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {aviso && <p role="status" className="text-green-800">{aviso}</p>}

      <section className="grid gap-3 sm:grid-cols-3">
        {([["Total arrecadado", fmtMoney(sum.totalRaisedCents)], ["Despesas aprovadas", fmtMoney(sum.approvedExpensesCents)], ["Saldo restante", fmtMoney(sum.balanceCents)], ["Despesas pendentes de análise", `${sum.pendingExpensesCount} (${fmtMoney(sum.pendingExpensesCents)})`], ["Entregas registradas", `${sum.deliveriesRegistered} (${sum.deliveriesVerified} com evidência aprovada)`], ["Precisam de complementação", sum.needsComplementCount]] as [string, string | number][]).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-brand-border bg-brand-surface p-4"><div className="text-xs text-brand-muted">{k}</div><div className="text-lg font-semibold">{v}</div></div>
        ))}
        <p className="text-xs text-brand-muted sm:col-span-3">Valores calculados automaticamente a partir das doações confirmadas e das despesas aprovadas; não podem ser editados. <Link className="underline" to="/minhas-campanhas">Ver campanhas</Link></p>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold">Despesas</h2>
        <form onSubmit={salvarDespesa} className="grid gap-3 md:grid-cols-2">
          <select className={input} required value={eForm.campaignId} onChange={(e) => setEForm({ ...eForm, campaignId: e.target.value })}><option value="">Campanha relacionada…</option>{campOptions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
          <select className={input} value={eForm.category} onChange={(e) => setEForm({ ...eForm, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <input className={`${input} md:col-span-2`} placeholder="Descrição da despesa" required value={eForm.description} onChange={(e) => setEForm({ ...eForm, description: e.target.value })} />
          <input className={input} placeholder="Fornecedor (opcional)" value={eForm.supplier} onChange={(e) => setEForm({ ...eForm, supplier: e.target.value })} />
          <input className={input} placeholder="CPF/CNPJ do fornecedor (uso interno, não é público)" value={eForm.supplierDocument} onChange={(e) => setEForm({ ...eForm, supplierDocument: e.target.value })} />
          <input className={input} placeholder="Valor (R$)" inputMode="decimal" required value={eForm.amount} onChange={(e) => setEForm({ ...eForm, amount: e.target.value })} />
          <input className={input} type="date" max={today()} required value={eForm.spentAt} onChange={(e) => setEForm({ ...eForm, spentAt: e.target.value })} />
          <button className={btn}>Registrar despesa</button>
        </form>
        <ul className="space-y-3 text-sm">
          {expenses.map((x) => {
            const editavel = x.status === "ENVIADA" || x.status === "NECESSITA_COMPLEMENTACAO";
            return (
              <li key={x.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong>{x.description}</strong><Badge s={x.status} /></div>
                <div className="text-brand-muted">{x.category} · {fmtMoney(x.amountCents)} · {x.spentAt}{x.supplier ? ` · ${x.supplier}` : ""}</div>
                {x.reviewReason && <p className="rounded bg-orange-50 p-2 text-orange-900">Análise: {x.reviewReason}</p>}
                <ul className="text-xs text-brand-muted">{x.documents?.map((d) => <li key={d.id}>{docKinds[d.kind ?? "OUTRO"]} — {d.name} <Badge s={d.status} /> <button className="underline" onClick={() => void downloadFile(`/expense-documents/${d.id}/file`, d.name)}>abrir</button>{d.reviewReason ? ` · ${d.reviewReason}` : ""}</li>)}</ul>
                {editavel && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="rounded border px-2 py-1" value={kindByExpense[x.id] ?? "NOTA_FISCAL"} onChange={(e) => setKindByExpense({ ...kindByExpense, [x.id]: e.target.value })}>{Object.entries(docKinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <label className={`${btn} cursor-pointer`}>Anexar comprovante<input type="file" hidden accept="application/pdf,image/jpeg,image/png" onChange={(e) => { void anexar(x.id, e.target.files?.[0]); e.target.value = ""; }} /></label>
                    {x.status === "NECESSITA_COMPLEMENTACAO" && <button className={btn} onClick={() => void run(() => api.post(`/my/expenses/${x.id}/resubmit`), "Despesa reenviada para análise.")}>Reenviar para análise</button>}
                  </div>
                )}
              </li>
            );
          })}
          {!expenses.length && <li className="text-brand-muted">Nenhuma despesa registrada.</li>}
        </ul>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold">Entregas</h2>
        <p className="text-xs text-brand-muted">Não informe nomes, CPF ou endereços de beneficiários. Use apenas a região (bairro/município) como local público.</p>
        <form onSubmit={salvarEntrega} className="grid gap-3 md:grid-cols-2">
          <select className={input} required value={dForm.campaignId} onChange={(e) => setDForm({ ...dForm, campaignId: e.target.value })}><option value="">Campanha relacionada…</option>{campOptions.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
          <select className={input} value={dForm.expenseId} onChange={(e) => setDForm({ ...dForm, expenseId: e.target.value })}><option value="">Despesa de origem (opcional)</option>{expenses.filter((x) => !dForm.campaignId || x.campaignId === dForm.campaignId).map((x) => <option key={x.id} value={x.id}>{x.description}</option>)}</select>
          <input className={`${input} md:col-span-2`} placeholder="O que foi adquirido" required value={dForm.itemDescription} onChange={(e) => setDForm({ ...dForm, itemDescription: e.target.value })} />
          <input className={input} type="number" min={0} placeholder="Quantidade comprada" required value={dForm.quantityPurchased} onChange={(e) => setDForm({ ...dForm, quantityPurchased: e.target.value })} />
          <input className={input} type="number" min={0} placeholder="Quantidade distribuída" required value={dForm.quantityDistributed} onChange={(e) => setDForm({ ...dForm, quantityDistributed: e.target.value })} />
          <input className={input} placeholder="Unidade (cestas, kits…)" value={dForm.unit} onChange={(e) => setDForm({ ...dForm, unit: e.target.value })} />
          <input className={input} type="date" max={today()} required value={dForm.deliveredAt} onChange={(e) => setDForm({ ...dForm, deliveredAt: e.target.value })} />
          <input className={input} placeholder="Região da entrega (pública) — ex.: Zona Leste, São Paulo/SP" required value={dForm.region} onChange={(e) => setDForm({ ...dForm, region: e.target.value })} />
          <input className={input} placeholder="Detalhe do local (interno, não é público)" value={dForm.locationDetail} onChange={(e) => setDForm({ ...dForm, locationDetail: e.target.value })} />
          <textarea className={`${input} md:col-span-2`} rows={3} placeholder="Descrição da atividade" required value={dForm.description} onChange={(e) => setDForm({ ...dForm, description: e.target.value })} />
          <button className={btn}>Registrar entrega</button>
        </form>
        <ul className="space-y-2 text-sm">{deliveries.map((d) => <li key={d.id} className="rounded-lg border p-3"><strong>{d.itemDescription}</strong> — {d.quantityDistributed}/{d.quantityPurchased} {d.unit ?? ""} · {d.deliveredAt} · {d.region}<div className="text-xs text-brand-muted">Responsável: {d.responsibleName}</div></li>)}{!deliveries.length && <li className="text-brand-muted">Nenhuma entrega registrada.</li>}</ul>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold">Evidências</h2>
        <p className="text-xs text-brand-muted">JPG, PNG ou PDF até 5 MB. Metadados das fotos (como GPS) são removidos. Nada é público antes da aprovação do administrador.</p>
        <form onSubmit={enviarEvidencia} className="grid gap-3 md:grid-cols-2">
          <select className={input} value={vForm.kind} onChange={(e) => setVForm({ ...vForm, kind: e.target.value })}>{Object.entries(evidenceKinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select className={input} required value={vForm.link} onChange={(e) => setVForm({ ...vForm, link: e.target.value })}><option value="">Vincular a…</option>{deliveries.map((d) => <option key={d.id} value={`d:${d.id}`}>Entrega: {d.itemDescription}</option>)}{campOptions.map((c) => <option key={c.id} value={`c:${c.id}`}>Campanha: {c.title}</option>)}</select>
          <input className={`${input} md:col-span-2`} placeholder="Descrição da evidência" required value={vForm.description} onChange={(e) => setVForm({ ...vForm, description: e.target.value })} />
          <input className={input} type="date" max={today()} required value={vForm.takenAt} onChange={(e) => setVForm({ ...vForm, takenAt: e.target.value })} />
          <input className={input} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setVFile(e.target.files?.[0] ?? null)} />
          <button className={btn}>Enviar evidência</button>
        </form>
        <ul className="space-y-2 text-sm">{evidences.map((v) => <li key={v.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{evidenceKinds[v.kind]}</strong><Badge s={v.status} /></div>{v.description} · {fmtDate(v.takenAt).split(",")[0]} <button className="underline" onClick={() => void downloadFile(`/evidences/${v.id}/file`, `evidencia-${v.id.slice(0, 8)}`)}>abrir</button>{v.reviewReason && <p className="mt-1 rounded bg-orange-50 p-2 text-orange-900">Análise: {v.reviewReason}</p>}{v.status === "APROVADA" && <p className="text-xs text-brand-muted">{v.publishable ? "Visível no perfil público." : "Aprovada, mas mantida privada."}</p>}</li>)}{!evidences.length && <li className="text-brand-muted">Nenhuma evidência enviada.</li>}</ul>
      </section>
    </div>
  );
}
