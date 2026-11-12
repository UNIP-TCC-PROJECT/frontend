import { isAxiosError } from "axios";
import { api } from "./api";

export type OrgStatus =
  | "INCOMPLETO"
  | "EM_ANALISE"
  | "AGUARDANDO_DOCUMENTACAO"
  | "APROVADA"
  | "REPROVADA"
  | "SUSPENSA";

export const statusLabel: Record<OrgStatus, string> = {
  INCOMPLETO: "Cadastro incompleto",
  EM_ANALISE: "Em análise",
  AGUARDANDO_DOCUMENTACAO: "Aguardando documentação",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  SUSPENSA: "Suspensa",
};

export const statusColor: Record<OrgStatus, string> = {
  INCOMPLETO: "bg-gray-100 text-gray-700",
  EM_ANALISE: "bg-amber-100 text-amber-900",
  AGUARDANDO_DOCUMENTACAO: "bg-orange-100 text-orange-900",
  APROVADA: "bg-green-100 text-green-800",
  REPROVADA: "bg-red-100 text-red-800",
  SUSPENSA: "bg-red-200 text-red-900",
};

export const docTypes: Record<string, string> = {
  ESTATUTO: "Estatuto social",
  ATA_DIRETORIA: "Ata de eleição e posse da diretoria",
  COMPROVANTE_ENDERECO: "Comprovante de endereço institucional",
  DOC_REPRESENTANTE: "Documento do representante legal",
  CARTAO_CNPJ: "Cartão CNPJ",
  CERTIDAO: "Certidão",
  OUTRO: "Outro (complementar)",
};
export const REQUIRED_DOCS = ["ESTATUTO", "ATA_DIRETORIA", "COMPROVANTE_ENDERECO", "DOC_REPRESENTANTE"];

export interface OrgDocument {
  id: string;
  type: string;
  name: string;
  size: number;
  sha256: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO";
  reviewReason: string | null;
  supersededAt: string | null;
  createdAt: string;
}

export interface ExternalCheck {
  id: string;
  source: string;
  status: "OK" | "ALERTA" | "NAO_ENCONTRADO" | "INDISPONIVEL";
  summary: string;
  findings: string[];
  data: Record<string, unknown> | null;
  httpStatus: number | null;
  queriedAt: string;
}

export interface Organization {
  id: string;
  cnpj: string;
  status: OrgStatus;
  statusReason: string | null;
  missing?: { fields: string[]; documents: string[] };
  [key: string]: any;
}

export interface ContentAccess {
  canSubmit: boolean;
  canPublishWithoutReview: boolean;
  restricted?: boolean;
}

export const CONTENT_RESTRICTED_MESSAGE = "A administração restringiu o envio e as alterações de conteúdo desta ONG.";

export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const m = error.response?.data?.message;
    if (typeof m === "string") return m;
    if (Array.isArray(m)) return m.join(" ");
    if (error.response?.status === 403) return "Acesso negado.";
    if (error.response?.status === 401) return "Sessão expirada. Entre novamente.";
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

export async function downloadFile(url: string, name: string) {
  const { data } = await api.get<Blob>(url, { responseType: "blob" });
  const href = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}

export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");
export const fmtCnpj = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
