import { VisitFactory } from "../../interface";

/**
 * O cliente vizinho como a query o traz — nome e praça, nada mais.
 *
 * Não é o `VisitClient` da rotina: `visitPromotionPreview` não seleciona
 * contato, vínculo da carteira nem o endereço completo, e emprestar o tipo
 * maior faria o editor prometer campos que chegam `undefined` na tela.
 */
export interface NearbyClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
}

/** Cliente da região que pode entrar na mesma viagem. */
export interface NearbyCandidate {
  sellerClientFactoryId: string;
  distanceKm: number;
  scoreTotal: string;
  isUrgent: boolean;
  client: NearbyClient | null;
  factory: VisitFactory | null;
}

export interface VisitPromotionPreview {
  /** Dá para ir, visitar e voltar dentro da jornada? */
  isReachable: boolean;
  /** A visita convive com as paradas já marcadas para o dia? */
  fitsWithExisting: boolean;
  /** Entrando ela, o resto do dia não cabe mais. */
  occupiesWholeDay: boolean;
  travelMinOneWay: number;
  distanceKm: number;
  displacedCount: number;
  nearby: NearbyCandidate[];
}

export interface PromotionPreviewQueryData {
  visitPromotionPreview: VisitPromotionPreview;
}

/** O que fazer com as visitas que a viagem expulsa do dia. */
export type DisplacedStrategy = "TO_REMOTE" | "NEXT_DAYS";
