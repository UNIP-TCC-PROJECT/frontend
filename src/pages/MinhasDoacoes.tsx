import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { donationColor, donationLabel, fmtMoney } from "../services/campaigns";
import type { DonationView } from "../services/campaigns";
import { errorMessage, fmtDate } from "../services/organizations";

interface Summary { totalConfirmedCents: number; confirmed: number; pending: number; cancelled: number; refunded: number; campaignsSupported: number }

export default function MinhasDoacoes() {
  const [items, setItems] = useState<DonationView[]>([]);
  const [sum, setSum] = useState<Summary | null>(null);
  const [aberto, setAberto] = useState<DonationView | null>(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api.get<DonationView[]>("/my/donations"), api.get<Summary>("/my/donations/summary")]);
      setItems(a.data); setSum(b.data);
    } catch (e) { setErro(errorMessage(e)); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  async function verPix(d: DonationView) {
    try { setAberto((await api.post<DonationView>(`/my/donations/${d.id}/sync`)).data); await carregar(); } catch (e) { setErro(errorMessage(e)); }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Minhas doações</h1>
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {sum && (
        <div className="grid gap-3 sm:grid-cols-4">
          {[["Total doado", fmtMoney(sum.totalConfirmedCents)], ["Confirmadas", sum.confirmed], ["Aguardando", sum.pending], ["Campanhas apoiadas", sum.campaignsSupported]].map(([k, v]) => (
            <div key={k as string} className="rounded-xl border border-brand-border bg-brand-surface p-4"><div className="text-xs text-brand-muted">{k}</div><div className="text-lg font-semibold">{v}</div></div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface">
        <table className="w-full text-left text-sm">
          <thead className="text-brand-muted"><tr><th className="p-3">Data</th><th>Campanha</th><th>ONG</th><th>Valor</th><th>Situação</th><th /></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{fmtDate(d.createdAt)}</td>
                <td><Link className="underline" to={`/campanhas/${d.campaignId}`}>{d.campaignTitle}</Link></td>
                <td>{d.organizationName}</td>
                <td>{fmtMoney(d.amountCents)}</td>
                <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${donationColor[d.status]}`}>{donationLabel[d.status]}</span></td>
                <td>{d.status === "PENDENTE" && <button className="text-brand-goldText underline" onClick={() => void verPix(d)}>Pagar / verificar</button>}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={6} className="p-4 text-brand-muted">Você ainda não fez doações. <Link className="underline" to="/campanhas">Conheça as campanhas</Link>.</td></tr>}
          </tbody>
        </table>
      </div>
      {aberto?.pix && aberto.status === "PENDENTE" && (
        <section className="space-y-2 rounded-xl border border-brand-border bg-brand-surface p-4 text-sm">
          <h2 className="font-semibold">Pix pendente — {fmtMoney(aberto.amountCents)}</h2>
          {aberto.pix.qrCodeBase64 && <img alt="QR Code Pix" className="h-44 w-44" src={`data:image/png;base64,${aberto.pix.qrCodeBase64}`} />}
          {aberto.pix.payload && <code className="block break-all rounded bg-gray-100 p-2 text-xs">{aberto.pix.payload}</code>}
        </section>
      )}
    </div>
  );
}
