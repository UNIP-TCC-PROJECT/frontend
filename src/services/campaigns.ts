export const fmtMoney = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type DonationStatus = "PENDENTE" | "CONFIRMADA" | "CANCELADA" | "ESTORNADA";

export const donationLabel: Record<DonationStatus, string> = {
  PENDENTE: "Aguardando pagamento",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  ESTORNADA: "Estornada",
};
export const donationColor: Record<DonationStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-900",
  CONFIRMADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-gray-100 text-gray-700",
  ESTORNADA: "bg-red-100 text-red-800",
};

export interface PublicCampaign {
  id: string;
  title: string;
  description: string;
  objective: string | null;
  imageUrl: string | null;
  goalCents: number;
  raisedCents: number;
  donationsCount: number;
  startsAt: string | null;
  endsAt: string | null;
  organizationId: string;
  organizationName: string;
}

export interface PixData {
  payload: string | null;
  qrCodeBase64: string | null;
  expiresAt: string | null;
}

export interface DonationView {
  id: string;
  campaignId: string;
  amountCents: number;
  status: DonationStatus;
  createdAt: string;
  confirmedAt: string | null;
  refundedAt: string | null;
  campaignTitle?: string;
  organizationName?: string;
  pix?: PixData;
  pixPayload?: string;
}
