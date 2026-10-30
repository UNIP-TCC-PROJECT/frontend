export type AccStatus = "ENVIADA" | "EM_ANALISE" | "APROVADA" | "REPROVADA" | "NECESSITA_COMPLEMENTACAO";

export const accLabel: Record<AccStatus, string> = {
  ENVIADA: "Enviada",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  NECESSITA_COMPLEMENTACAO: "Necessita de complementação",
};
export const accColor: Record<AccStatus, string> = {
  ENVIADA: "bg-gray-100 text-gray-700",
  EM_ANALISE: "bg-blue-100 text-blue-800",
  APROVADA: "bg-green-100 text-green-800",
  REPROVADA: "bg-red-100 text-red-800",
  NECESSITA_COMPLEMENTACAO: "bg-orange-100 text-orange-900",
};

export const docKinds: Record<string, string> = {
  NOTA_FISCAL: "Nota fiscal",
  RECIBO: "Recibo",
  COMPROVANTE_PAGAMENTO: "Comprovante de pagamento",
  OUTRO: "Outro documento da compra",
};
export const evidenceKinds: Record<string, string> = {
  FOTO_COMPRA: "Foto da compra",
  FOTO_PRODUTO: "Foto dos produtos",
  FOTO_ACAO: "Foto da ação",
  FOTO_ENTREGA: "Foto da entrega",
  RELATORIO: "Relatório complementar",
};
export const categories = ["Alimentos", "Material escolar", "Medicamentos e higiene", "Transporte", "Despesas operacionais", "Outros"];

export interface Financials {
  totalRaisedCents: number;
  approvedExpensesCents: number;
  balanceCents: number;
  pendingExpensesCents: number;
  pendingExpensesCount: number;
  needsComplementCount: number;
  approvedExpensesCount: number;
  deliveriesRegistered: number;
  deliveriesVerified: number;
}

export interface ExpenseFile { id: string; name: string; kind?: string; status: AccStatus; reviewReason: string | null; publishable?: boolean; createdAt: string }
export interface Expense {
  id: string; campaignId: string; description: string; category: string; supplier: string | null;
  amountCents: number; spentAt: string; status: AccStatus; reviewReason: string | null;
  documents?: ExpenseFile[]; campaignTitle?: string; organizationName?: string;
}
export interface Evidence {
  id: string; kind: string; description: string; takenAt: string; status: AccStatus; reviewReason: string | null;
  mime: string; campaignId: string | null; deliveryRecordId: string | null; responsibleName: string; publishable: boolean;
}
export interface Delivery {
  id: string; campaignId: string; itemDescription: string; quantityPurchased: number; quantityDistributed: number; unit: string | null;
  description: string; deliveredAt: string; region: string; responsibleName: string;
}
