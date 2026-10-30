import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { useAuth } from "../context/useAuth";
import { api, imagemUrl } from "../services/api";
import { donationColor, donationLabel, fmtMoney } from "../services/campaigns";
import type { DonationView, PublicCampaign } from "../services/campaigns";
import { errorMessage, fmtDate } from "../services/organizations";

const btn = "rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50";
const input = "w-full rounded-xl border border-brand-text/15 px-3 py-2 text-sm";

export default function CampanhaDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState<PublicCampaign | null>(null);
  const [valor, setValor] = useState("50");
  const [cpf, setCpf] = useState("");
  const [donation, setDonation] = useState<DonationView | null>(null);
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiado, setCopiado] = useState(false);
  // Uma chave por tentativa: repetir o clique não gera outra cobrança.
  const chave = useRef(crypto.randomUUID());

  useEffect(() => {
    api.get<PublicCampaign>(`/campaigns/${id}`).then((r) => setC(r.data)).catch(() => setErro("Campanha não encontrada."));
  }, [id]);

  // Enquanto o Pix estiver pendente, o servidor confere o pagamento junto ao Asaas (nunca confiamos no navegador).
  useEffect(() => {
    if (!donation || donation.status !== "PENDENTE") return;
    const t = window.setInterval(async () => {
      try {
        const { data } = await api.post<DonationView>(`/my/donations/${donation.id}/sync`);
        setDonation((d) => (d ? { ...data, pix: data.pix ?? d.pix } : d));
        if (data.status === "CONFIRMADA") api.get<PublicCampaign>(`/campaigns/${id}`).then((r) => setC(r.data)).catch(() => undefined);
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 5000);
    return () => window.clearInterval(t);
  }, [donation, id]);

  async function gerarPix() {
    setBusy(true); setErro("");
    const cents = Math.round(Number(valor.replace(",", ".")) * 100);
    try {
      const { data } = await api.post<DonationView>(`/campaigns/${id}/donations`, { amountCents: cents, ...(cpf ? { cpf } : {}) }, { headers: { "Idempotency-Key": chave.current } });
      setDonation(data);
    } catch (e) { setErro(errorMessage(e)); } finally { setBusy(false); }
  }

  if (!c) return <p className="p-8">{erro || "Carregando…"}</p>;
  const pix = donation?.pix;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link to="/campanhas" className="text-sm text-brand-goldText underline">← Campanhas</Link>
      {c.imageUrl && <img src={imagemUrl(c.imageUrl)!} alt="" className="h-64 w-full rounded-2xl object-cover" />}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-brand-text">{c.title}</h1>
        <p className="text-sm text-brand-muted">{c.organizationName} · instituição validada · <Link className="underline" to={`/transparencia/${c.organizationId}`}>prestação de contas</Link>{c.endsAt ? ` · até ${fmtDate(c.endsAt).split(",")[0]}` : ""}</p>
      </header>
      <ProgressBar value={c.raisedCents} goal={c.goalCents} />
      <p className="text-sm">{fmtMoney(c.raisedCents)} arrecadados de {fmtMoney(c.goalCents)} · {c.donationsCount} doação(ões)</p>
      {c.objective && <section><h2 className="font-semibold">Objetivo</h2><p className="whitespace-pre-wrap text-sm">{c.objective}</p></section>}
      <section><h2 className="font-semibold">Sobre a campanha</h2><p className="whitespace-pre-wrap text-sm">{c.description}</p></section>

      <section className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface p-6">
        <h2 className="text-lg font-semibold">Doar via Pix</h2>
        {!user && <p className="text-sm">Para doar, <Link className="underline" to="/auth">entre ou crie sua conta</Link>.</p>}
        {user && user.type !== "DOADOR" && <p className="text-sm text-brand-muted">Apenas contas de doador podem fazer doações.</p>}
        {user?.type === "DOADOR" && !donation && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">{["20", "50", "100", "200"].map((v) => <button key={v} type="button" className="rounded-full border px-3 py-1 text-sm" onClick={() => setValor(v)}>R$ {v}</button>)}</div>
            <label className="block text-sm">Valor (R$)<input className={input} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} /></label>
            {!user.cpf && <label className="block text-sm">CPF (necessário para emitir o Pix)<input className={input} value={cpf} onChange={(e) => setCpf(e.target.value)} /></label>}
            <button className={btn} disabled={busy} onClick={() => void gerarPix()}>Gerar Pix</button>
          </div>
        )}
        {donation && (
          <div className="space-y-3 text-sm">
            <p>Doação de <strong>{fmtMoney(donation.amountCents)}</strong> — <span className={`rounded-full px-2 py-1 text-xs font-semibold ${donationColor[donation.status]}`}>{donationLabel[donation.status]}</span></p>
            {donation.status === "PENDENTE" && pix && (
              <>
                {pix.qrCodeBase64 && <img alt="QR Code Pix" className="h-48 w-48" src={`data:image/png;base64,${pix.qrCodeBase64}`} />}
                {pix.payload && (
                  <div className="space-y-1">
                    <code className="block break-all rounded bg-gray-100 p-2 text-xs">{pix.payload}</code>
                    <button className={btn} onClick={() => { void navigator.clipboard.writeText(pix.payload!); setCopiado(true); }}>{copiado ? "Copiado!" : "Copiar código Pix"}</button>
                  </div>
                )}
                <p className="text-brand-muted">Pague no app do seu banco. A confirmação vem do banco/Asaas e pode levar alguns instantes; esta página verifica automaticamente. Fechar a tela não cancela o Pix.</p>
              </>
            )}
            {donation.status === "CONFIRMADA" && <p className="text-green-800">Pagamento confirmado. Obrigado por apoiar esta campanha! Acompanhe em <Link className="underline" to="/minhas-doacoes">Minhas doações</Link>.</p>}
            {(donation.status === "CANCELADA" || donation.status === "ESTORNADA") && <p>Esta doação não está ativa. Você pode gerar um novo Pix.</p>}
          </div>
        )}
        {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      </section>
    </div>
  );
}
