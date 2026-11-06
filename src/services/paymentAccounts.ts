import { isAxiosError } from "axios";
import { errorMessage } from "./organizations";

export type PaymentAccountStatus =
  | "CRIANDO"
  | "AGUARDANDO_APROVACAO"
  | "ATIVA"
  | "REJEITADA"
  | "BLOQUEADA"
  | "FALHA";

export const paymentStatusLabel: Record<PaymentAccountStatus, string> = {
  CRIANDO: "Criando",
  AGUARDANDO_APROVACAO: "Em análise no Asaas",
  ATIVA: "Ativa",
  REJEITADA: "Rejeitada",
  BLOQUEADA: "Bloqueada",
  FALHA: "Falha na criação",
};

export const paymentStatusColor: Record<PaymentAccountStatus, string> = {
  CRIANDO: "bg-gray-100 text-gray-700",
  AGUARDANDO_APROVACAO: "bg-amber-100 text-amber-900",
  ATIVA: "bg-green-100 text-green-800",
  REJEITADA: "bg-red-100 text-red-800",
  BLOQUEADA: "bg-red-200 text-red-900",
  FALHA: "bg-orange-100 text-orange-900",
};

/** Visão do administrador. Nunca contém a chave de API (ela não sai do backend). */
export interface AdminPaymentAccount {
  exists: boolean;
  status: PaymentAccountStatus | null;
  canProvision: boolean;
  environment?: string;
  statusDetail?: string | null;
  providerStatus?: Record<string, string> | null;
  providerAccountId?: string | null;
  walletIdTail?: string | null;
  approvedAt?: string | null;
  lastCheckedAt?: string | null;
}

/** Visão da própria ONG: só situação e mensagem. */
export interface MyPaymentAccount {
  status: PaymentAccountStatus | null;
  canReceiveDonations: boolean;
  message: string;
}

/** Mensagem de erro, incluindo a lista de dados cadastrais que faltam (HTTP 422). */
export function paymentErrorMessage(error: unknown): string {
  if (isAxiosError(error) && Array.isArray(error.response?.data?.missing)) {
    return `${errorMessage(error)} Faltam: ${error.response!.data.missing.join(", ")}.`;
  }
  return errorMessage(error);
}
