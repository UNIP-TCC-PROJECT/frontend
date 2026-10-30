// Mesma lista do backend (backend/src/common/banks.ts). O servidor confere o código e grava o nome oficial.
export interface Bank { code: string; name: string }

// Mais comuns primeiro; depois ordem alfabética.
const TOP = ["001", "237", "341", "104", "033", "260", "077", "756", "748", "336", "290", "323"];

const ALL: Bank[] = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "260", name: "Nubank" },
  { code: "077", name: "Banco Inter" },
  { code: "336", name: "C6 Bank" },
  { code: "212", name: "Banco Original" },
  { code: "290", name: "PagBank (PagSeguro)" },
  { code: "323", name: "Mercado Pago" },
  { code: "380", name: "PicPay" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "422", name: "Banco Safra" },
  { code: "745", name: "Citibank" },
  { code: "070", name: "BRB – Banco de Brasília" },
  { code: "041", name: "Banrisul" },
  { code: "004", name: "Banco do Nordeste" },
  { code: "003", name: "Banco da Amazônia" },
  { code: "136", name: "Unicred" },
  { code: "133", name: "Cresol" },
  { code: "197", name: "Stone" },
  { code: "208", name: "BTG Pactual" },
  { code: "623", name: "Banco Pan" },
  { code: "655", name: "Banco Votorantim (BV)" },
  { code: "218", name: "Banco BS2" },
  { code: "121", name: "Agibank" },
  { code: "348", name: "Banco XP" },
  { code: "403", name: "Cora" },
  { code: "332", name: "Acesso Soluções de Pagamento" },
  { code: "329", name: "QI Tech" },
  { code: "301", name: "BPP Instituição de Pagamento" },
];

export const BANKS: Bank[] = [
  ...TOP.map((c) => ALL.find((b) => b.code === c)!),
  ...ALL.filter((b) => !TOP.includes(b.code)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
];

export const OTHER_BANK = "OUTRO";
