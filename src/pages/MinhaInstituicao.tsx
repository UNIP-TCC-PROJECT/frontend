import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../services/api";
import type { MyPaymentAccount } from "../services/paymentAccounts";
import {
  REQUIRED_DOCS,
  docTypes,
  errorMessage,
  fmtCnpj,
  fmtDate,
  statusColor,
  statusLabel,
} from "../services/organizations";
import type { OrgDocument, Organization } from "../services/organizations";

const input =
  "w-full rounded-xl border border-brand-text/15 bg-brand-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldText/30";
const btn =
  "rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-onPrimary disabled:opacity-50 disabled:cursor-not-allowed";

const FIELDS: {
  key: string;
  label: string;
  wide?: boolean;
  type?: string;
  textarea?: boolean;
}[] = [
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
  {
    key: "description",
    label: "Descrição das atividades realizadas",
    wide: true,
    textarea: true,
  },
  { key: "legalRepName", label: "Representante legal — nome", wide: true },
  { key: "legalRepCpf", label: "Representante legal — CPF" },
  { key: "legalRepRole", label: "Cargo" },
  {
    key: "legalRepEmail",
    label: "Representante legal — e-mail",
    type: "email",
  },
  { key: "legalRepPhone", label: "Representante legal — telefone" },
];

export default function MinhaInstituicao() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<OrgDocument[]>([]);
  const [conta, setConta] = useState<MyPaymentAccount | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busy, setBusy] = useState(false);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<Record<string, File>>({});

  const carregar = useCallback(async () => {
    try {
      const [{ data }, { data: d }] = await Promise.all([
        api.get<Organization>("/organizations/me"),
        api.get<OrgDocument[]>("/organizations/me/documents"),
      ]);
      setOrg(data);
      setDocs(d);
      // A situação da conta de recebimento só interessa depois da aprovação; falha aqui não atrapalha o resto da página.
      if (data.status === "APROVADA")
        setConta(
          (
            await api
              .get<MyPaymentAccount>("/payment-accounts/me")
              .catch(() => ({ data: null }))
          ).data,
        );
      setForm(
        Object.fromEntries(FIELDS.map((f) => [f.key, data[f.key] ?? ""])),
      );
    } catch (e) {
      setErro(errorMessage(e));
    }
  }, []);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function run(fn: () => Promise<unknown>, ok: string): Promise<boolean> {
    setBusy(true);
    setErro("");
    setAviso("");
    try {
      await fn();
      setAviso(ok);
      await carregar();
      return true;
    } catch (e) {
      setErro(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    // Envia só o que foi preenchido (campos vazios não são aceitos pelo servidor).
    const body = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v.trim() !== ""),
    );
    return run(() => api.patch("/organizations/me", body), "Dados salvos.");
  };

  const enviarDoc = async (type: string, file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);
    const enviado = await run(
      () => api.post("/organizations/me/documents", fd),
      "Documento enviado.",
    );
    if (enviado) {
      setArquivosSelecionados((atuais) => {
        const atualizados = { ...atuais };
        delete atualizados[type];
        return atualizados;
      });
    }
  };

  if (!org) return <p className="p-8">{erro || "Carregando…"}</p>;
  const editavel = !["EM_ANALISE", "SUSPENSA"].includes(org.status);
  const vigentes = docs.filter((d) => !d.supersededAt);
  const pendencias =
    (org.missing?.fields.length ?? 0) + (org.missing?.documents.length ?? 0);

  return (
    <div className="space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="font-semibold text-brand-text text-2xl">
          Minha instituição
        </h1>
        <p className="text-brand-muted text-sm">
          CNPJ {fmtCnpj(org.cnpj)} ·{" "}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[org.status]}`}
          >
            {statusLabel[org.status]}
          </span>
        </p>
        {org.status === "APROVADA" && (
          <p className="text-green-800 text-sm">
            Validação institucional aprovada. O CNPJ conferido habilita o envio
            de publicações, metas e campanhas. A Medalha Branca permite publicar
            esses conteúdos sem análise prévia.
          </p>
        )}
        {org.status !== "APROVADA" && (
          <p className="text-brand-muted text-sm">
            A aprovação institucional é necessária para obter a Medalha Branca.
            Com o CNPJ conferido, você já pode enviar publicações, metas e
            campanhas, que passarão por análise antes da publicação.
          </p>
        )}
        {org.statusReason &&
          ["AGUARDANDO_DOCUMENTACAO", "REPROVADA", "SUSPENSA"].includes(
            org.status,
          ) && (
            <p
              role="alert"
              className="bg-amber-50 p-3 rounded-lg text-amber-900 text-sm"
            >
              <strong>Mensagem da análise:</strong> {org.statusReason}
            </p>
          )}
      </header>

      {erro && (
        <p role="alert" className="text-red-700 text-sm">
          {erro}
        </p>
      )}
      {aviso && (
        <p role="status" className="text-green-800 text-sm">
          {aviso}
        </p>
      )}

      <form
        onSubmit={salvar}
        className="space-y-4 bg-brand-surface p-6 border border-brand-border rounded-2xl"
      >
        <h2 className="font-semibold text-lg">Dados cadastrais</h2>
        <fieldset
          disabled={!editavel || busy}
          className="gap-4 grid md:grid-cols-2"
        >
          {FIELDS.map((f) => (
            <label
              key={f.key}
              className={`text-sm ${f.wide ? "md:col-span-2" : ""}`}
            >
              {f.label}
              {f.textarea ? (
                <textarea
                  className={input}
                  rows={4}
                  value={form[f.key] ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              ) : (
                <input
                  className={input}
                  type={f.type ?? "text"}
                  value={form[f.key] ?? ""}
                  maxLength={f.key === "state" ? 2 : undefined}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
        </fieldset>
        {editavel && (
          <button className={btn} disabled={busy}>
            Salvar dados
          </button>
        )}
      </form>

      {conta && (
        <section className="space-y-2 bg-brand-surface p-6 border border-brand-border rounded-2xl">
          <h2 className="font-semibold text-lg">Conta de recebimento</h2>
          <p className="text-brand-muted text-sm">
            É nela que as doações para a sua instituição são recebidas,
            separadas da conta da plataforma.
          </p>
          <p className="text-sm" role="status">
            <strong>
              {conta.canReceiveDonations
                ? "Pronta para receber doações."
                : "Ainda não recebe doações."}
            </strong>{" "}
            {conta.message}
          </p>
        </section>
      )}

      <section className="space-y-4 bg-brand-surface p-6 border border-brand-border rounded-2xl">
        <h2 className="font-semibold text-lg">Documentos</h2>
        <p className="text-brand-muted text-sm">
          PDF, JPG ou PNG de até 5 MB. Os arquivos ficam privados e só a equipe
          de validação tem acesso.
        </p>
        <ul className="space-y-3">
          {Object.entries(docTypes).map(([type, label]) => {
            const doc = vigentes.find((d) => d.type === type);
            return (
              <li
                key={type}
                className="flex flex-wrap justify-between items-center gap-3 pb-3 border-brand-border border-b text-sm"
              >
                <div>
                  <strong>{label}</strong>
                  {REQUIRED_DOCS.includes(type) ? " *" : ""}
                  <div className="mt-1 text-brand-muted text-xs">
                    {doc
                      ? `${doc.name} · enviado em ${fmtDate(doc.createdAt)}`
                      : "Não enviado"}
                  </div>
                  {doc?.status === "APROVADO" && (
                    <p role="status" className="bg-green-50 mt-2 p-2 rounded text-green-800 text-sm">
                      Documento aprovado pela administração.
                    </p>
                  )}
                  {doc?.status === "PENDENTE" && (
                    <p role="status" className="bg-blue-50 mt-2 p-2 rounded text-blue-800 text-sm">
                      Documento enviado e aguardando análise.
                    </p>
                  )}
                  {doc?.status === "REPROVADO" && (
                    <div role="alert" className="bg-red-50 mt-2 p-3 rounded text-red-900 text-sm">
                      <p className="font-semibold">Este documento precisa ser enviado novamente.</p>
                      <p className="mt-1">
                        <strong>Motivo informado pela administração:</strong>{" "}
                        {doc.reviewReason || "A administração não informou um motivo."}
                      </p>
                      {!editavel && org.status === "EM_ANALISE" && (
                        <p className="mt-1">
                          O cadastro continua em análise. Aguarde a solicitação de documentos complementares para poder reenviar.
                        </p>
                      )}
                      {!editavel && org.status === "SUSPENSA" && (
                        <p className="mt-1">O envio de documentos está bloqueado enquanto a instituição estiver suspensa.</p>
                      )}
                    </div>
                  )}
                </div>
                {editavel && (!doc || doc.status === "REPROVADO") && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`${btn} cursor-pointer`}>
                      {doc ? "Enviar documento" : "Escolher documento"}
                      <input
                        type="file"
                        hidden
                        accept="application/pdf,image/jpeg,image/png"
                        disabled={busy}
                        onChange={(e) => {
                          const arquivo = e.target.files?.[0];
                          if (arquivo) setArquivosSelecionados((atuais) => ({ ...atuais, [type]: arquivo }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {arquivosSelecionados[type] && (
                      <div className="basis-full mt-2 space-y-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                        <p><strong>Arquivo escolhido:</strong> {arquivosSelecionados[type].name}</p>
                        <p>Confirme para enviar este documento à administração. O envio substituirá a versão atual, que continuará no histórico.</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={btn}
                            disabled={busy}
                            onClick={() => void enviarDoc(type, arquivosSelecionados[type])}
                          >
                            Confirmar e enviar documento
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 text-sm underline"
                            disabled={busy}
                            onClick={() => setArquivosSelecionados((atuais) => {
                              const atualizados = { ...atuais };
                              delete atualizados[type];
                              return atualizados;
                            })}
                          >
                            Remover arquivo escolhido
                          </button>
                        </div>
                        <p className="text-xs">Remover arquivo escolhido cancela apenas esta seleção; não apaga documentos já enviados.</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {["INCOMPLETO", "AGUARDANDO_DOCUMENTACAO", "REPROVADA"].includes(
        org.status,
      ) && (
        <section className="space-y-3 bg-brand-surface p-6 border border-brand-border rounded-2xl">
          <h2 className="font-semibold text-lg">Enviar para análise</h2>
          {pendencias > 0 ? (
            <div className="text-brand-muted text-sm">
              Para solicitar a análise, falta:
              <ul className="pl-5 list-disc">
                {org.missing!.fields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
                {org.missing!.documents.map((d) => (
                  <li key={d}>{docTypes[d] ?? d}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-brand-muted text-sm">
              Tudo certo. Ao enviar, consultamos automaticamente bases públicas
              e um administrador revisa seu cadastro e seus documentos.
            </p>
          )}
          <button
            className={btn}
            disabled={busy || pendencias > 0}
            onClick={() =>
              void run(
                () => api.post("/organizations/me/submit"),
                "Cadastro enviado para análise.",
              )
            }
          >
            Solicitar análise
          </button>
        </section>
      )}
      {org.status === "EM_ANALISE" && (
        <p className="bg-amber-50 p-4 rounded-lg text-amber-900 text-sm">
          Seu cadastro está em análise. Você será avisado aqui caso sejam
          necessários documentos complementares.
          {org.checks?.length
            ? ` Última consulta automática: ${fmtDate(org.checks[0].queriedAt)}.`
            : ""}
        </p>
      )}
    </div>
  );
}
