import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { api, imagemUrl } from "../services/api";
import { fmtMoney } from "../services/campaigns";
import { errorMessage, fmtDate } from "../services/organizations";

interface Dash { totalRaisedCents: number; pendingCents: number; refundedCents: number; donationsTotal: number; donationsConfirmed: number; donationsPending: number; donationsCancelled: number; donationsRefunded: number; activeCampaigns: number; campaigns: { id: string; title: string; status: string; goalCents: number; raisedCents: number }[] }
interface Camp { id: string; title: string; status: string; goalCents: number; imageUrl: string | null }
interface Mov { donationId: string; type: "ENTRADA" | "ESTORNO"; amountCents: number; at: string; campaignTitle: string }

const input = "w-full rounded-xl border border-brand-text/15 px-3 py-2 text-sm";
const btn = "rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50";
const empty = { title: "", description: "", objective: "", goal: "", startsAt: "", endsAt: "" };

export default function MinhasCampanhas() {
  const [dash, setDash] = useState<Dash | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [hist, setHist] = useState<Mov[]>([]);
  const [orgOk, setOrgOk] = useState<boolean | null>(null);
  const [form, setForm] = useState(empty);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [o, d, c, h] = await Promise.all([api.get("/organizations/me"), api.get<Dash>("/my/organization/dashboard"), api.get<Camp[]>("/my/campaigns"), api.get<Mov[]>("/my/organization/financial-history")]);
      setOrgOk(o.data.status === "APROVADA"); setDash(d.data); setCamps(c.data); setHist(h.data);
    } catch (e) { setErro(errorMessage(e)); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setErro(""); setAviso("");
    try { await fn(); setAviso(ok); await carregar(); } catch (e) { setErro(errorMessage(e)); }
  }
  const criar = (e: FormEvent) => {
    e.preventDefault();
    return run(async () => {
      await api.post("/my/campaigns", { title: form.title, description: form.description, objective: form.objective, goalCents: Math.round(Number(form.goal.replace(",", ".")) * 100), ...(form.startsAt ? { startsAt: new Date(form.startsAt).toISOString() } : {}), ...(form.endsAt ? { endsAt: new Date(form.endsAt).toISOString() } : {}) });
      setForm(empty);
    }, "Campanha criada como rascunho.");
  };
  const enviarImagem = (id: string, file?: File) => {
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    return run(() => api.post(`/my/campaigns/${id}/image`, fd), "Imagem atualizada.");
  };

  if (orgOk === null) return <p className="p-8">{erro || "Carregando…"}</p>;
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Campanhas e arrecadação</h1>
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {aviso && <p role="status" className="text-green-800">{aviso}</p>}
      {!orgOk && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Sua instituição ainda não foi aprovada. Conclua a validação em <Link className="underline" to="/minha-instituicao">Minha instituição</Link> para publicar campanhas e receber doações.</p>}

      {dash && (
        <section className="grid gap-3 sm:grid-cols-4">
          {[["Total arrecadado", fmtMoney(dash.totalRaisedCents)], ["Doações", dash.donationsTotal], ["Confirmadas", dash.donationsConfirmed], ["Pendentes", `${dash.donationsPending} (${fmtMoney(dash.pendingCents)})`], ["Campanhas ativas", dash.activeCampaigns], ["Canceladas", dash.donationsCancelled], ["Estornadas", `${dash.donationsRefunded} (${fmtMoney(dash.refundedCents)})`]].map(([k, v]) => (
            <div key={k as string} className="rounded-xl border border-brand-border bg-brand-surface p-4"><div className="text-xs text-brand-muted">{k}</div><div className="text-lg font-semibold">{v}</div></div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Minhas campanhas</h2>
        {camps.map((c) => {
          const raised = dash?.campaigns.find((x) => x.id === c.id)?.raisedCents ?? 0;
          return (
            <div key={c.id} className="space-y-2 rounded-xl border border-brand-border bg-brand-surface p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{c.title}</strong><span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{c.status}</span>
              </div>
              {c.imageUrl && <img src={imagemUrl(c.imageUrl)!} alt="" className="h-24 rounded object-cover" />}
              <ProgressBar value={raised} goal={c.goalCents} />
              <p>{fmtMoney(raised)} de {fmtMoney(c.goalCents)}</p>
              <div className="flex flex-wrap gap-2">
                <label className={`${btn} cursor-pointer`}>Imagem<input type="file" hidden accept="image/jpeg,image/png" onChange={(e) => { void enviarImagem(c.id, e.target.files?.[0]); e.target.value = ""; }} /></label>
                {c.status === "RASCUNHO" && <button className={btn} disabled={!orgOk} onClick={() => void run(() => api.post(`/my/campaigns/${c.id}/status`, { status: "ATIVA" }), "Campanha publicada.")}>Publicar</button>}
                {c.status === "ATIVA" && <button className={btn} onClick={() => void run(() => api.post(`/my/campaigns/${c.id}/status`, { status: "ENCERRADA" }), "Campanha encerrada.")}>Encerrar</button>}
              </div>
            </div>
          );
        })}
        {!camps.length && <p className="text-sm text-brand-muted">Nenhuma campanha ainda.</p>}
      </section>

      {orgOk && (
        <form onSubmit={criar} className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface p-6">
          <h2 className="text-lg font-semibold">Nova campanha</h2>
          <input className={input} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className={input} rows={3} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <textarea className={input} rows={2} placeholder="Objetivo (o que será feito com os recursos)" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={input} placeholder="Valor necessário (R$)" inputMode="decimal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} required />
            <label className="text-xs">Início<input type="datetime-local" className={input} value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
            <label className="text-xs">Encerramento<input type="datetime-local" className={input} value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></label>
          </div>
          <button className={btn}>Criar rascunho</button>
        </form>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Histórico financeiro</h2>
        <ul className="divide-y rounded-xl border border-brand-border bg-brand-surface text-sm">
          {hist.map((m, i) => <li key={`${m.donationId}-${m.type}-${i}`} className="flex justify-between p-3"><span>{fmtDate(m.at)} · {m.type === "ENTRADA" ? "Doação confirmada" : "Estorno"} · {m.campaignTitle}</span><strong className={m.amountCents < 0 ? "text-red-700" : "text-green-800"}>{fmtMoney(m.amountCents)}</strong></li>)}
          {!hist.length && <li className="p-3 text-brand-muted">Sem movimentações.</li>}
        </ul>
      </section>
    </div>
  );
}
