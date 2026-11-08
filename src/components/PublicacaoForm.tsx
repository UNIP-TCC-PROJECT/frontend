import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../services/api";
import { accLabel } from "../services/accountability";
import type { AccStatus } from "../services/accountability";
import { fmtMoney } from "../services/campaigns";
import { CATEGORIES } from "../services/transparency";
import { Button } from "./Button";

interface PublicacaoFormProps {
  onCreated: () => void;
}

interface Camp { id: string; title: string }
interface Exp { id: string; campaignId: string; description: string; amountCents: number; status: AccStatus }
interface Del { id: string; campaignId: string; itemDescription: string; deliveredAt: string }

const field = "w-full rounded-lg border border-brand-text/20 bg-white p-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-goldText/30";
const label = "mb-1.5 block text-sm font-medium text-brand-text";
const errMsg = (e: unknown) => {
  const m = (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
  return Array.isArray(m) ? m.join(" ") : m ?? "Não foi possível criar a publicação.";
};

export default function PublicacaoForm({ onCreated }: PublicacaoFormProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ATUALIZACAO");
  const [campaignId, setCampaignId] = useState("");
  const [expenseId, setExpenseId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [doc, setDoc] = useState<File | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [exps, setExps] = useState<Exp[]>([]);
  const [dels, setDels] = useState<Del[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);

  // Vínculos são opcionais: se a organização ainda não está aprovada, as listas simplesmente ficam vazias.
  useEffect(() => {
    void Promise.allSettled([api.get<Camp[]>("/my/campaigns"), api.get<Exp[]>("/my/expenses"), api.get<Del[]>("/my/deliveries")]).then(([c, e, d]) => {
      if (c.status === "fulfilled") setCamps(c.value.data);
      if (e.status === "fulfilled") setExps(e.value.data);
      if (d.status === "fulfilled") setDels(d.value.data);
    });
  }, []);

  const expOptions = exps.filter((x) => !campaignId || x.campaignId === campaignId);
  const delOptions = dels.filter((x) => !campaignId || x.campaignId === campaignId);

  function pick(e: React.ChangeEvent<HTMLInputElement>, set: (f: File | null) => void) {
    const f = e.target.files?.[0] ?? null;
    setError(""); setSuccess("");
    if (f && f.size > 5 * 1024 * 1024) { setError("O arquivo deve ter no máximo 5 MB."); e.target.value = ""; set(null); return; }
    set(f);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!description.trim()) return setError("Escreva o texto da publicação.");
    if (image && !consent) return setError("Confirme a autorização de uso da imagem para enviá-la.");

    const fd = new FormData();
    fd.append("description", description);
    fd.append("category", category);
    if (campaignId) fd.append("campaignId", campaignId);
    if (expenseId) fd.append("expenseId", expenseId);
    if (deliveryId) fd.append("deliveryRecordId", deliveryId);
    if (image) { fd.append("image", image); fd.append("imageConsent", "true"); }

    try {
      setSending(true);
      const { data } = await api.post<{
        id: number;
        reviewStatus: "APROVADA" | "PENDENTE";
      }>("/publicacoes", fd);
      if (doc) {
        const df = new FormData();
        df.append("file", doc);
        await api.post(`/publicacoes/${data.id}/anexos`, df).catch(() => setError("A publicação foi criada, mas o documento não pôde ser anexado. Tente anexá-lo novamente."));
      }
      setDescription(""); setImage(null); setDoc(null); setConsent(false); setCampaignId(""); setExpenseId(""); setDeliveryId("");
      if (imageInput.current) imageInput.current.value = "";
      if (docInput.current) docInput.current.value = "";
      const contentMessage = data.reviewStatus === "PENDENTE"
        ? "Publicação enviada para análise. Ela ficará visível após a aprovação da plataforma."
        : "Publicação publicada com sucesso.";
      const attachmentMessage = image || doc
        ? " Imagens e documentos aparecem para o público depois da análise específica dos arquivos."
        : "";
      setSuccess(contentMessage + attachmentMessage);
      onCreated();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mb-8 w-full rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-xs sm:p-6">
      <h2 className="text-xl font-sans text-brand-text">Nova publicação</h2>
      <p className="mt-1 max-w-4xl text-sm text-brand-muted">Conte o que a instituição está fazendo. Publicações são conteúdo declarado por vocês; só arquivos analisados pela plataforma são exibidos como evidência.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label htmlFor="pub-desc" className={label}>Texto</label>
            <textarea id="pub-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={9} className={`${field} resize-y`} placeholder="Conte as novidades da ONG..." />
            <p className="mt-1 text-right text-xs text-brand-muted">{description.length}/2000</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="pub-cat" className={label}>Categoria</label>
              <select id="pub-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pub-img" className={label}>Foto (JPG, PNG ou WebP; até 5 MB)</label>
              <input ref={imageInput} id="pub-img" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pick(e, setImage)} className={field} />
            </div>
            <div>
              <label htmlFor="pub-doc" className={label}>Documento ou relatório (PDF, opcional)</label>
              <input ref={docInput} id="pub-doc" type="file" accept="application/pdf" onChange={(e) => pick(e, setDoc)} className={field} />
              <p className="mt-1 text-xs text-brand-muted">Não envie documentos com dados pessoais ou bancários. Só é divulgado o que a plataforma analisar e autorizar.</p>
            </div>
          </div>
        </div>

        {image && (
          <label className="flex items-start gap-2 rounded-xl bg-brand-champagne p-3 text-sm text-brand-primaryText">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>Declaro ter autorização para divulgar esta imagem e que ela <strong>não expõe crianças ou pessoas vulneráveis</strong> nem dados pessoais (rostos de beneficiários, documentos, endereços). A imagem só aparece publicamente depois da análise da plataforma.</span>
          </label>
        )}

        {camps.length > 0 && (
          <fieldset className="rounded-xl border border-brand-border bg-brand-background p-4">
            <legend className="px-1 text-sm font-semibold text-brand-text">Vincular à prestação de contas (opcional)</legend>
            <p className="mb-3 text-xs text-brand-muted">O visitante poderá abrir “Ver prestação de contas desta ação”. Só aparecem ao público registros já aprovados pela plataforma.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="pub-camp" className={label}>Campanha</label>
                <select id="pub-camp" value={campaignId} onChange={(e) => { setCampaignId(e.target.value); setExpenseId(""); setDeliveryId(""); }} className={field}>
                  <option value="">Nenhuma</option>
                  {camps.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pub-exp" className={label}>Despesa / compra</label>
                <select id="pub-exp" value={expenseId} onChange={(e) => setExpenseId(e.target.value)} className={field}>
                  <option value="">Nenhuma</option>
                  {expOptions.map((x) => <option key={x.id} value={x.id}>{x.description} · {fmtMoney(x.amountCents)} · {accLabel[x.status]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pub-del" className={label}>Entrega / distribuição</label>
                <select id="pub-del" value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)} className={field}>
                  <option value="">Nenhuma</option>
                  {delOptions.map((x) => <option key={x.id} value={x.id}>{x.itemDescription} · {new Date(x.deliveredAt).toLocaleDateString("pt-BR")}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}

        <Button type="submit" isLoading={sending}>Publicar</Button>
      </form>
    </section>
  );
}
