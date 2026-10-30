import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import {
  REQUIRED_DOCS, docTypes, errorMessage, fmtCnpj, fmtDate, statusColor, statusLabel,
} from "../services/organizations";
import type { OrgDocument, Organization } from "../services/organizations";

const input =
  "w-full rounded-xl border border-brand-text/15 bg-brand-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30";
const btn =
  "rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50 disabled:cursor-not-allowed";

const FIELDS: { key: string; label: string; wide?: boolean; type?: string; textarea?: boolean }[] = [
  { key: "legalName", label: "Razão social", wide: true },
  { key: "tradeName", label: "Nome fantasia", wide: true },
  { key: "email", label: "E-mail institucional", type: "email" },
  { key: "phone", label: "Telefone" },
  { key: "zip", label: "CEP" },
  { key: "street", label: "Logradouro", wide: true },
  { key: "number", label: "Número" },
  { key: "complement", label: "Complemento" },
  { key: "district", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "UF" },
  { key: "description", label: "Descrição das atividades realizadas", wide: true, textarea: true },
  { key: "legalRepName", label: "Representante legal — nome", wide: true },
  { key: "legalRepCpf", label: "Representante legal — CPF" },
  { key: "legalRepRole", label: "Cargo" },
  { key: "legalRepEmail", label: "Representante legal — e-mail", type: "email" },
  { key: "legalRepPhone", label: "Representante legal — telefone" },
];

export default function MinhaInstituicao() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<OrgDocument[]>([]);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busy, setBusy] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [{ data }, { data: d }] = await Promise.all([
        api.get<Organization>("/organizations/me"),
        api.get<OrgDocument[]>("/organizations/me/documents"),
      ]);
      setOrg(data);
      setDocs(d);
      setForm(Object.fromEntries(FIELDS.map((f) => [f.key, data[f.key] ?? ""])));
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true); setErro(""); setAviso("");
    try { await fn(); setAviso(ok); await carregar(); } catch (e) { setErro(errorMessage(e)); } finally { setBusy(false); }
  }

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    // Envia só o que foi preenchido (campos vazios não são aceitos pelo servidor).
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ""));
    return run(() => api.patch("/organizations/me", body), "Dados salvos.");
  };

  const enviarDoc = (type: string, file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);
    return run(() => api.post("/organizations/me/documents", fd), "Documento enviado.");
  };

  if (!org) return <p className="p-8">{erro || "Carregando…"}</p>;
  const editavel = !["EM_ANALISE", "SUSPENSA"].includes(org.status);
  const vigentes = docs.filter((d) => !d.supersededAt);
  const pendencias = (org.missing?.fields.length ?? 0) + (org.missing?.documents.length ?? 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-brand-text">Minha instituição</h1>
        <p className="text-sm text-brand-muted">
          CNPJ {fmtCnpj(org.cnpj)} ·{" "}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[org.status]}`}>
            {statusLabel[org.status]}
          </span>
        </p>
        {org.status === "APROVADA" && <p className="text-sm text-green-800">Instituição validada: você já pode publicar campanhas.</p>}
        {org.status !== "APROVADA" && <p className="text-sm text-brand-muted">Campanhas e doações só ficam disponíveis depois da aprovação pela nossa equipe.</p>}
        {org.statusReason && ["AGUARDANDO_DOCUMENTACAO", "REPROVADA", "SUSPENSA"].includes(org.status) && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Mensagem da análise:</strong> {org.statusReason}
          </p>
        )}
      </header>

      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      {aviso && <p role="status" className="text-sm text-green-800">{aviso}</p>}

      <form onSubmit={salvar} className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-6">
        <h2 className="text-lg font-semibold">Dados cadastrais</h2>
        <fieldset disabled={!editavel || busy} className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={`text-sm ${f.wide ? "md:col-span-2" : ""}`}>
              {f.label}
              {f.textarea ? (
                <textarea className={input} rows={4} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <input className={input} type={f.type ?? "text"} value={form[f.key] ?? ""} maxLength={f.key === "state" ? 2 : undefined} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
        </fieldset>
        {editavel && <button className={btn} disabled={busy}>Salvar dados</button>}
      </form>

      <section className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-6">
        <h2 className="text-lg font-semibold">Documentos</h2>
        <p className="text-sm text-brand-muted">PDF, JPG ou PNG de até 5 MB. Os arquivos ficam privados e só a equipe de validação tem acesso.</p>
        <ul className="space-y-3">
          {Object.entries(docTypes).map(([type, label]) => {
            const doc = vigentes.find((d) => d.type === type);
            return (
              <li key={type} className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-3 text-sm">
                <div>
                  <strong>{label}</strong>{REQUIRED_DOCS.includes(type) ? " *" : ""}
                  <div className="text-brand-muted">
                    {doc ? `${doc.name} · enviado em ${fmtDate(doc.createdAt)} · ${doc.status === "PENDENTE" ? "aguardando análise" : doc.status === "APROVADO" ? "aprovado" : `reprovado${doc.reviewReason ? `: ${doc.reviewReason}` : ""}`}` : "Não enviado"}
                  </div>
                </div>
                {editavel && (
                  <label className={`${btn} cursor-pointer`}>
                    {doc ? "Substituir" : "Enviar"}
                    <input type="file" hidden accept="application/pdf,image/jpeg,image/png" disabled={busy} onChange={(e) => { void enviarDoc(type, e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {["INCOMPLETO", "AGUARDANDO_DOCUMENTACAO", "REPROVADA"].includes(org.status) && (
        <section className="space-y-3 rounded-2xl border border-brand-border bg-brand-surface p-6">
          <h2 className="text-lg font-semibold">Enviar para análise</h2>
          {pendencias > 0 ? (
            <div className="text-sm text-brand-muted">
              Para solicitar a análise, falta:
              <ul className="list-disc pl-5">
                {org.missing!.fields.map((f) => <li key={f}>{f}</li>)}
                {org.missing!.documents.map((d) => <li key={d}>{docTypes[d] ?? d}</li>)}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-brand-muted">Tudo certo. Ao enviar, consultamos automaticamente bases públicas e um administrador revisa seu cadastro e seus documentos.</p>
          )}
          <button className={btn} disabled={busy || pendencias > 0} onClick={() => void run(() => api.post("/organizations/me/submit"), "Cadastro enviado para análise.")}>
            Solicitar análise
          </button>
        </section>
      )}
      {org.status === "EM_ANALISE" && (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          Seu cadastro está em análise. Você será avisado aqui caso sejam necessários documentos complementares.
          {org.checks?.length ? ` Última consulta automática: ${fmtDate(org.checks[0].queriedAt)}.` : ""}
        </p>
      )}
    </div>
  );
}
