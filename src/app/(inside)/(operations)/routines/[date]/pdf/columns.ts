import { ReportColumn } from "@/utils/pdf/table";
import { factoryName } from "@/utils/company";
import { getVisitScoreReasons } from "../../utils";
import { VisitItem } from "../interface";
import {
  clientLabel,
  formatDistanceKm,
  formatMinutes,
  STOP_STATUS_LABEL,
} from "../utils";

/** Telefone de quem atende no cliente — sem ele a parada não é remarcável na rua. */
const phoneLabel = (stop: VisitItem): string =>
  stop.clientFactoryLink?.client?.primaryContact?.phone ?? "—";

const clientRow = (stop: VisitItem): string =>
  clientLabel(stop.clientFactoryLink?.client ?? null);

/** Nome fantasia sob a razão social: é por ele que o vendedor reconhece a loja. */
const clientAliasRow = (stop: VisitItem): string | null =>
  stop.clientFactoryLink?.client?.nomeFantasia ?? null;

/**
 * O endereço quebrado em duas linhas — rua e número em cima, bairro e cidade
 * embaixo. Numa linha só, a rua longa comia o bairro, que é justamente o que
 * situa a loja no mapa mental de quem dirige.
 */
export const streetRow = (stop: VisitItem): string => {
  const client = stop.clientFactoryLink?.client;
  if (!client?.addressStreet) return "Endereço não cadastrado";
  return client.addressNumber
    ? `${client.addressStreet}, ${client.addressNumber}`
    : client.addressStreet;
};

export const cityRow = (stop: VisitItem): string | null => {
  const client = stop.clientFactoryLink?.client;
  if (!client) return null;
  const city = client.addressState
    ? [client.addressCity, client.addressState].filter(Boolean).join("/")
    : client.addressCity;
  return [client.addressNeighborhood, city].filter(Boolean).join(" — ") || null;
};

/** Fábricas que motivaram a parada, na mesma leitura do card da tela. */
export const focusLabel = (stop: VisitItem): string => {
  const names = (stop.focusFactories ?? [])
    .map((focus) => factoryName(focus.factory))
    .filter((name) => name !== "—");

  if (names.length === 0) return factoryName(stop.clientFactoryLink?.factory);
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
};

/**
 * Por que o sistema mandou o vendedor a esta parada, em três palavras.
 *
 * Na folha impressa não cabe a explicação inteira do painel — cabe o fator que
 * mais pesou ("Estoque acabando"). Sem score calculado a coluna fica vazia em
 * vez de inventar motivo.
 */
export const stopReason = (stop: VisitItem): string => {
  const [first] = getVisitScoreReasons(stop);
  return first?.explanation.reasons[0]?.short ?? "—";
};

/** Faixa e número do score da parada — o "quanto" sob o "por quê". */
export const stopUrgency = (stop: VisitItem): string | null => {
  const [first] = getVisitScoreReasons(stop);
  if (!first) return null;
  return `${first.explanation.level.label} · ${first.explanation.total.toFixed(0)}`;
};

/** Horário previsto da parada; contato remoto não tem hora marcada. */
const timeLabel = (stop: VisitItem): string => stop.plannedStartTime ?? "—";

/**
 * Colunas da folha de rota: a sequência do dia, onde ir, com quem falar e por
 * quê. É a versão de bolso da tela — tudo o que não ajuda a executar a visita
 * (duração, deslocamento, resultado) ficou de fora de propósito.
 */
export const ROUTE_STOP_COLUMNS: ReportColumn<VisitItem>[] = [
  { header: "#", width: 3, value: (stop) => String(stop.plannedOrder) },
  { header: "HORA", width: 6, value: timeLabel },
  { header: "CLIENTE", width: 23, value: clientRow, sub: clientAliasRow },
  { header: "TELEFONE", width: 11, value: phoneLabel },
  { header: "ENDEREÇO", width: 25, value: streetRow, sub: cityRow },
  { header: "FÁBRICAS", width: 18, value: focusLabel },
  { header: "MOTIVO", width: 14, value: stopReason, sub: stopUrgency },
];

/**
 * Contatos remotos do dia (ligação/WhatsApp): não são paradas de rota, então
 * saem numa lista própria, sem hora nem endereço — o que importa é o telefone.
 */
export const REMOTE_CONTACT_COLUMNS: ReportColumn<VisitItem>[] = [
  { header: "#", width: 3, value: (stop) => String(stop.plannedOrder) },
  { header: "CLIENTE", width: 30, value: clientRow, sub: clientAliasRow },
  { header: "TELEFONE", width: 14, value: phoneLabel },
  { header: "FÁBRICAS", width: 22, value: focusLabel },
  { header: "MOTIVO", width: 18, value: stopReason, sub: stopUrgency },
];

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

/**
 * Quantas paradas já saíram do "pendente". Numa rota do passado a folha vira
 * conferência, e aí a situação de cada parada passa a valer uma coluna.
 */
export const hasProgress = (stops: VisitItem[]): boolean =>
  stops.some((stop) => stop.status !== "PENDING");

/** Coluna de situação, anexada só quando a rota já tem paradas resolvidas. */
export const STATUS_COLUMN: ReportColumn<VisitItem> = {
  header: "SITUAÇÃO",
  width: 12,
  value: (stop) => STOP_STATUS_LABEL[stop.status],
};

/**
 * Colunas finais da folha: as fixas e, em rota já executada, a situação. Em uma
 * rota do dia (tudo pendente) a coluna só roubaria largura do endereço.
 */
export const buildStopColumns = (
  stops: VisitItem[],
  base: ReportColumn<VisitItem>[]
): ReportColumn<VisitItem>[] =>
  hasProgress(stops) ? [...base, STATUS_COLUMN] : base;
