import { formatDistanceKm, formatMinutes } from "../utils";

/**
 * As colunas da parada subiram para `routines/pdf/columns` quando a folha da
 * semana passou a imprimir a mesma linha: são a mesma parada vista do mesmo
 * papel. Aqui fica só o que é do DIA — a linha de contexto do cabeçalho, que
 * fala de quilometragem e ponto de saída e não existe na visão semanal.
 */
export {
  buildStopColumns,
  cityRow,
  focusLabel,
  hasProgress,
  negativeNote,
  REMOTE_CONTACT_COLUMNS,
  ROUTE_STOP_COLUMNS,
  STATUS_COLUMN,
  stopReason,
  stopUrgency,
  streetRow,
} from "../../pdf/columns";

export interface RouteContextData {
  sellerName?: string | null;
  departureAddress?: string | null;
  stopsCount: number;
  remoteCount: number;
  routeDistanceKm: string;
  routeDurationMin: number;
}

/**
 * A linha de contexto do cabeçalho: de quem é o dia, de onde ele sai e quanto
 * custa em estrada. Quem recebe a folha impressa não tem a tela ao lado para
 * conferir de quem é a rota.
 */
export const buildRouteContext = (data: RouteContextData): string[] => {
  const lines: string[] = [];
  if (data.sellerName) lines.push(`Vendedor: ${data.sellerName}`);
  lines.push(`${data.stopsCount} parada(s)`);
  if (data.remoteCount > 0) lines.push(`${data.remoteCount} ligação(ões)`);
  if (Number(data.routeDistanceKm) > 0) {
    lines.push(formatDistanceKm(data.routeDistanceKm));
  }
  if (data.routeDurationMin > 0) {
    lines.push(`${formatMinutes(data.routeDurationMin)} de trajeto`);
  }
  if (data.departureAddress) lines.push(`Saída: ${data.departureAddress}`);
  return lines;
};
