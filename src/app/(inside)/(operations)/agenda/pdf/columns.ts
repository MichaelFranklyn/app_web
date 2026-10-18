import { ReportColumn } from "@/utils/pdf/table";
import { factoryName } from "@/utils/company";
import { clientDisplayName } from "@/utils/client";
import { VISIT_STATUS_LABEL } from "@/utils/visit";
import { getVisitScoreReasons } from "../utils";
import { VisitScheduleItem } from "../interface";

/**
 * Colunas das folhas de rota — a do dia (`[date]/pdf`) e a da semana
 * (`pdf/index.ts`).
 *
 * Moram aqui, no nível da rotina, porque as duas folhas imprimem a MESMA
 * parada: quem lê o papel quer sempre as mesmas cinco respostas (para onde vou,
 * com quem falo, o que tratar, por quê, e quanto isso urge). Deixar uma cópia
 * em cada módulo garantia que a semana fosse esquecida na próxima vez que a
 * coluna do dia mudasse.
 */

/** Telefone de quem atende no cliente — sem ele a parada não é remarcável na rua. */
const phoneLabel = (stop: VisitScheduleItem): string =>
  stop.clientFactoryLink?.client?.primaryContact?.phone ?? "—";

const clientRow = (stop: VisitScheduleItem): string =>
  clientDisplayName(stop.clientFactoryLink?.client ?? null);

/** Nome fantasia sob a razão social: é por ele que o vendedor reconhece a loja. */
const clientAliasRow = (stop: VisitScheduleItem): string | null =>
  stop.clientFactoryLink?.client?.nomeFantasia ?? null;

/**
 * O endereço quebrado em duas linhas — rua e número em cima, bairro e cidade
 * embaixo. Numa linha só, a rua longa comia o bairro, que é justamente o que
 * situa a loja no mapa mental de quem dirige.
 */
export const streetRow = (stop: VisitScheduleItem): string => {
  const client = stop.clientFactoryLink?.client;
  if (!client?.addressStreet) return "Endereço não cadastrado";
  return client.addressNumber
    ? `${client.addressStreet}, ${client.addressNumber}`
    : client.addressStreet;
};

export const cityRow = (stop: VisitScheduleItem): string | null => {
  const client = stop.clientFactoryLink?.client;
  if (!client) return null;
  const city = client.addressState
    ? [client.addressCity, client.addressState].filter(Boolean).join("/")
    : client.addressCity;
  return [client.addressNeighborhood, city].filter(Boolean).join(" — ") || null;
};

/**
 * "NEGATIVADO — sem pedido novo", sob as fábricas da parada.
 *
 * A visita continua na folha: negativar não desmarca o que já estava agendado
 * (ver `SetClientFactoryNegativeUseCase`). Mas quem sai com o papel na mão não
 * tem a tela ao lado para descobrir que aquela fábrica não vai aceitar o pedido
 * — e é justamente essa a informação que muda a conversa da visita.
 */
export const negativeNote = (stop: VisitScheduleItem): string | null =>
  stop.clientFactoryLink?.isNegative ? "NEGATIVADO — sem pedido novo" : null;

/** Fábricas que motivaram a parada, na mesma leitura do card da tela. */
export const focusLabel = (stop: VisitScheduleItem): string => {
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
export const stopReason = (stop: VisitScheduleItem): string => {
  const [first] = getVisitScoreReasons(stop);
  return first?.explanation.reasons[0]?.short ?? "—";
};

/** Faixa e número do score da parada — o "quanto" sob o "por quê". */
export const stopUrgency = (stop: VisitScheduleItem): string | null => {
  const [first] = getVisitScoreReasons(stop);
  if (!first) return null;
  return `${first.explanation.level.label} · ${first.explanation.total.toFixed(0)}`;
};

/** Horário previsto da parada; contato remoto não tem hora marcada. */
const timeLabel = (stop: VisitScheduleItem): string =>
  stop.plannedStartTime ?? "—";

/**
 * Colunas da folha de rota: a sequência do dia, onde ir, com quem falar e por
 * quê. É a versão de bolso da tela — tudo o que não ajuda a executar a visita
 * (duração, deslocamento, resultado) ficou de fora de propósito.
 */
export const ROUTE_STOP_COLUMNS: ReportColumn<VisitScheduleItem>[] = [
  { header: "#", width: 3, value: (stop) => String(stop.plannedOrder) },
  { header: "HORA", width: 6, value: timeLabel },
  { header: "CLIENTE", width: 23, value: clientRow, sub: clientAliasRow },
  { header: "TELEFONE", width: 11, value: phoneLabel },
  { header: "ENDEREÇO", width: 25, value: streetRow, sub: cityRow },
  { header: "FÁBRICAS", width: 18, value: focusLabel, sub: negativeNote },
  { header: "MOTIVO", width: 14, value: stopReason, sub: stopUrgency },
];

/**
 * Contatos remotos do dia (ligação/WhatsApp): não são paradas de rota, então
 * saem numa lista própria, sem hora nem endereço — o que importa é o telefone.
 */
export const REMOTE_CONTACT_COLUMNS: ReportColumn<VisitScheduleItem>[] = [
  { header: "#", width: 3, value: (stop) => String(stop.plannedOrder) },
  { header: "CLIENTE", width: 30, value: clientRow, sub: clientAliasRow },
  { header: "TELEFONE", width: 14, value: phoneLabel },
  { header: "FÁBRICAS", width: 22, value: focusLabel, sub: negativeNote },
  { header: "MOTIVO", width: 18, value: stopReason, sub: stopUrgency },
];

/**
 * Quantas paradas já saíram do "pendente". Numa rota do passado a folha vira
 * conferência, e aí a situação de cada parada passa a valer uma coluna.
 */
export const hasProgress = (stops: VisitScheduleItem[]): boolean =>
  stops.some((stop) => stop.status !== "PENDING");

/** Coluna de situação, anexada só quando a rota já tem paradas resolvidas. */
export const STATUS_COLUMN: ReportColumn<VisitScheduleItem> = {
  header: "SITUAÇÃO",
  width: 12,
  value: (stop) => VISIT_STATUS_LABEL[stop.status],
};

/**
 * Colunas finais da folha: as fixas e, em rota já executada, a situação. Em uma
 * rota do dia (tudo pendente) a coluna só roubaria largura do endereço.
 */
export const buildStopColumns = (
  stops: VisitScheduleItem[],
  base: ReportColumn<VisitScheduleItem>[]
): ReportColumn<VisitScheduleItem>[] =>
  hasProgress(stops) ? [...base, STATUS_COLUMN] : base;
