import type { ComponentType } from "react";
import { FaAward, FaChartLine, FaMedal, FaSeedling } from "react-icons/fa";
import { api, imagemUrl } from "./api";
import type { AccStatus, Financials } from "./accountability";

// ---------- Níveis de transparência ----------
export type LevelCode = "INICIAL" | "DESENVOLVIMENTO" | "AVANCADA" | "EXEMPLAR";
export type DimensionStatus = "ATENDIDA" | "PENDENTE" | "NAO_SE_APLICA";

export interface LevelDimension { key: string; label: string; question: string; status: DimensionStatus; met: string[]; pending: string[] }
export interface TransparencyLevel {
  state: "AVALIADA" | "EM_ANDAMENTO";
  level: LevelCode | null;
  levelLabel: string;
  levelMeaning: string;
  dimensions: LevelDimension[];
  nextStep: string | null;
  evaluatedAt: string;
  basedOnActivityAt: string | null;
  rulesVersion: string;
}

export const LEVEL_ORDER: LevelCode[] = ["INICIAL", "DESENVOLVIMENTO", "AVANCADA", "EXEMPLAR"];
export const levelNames: Record<LevelCode, string> = {
  INICIAL: "Transparência inicial",
  DESENVOLVIMENTO: "Transparência em desenvolvimento",
  AVANCADA: "Transparência avançada",
  EXEMPLAR: "Transparência exemplar",
};
export const levelRequirement: Record<LevelCode, string> = {
  INICIAL: "A instituição foi aprovada pela plataforma.",
  DESENVOLVIMENTO: "Identidade conferida em fonte pública e documentos obrigatórios aprovados.",
  AVANCADA: "Além disso, o uso dos recursos recebidos está registrado e comprovado (nos pontos que já se aplicam).",
  EXEMPLAR: "Tudo atendido, informações atualizadas e ao menos uma entrega com evidência aprovada.",
};
// Somente tokens da paleta `brand` do projeto.
export const levelStyle: Record<LevelCode | "NONE", string> = {
  NONE: "border-brand-border bg-brand-background text-brand-muted",
  INICIAL: "border-brand-border bg-brand-champagne text-brand-goldText",
  DESENVOLVIMENTO: "border-brand-gold bg-brand-champagne text-brand-goldText",
  AVANCADA: "border-brand-goldLight bg-brand-goldLight/30 text-brand-primaryText",
  EXEMPLAR: "border-brand-primaryDark bg-brand-primary text-brand-onPrimary",
};
export const levelIcon: Record<LevelCode | "NONE", ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  NONE: FaSeedling, INICIAL: FaSeedling, DESENVOLVIMENTO: FaChartLine, AVANCADA: FaMedal, EXEMPLAR: FaAward,
};
export const dimensionLabel: Record<DimensionStatus, string> = { ATENDIDA: "Atendido", PENDENTE: "Pendente", NAO_SE_APLICA: "Ainda não se aplica" };

// ---------- Procedência ----------
export type Prov = "DECLARADA" | "FONTE_EXTERNA" | "DOCUMENTO_RECEBIDO" | "DOCUMENTO_ANALISADO" | "EVIDENCIA_APROVADA" | "AUDITORIA";

// ---------- Perfil de transparência (subset usado pela UI) ----------
export interface PubEvidence { id: string; kind: string; mime: string; description: string; date: string; status: AccStatus; campaignTitle: string | null; deliveryId: string | null; provenance: Prov[] }
export interface TimelineItem { type: string; at: string; title: string; detail?: string; campaignTitle?: string | null; ref?: { type: "publication" | "campaign" | "expense" | "delivery" | "evidence"; id: string | number }; provenance: Prov[] }
export interface TransparencyProfile {
  identification: { id: string; name: string; legalName: string; cnpj: string; description: string; city: string | null; state: string | null; registeredAt: string };
  transparencyLevel: TransparencyLevel;
  validationHistory: { action: string; label: string; at: string }[];
  lastUpdatedAt: string | null;
  validation: {
    status: string; validatedAt: string | null; lastCheckedAt: string | null; statusNote: string;
    sources: { source: string; label: string; result: string; resultLabel: string; queriedAt: string }[];
    documents: { type: string; label: string; receivedAt: string; state: string; analyzedAt: string | null }[];
  };
  totals: Financials;
  campaigns: ({ id: string; title: string; status: string; goalCents: number; percentReached: number; publicationIds: number[] } & Financials)[];
  expenses: { id: string; date: string; category: string; description: string; amountCents: number; campaignTitle: string | null; status: AccStatus; documents: { id: string; kind: string }[]; documentNote: string | null; publicationIds: number[] }[];
  deliveries: { id: string; date: string; item: string; quantityPurchased: number; quantityDistributed: number; unit: string | null; region: string; description: string; campaignTitle: string | null; purchase: { description: string; amountCents: number; date: string } | null; evidences: PubEvidence[]; publicationIds: number[] }[];
  deliveriesAwaitingVerification: number;
  gallery: PubEvidence[];
  evidenceSummary: { published: number; approvedNotPublished: number; awaitingAnalysis: number; needsComplement: number };
  timeline: TimelineItem[];
  legend: Record<Prov, { label: string; description: string }>;
}

export interface LedgerMovement {
  type: "ENTRADA" | "ESTORNO" | "DESPESA"; id?: string; at: string; recordedAt?: string; approvedAt?: string | null; amountCents: number;
  category?: string; description: string; campaignId: string | null; campaignTitle: string | null; status: string; responsible: string;
  documents?: { id: string; kind: string; sha256: string; mime: string; size: number; analyzedAt: string | null; downloadable: boolean }[];
}
export interface Ledger {
  totals: Financials; movements: LedgerMovement[]; monthly: { month: string; raisedCents: number; approvedExpensesCents: number }[];
  history: { action: string; label: string; at: string; ref: { type: string; id: string } | null }[];
  glossary: Record<string, string>; note: string;
}

// ---------- Publicações ----------
export type Classification = "INSTITUCIONAL" | "DOCUMENTADA" | "EVIDENCIAS_ANALISADAS";
export const CATEGORIES: { id: string; label: string }[] = [
  { id: "ATUALIZACAO", label: "Atualização" }, { id: "NOTICIA", label: "Notícia institucional" }, { id: "ACAO_SOCIAL", label: "Ação social" },
  { id: "EVENTO", label: "Evento" }, { id: "RESULTADO_CAMPANHA", label: "Resultado de campanha" }, { id: "RELATORIO", label: "Relatório de atividades" }, { id: "ENTREGA", label: "Registro de entrega" },
];
export const classificationInfo: Record<Classification, { label: string; description: string }> = {
  INSTITUCIONAL: { label: "Publicação institucional", description: "Conteúdo declarado pela própria ONG. Ainda não foi verificado de forma independente." },
  DOCUMENTADA: { label: "Publicação documentada", description: "Possui arquivos anexados. Eles podem ainda não ter sido analisados pela plataforma." },
  EVIDENCIAS_ANALISADAS: { label: "Evidências analisadas", description: "Há arquivos ou registros ligados a esta publicação que passaram pela análise da plataforma." },
};
export interface Post {
  id: number; ongId: number; organizationId: string | null; description: string; createdAt: string;
  category: string; categoryLabel: string; imageUrl: string | null;
  images: { id: string; url: string }[]; documents: { id: string; url: string; mime: string; sha256: string }[];
  evidenceStatus: { published: number; awaitingAnalysis: number };
  classification: Classification;
  campaign: { id: string; title: string | null } | null;
  accountability: { available: boolean; expenseId: string | null; deliveryRecordId: string | null };
  ong?: { id: number; name: string; profileImage: string | null };
}
export interface PostsPage { items: Post[]; total: number; page: number; limit: number; totalPages: number }

export interface PostAccountability {
  organizationId: string; organizationName: string;
  publication: { id: number; category: string; categoryLabel: string; createdAt: string; description: string };
  campaign: { id: string; title: string; financials: Financials } | null;
  expense: { id: string; date: string; category: string; description: string; amountCents: number; approvedAt: string | null; documents: { id: string; kind: string; sha256: string }[] } | null;
  delivery: { id: string; date: string; item: string; quantityPurchased: number; quantityDistributed: number; unit: string | null; region: string; description: string; evidences: { id: string; kind: string; mime: string; date: string; description: string; sha256: string }[] } | null;
  pending: { expense: boolean; delivery: boolean };
  relatedPublications: { id: number; category: string; createdAt: string }[];
  note: string;
}

// ---------- Acesso ----------
export const fileUrl = (kind: "evidences" | "expense-documents", id: string) => imagemUrl(`/transparency/${kind}/${id}/file`)!;
export const postFileUrl = (url: string) => imagemUrl(url)!;
export const orgIdOfOwner = (userId: number) => api.get<{ organizationId: string }>(`/transparency/by-owner/${userId}`).then((r) => r.data.organizationId);
export const loadProfile = (orgId: string) => api.get<TransparencyProfile>(`/transparency/organizations/${orgId}`).then((r) => r.data);
export const loadLedger = (orgId: string) => api.get<Ledger>(`/transparency/organizations/${orgId}/ledger`).then((r) => r.data);
export const loadPostAccountability = (id: number | string) => api.get<PostAccountability>(`/transparency/publications/${id}/accountability`).then((r) => r.data);

export const fmtDay = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
export const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
export const shortHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-6)}`;
