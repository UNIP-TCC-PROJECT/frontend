import { api } from "./api";
import { LEVEL_ORDER } from "./transparency";
import type { LevelCode } from "./transparency";

/** Medalha Branca: CNPJ conferido e validação institucional aprovada. Independente do nível de transparência. */
export type MedalhaBranca =
  | { verificado: false }
  | {
      verificado: true;
      validadoEm: string | null;
      consultadoEm: string | null;
      /** Aprovação administrativa com ressalvas (o motivo fica só no registro interno). */
      comRessalvas: boolean;
      criterios: string[];
    };

/** Nível de transparência (selo dourado), calculado pelo backend. `nivel` nulo = avaliação em andamento. */
export interface NivelTransparenciaResumo {
  nivel: LevelCode | null;
  rotulo: string;
}

export interface SelosOng {
  /** Conferência automática no cadastro: CNPJ, situação, natureza, nome e CNAEs. */
  verificacaoCnpj: { verificado: boolean };
  medalhaBranca: MedalhaBranca;
  nivelTransparencia: NivelTransparenciaResumo | null;
}

export type SelosPorOng = Record<number, SelosOng>;

const IDS_POR_CONSULTA = 50; // limite do endpoint

/** Busca os selos de várias ONGs (em lotes, pelo id do usuário-dono da ONG). */
export async function carregarSelos(ownerIds: number[]): Promise<SelosPorOng> {
  const ids = [...new Set(ownerIds)];
  const lotes: number[][] = [];
  for (let i = 0; i < ids.length; i += IDS_POR_CONSULTA) lotes.push(ids.slice(i, i + IDS_POR_CONSULTA));
  const partes = await Promise.all(
    lotes.map((lote) => api.get<SelosPorOng>("/transparency/selos", { params: { ownerIds: lote.join(",") } }).then((r) => r.data)),
  );
  return Object.assign({}, ...partes) as SelosPorOng;
}

export const temMedalhaBranca = (selos?: SelosOng) => selos?.medalhaBranca.verificado === true;

/** Posição do nível na escala (0 = Inicial … 3 = Exemplar); -1 quando não há nível atribuído. */
export const posicaoNivelTransparencia = (selos?: SelosOng) =>
  selos?.nivelTransparencia?.nivel ? LEVEL_ORDER.indexOf(selos.nivelTransparencia.nivel) : -1;
