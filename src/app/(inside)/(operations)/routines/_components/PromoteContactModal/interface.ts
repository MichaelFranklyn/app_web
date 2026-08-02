import { VisitClient, VisitFactory } from "../../interface";

/** Cliente da região que pode entrar na mesma viagem. */
export interface NearbyCandidate {
  sellerClientFactoryId: string;
  distanceKm: number;
  scoreTotal: string;
  isUrgent: boolean;
  client:
    | (VisitClient & {
        addressCity: string | null;
        addressState: string | null;
      })
    | null;
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
