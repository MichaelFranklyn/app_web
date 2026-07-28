import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { ChartData, optionToData } from "./chartCustomize";
import { ChartInsightSpec, ChartUnit } from "./interface";
import { formatDays, formatPercent, monthKeyToLabel } from "./utils";

/** Leitura automática do gráfico, exibida no topo do "?". */
export interface ChartInsight {
  /** O que os números da tela estão dizendo, em 1–2 frases. */
  text: string;
  /** Ressalva que muda a leitura (mês ainda em andamento, poucos dados). */
  note?: string;
}

/** Variação abaixo disso é ruído de arredondamento, não movimento. */
const FLAT_RATIO = 0.03;

/** A partir daqui a sequência de quedas deixa de ser azar do mês. */
const STREAK_MIN = 3;

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

const formatValue = (value: number, unit: ChartUnit): string => {
  if (unit === "money") return formatMoney(value);
  if (unit === "days") return formatDays(value);
  if (unit === "percent") return formatPercent(value);
  return formatNumber(Math.round(value));
};

/** "Viraram pedido" → "viraram pedido" (nome de série no meio da frase). */
const lower = (name: string): string =>
  name.charAt(0).toLowerCase() + name.slice(1);

/** Rótulo do mês corrente no mesmo formato do eixo ("jul/26"). */
const currentMonthLabel = (today: Date): string =>
  monthKeyToLabel(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

/** Categorias ordenadas por valor, da maior para a menor. */
const byValue = (
  data: ChartData,
  seriesIndex = 0
): { name: string; value: number }[] =>
  data.categories
    .map((name, i) => ({
      name,
      value: data.series[seriesIndex]?.values[i] ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

/**
 * Separa o mês corrente do resto da série temporal.
 *
 * O período padrão vai até hoje, então a última coluna é quase sempre um mês
 * pela metade. Comparar ela com o mês anterior inteiro daria "caiu" todo mês —
 * por isso a leitura usa só os meses fechados e avisa que o atual está em
 * andamento.
 */
const splitOngoing = (
  data: ChartData,
  today: Date
): { labels: string[]; closedLength: number; ongoing: string | null } => {
  const labels = data.categories;
  const last = labels[labels.length - 1];
  const ongoing = last === currentMonthLabel(today) ? last : null;
  return {
    labels,
    closedLength: ongoing ? labels.length - 1 : labels.length,
    ongoing,
  };
};

// ── Uma série ao longo dos meses ───────────────────────────────────────────
const buildTrend = (
  data: ChartData,
  spec: ChartInsightSpec,
  today: Date
): ChartInsight | null => {
  const serie = data.series[0];
  if (!serie) return null;

  const { labels, closedLength, ongoing } = splitOngoing(data, today);
  const values = serie.values.slice(0, closedLength);
  if (values.length < 2) return null;

  const lastLabel = labels[values.length - 1];
  const prevLabel = labels[values.length - 2];
  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  const ratio = prev > 0 ? (last - prev) / prev : null;
  const comparison =
    ratio === null
      ? ""
      : Math.abs(ratio) < FLAT_RATIO
        ? `, praticamente igual a ${prevLabel}`
        : `, ${formatPercent(Math.abs(ratio))} ${ratio > 0 ? "acima" : "abaixo"} de ${prevLabel}`;

  let downs = 0;
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i] >= values[i - 1]) break;
    downs++;
  }
  const streak =
    downs >= STREAK_MIN ? ` É o ${downs}º mês seguido de queda.` : "";

  return {
    text: `${lastLabel} fechou em ${formatValue(last, spec.unit)}${comparison}.${streak}`,
    note: ongoing ? `${ongoing} ainda está em andamento.` : undefined,
  };
};

// ── Várias séries ao longo dos meses ───────────────────────────────────────
const buildLeader = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const totals = data.series
    .map((s) => ({ name: s.name, value: sum(s.values) }))
    .sort((a, b) => b.value - a.value);
  const top = totals[0];
  if (!top || top.value <= 0) return null;

  const total = sum(totals.map((t) => t.value));
  const share =
    total > 0 ? ` — ${formatPercent(top.value / total)} do total` : "";

  return {
    text: `No período, ${top.name} lidera com ${formatValue(top.value, spec.unit)}${share}.`,
  };
};

// ── Barras por entidade ────────────────────────────────────────────────────
const buildRanking = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const ranked = byValue(data);
  const top = ranked[0];
  if (!top) return null;

  const parts = [
    `No topo: ${top.name}, com ${formatValue(top.value, spec.unit)}.`,
  ];

  // "Os 3 primeiros somam 62%" só faz sentido em coisa que soma: faturamento e
  // nº de pedidos, sim; ticket médio, prazo e porcentagem, não.
  const total = sum(ranked.map((r) => r.value));
  if (spec.additive && ranked.length >= 4 && total > 0) {
    const head = sum(ranked.slice(0, 3).map((r) => r.value));
    parts.push(
      `Os 3 primeiros somam ${formatPercent(head / total)} do total de ${ranked.length} ${spec.subject}.`
    );
  }

  if (spec.topIsBad) parts.push("Quanto mais alto, mais urgente.");

  return { text: parts.join(" ") };
};

// ── Rosca ──────────────────────────────────────────────────────────────────
const buildShare = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const ranked = byValue(data);
  const top = ranked[0];
  const total = sum(ranked.map((r) => r.value));
  if (!top || total <= 0) return null;

  return {
    text: `Maior fatia: ${top.name}, com ${formatPercent(top.value / total)} do total, entre ${ranked.length} ${spec.subject}.`,
  };
};

// ── Barra + linha acumulada ────────────────────────────────────────────────
const buildConcentration = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const cumulative = data.series[1];
  if (!cumulative || cumulative.values.length === 0) return null;

  // A linha vem em ordem decrescente de valor: a posição N já é a soma dos N
  // maiores. Com menos de 3 categorias, lê-se o que houver.
  const index = Math.min(2, cumulative.values.length - 1);
  const share = cumulative.values[index];
  if (!share) return null;

  return {
    text: `Os ${index + 1} maiores ${spec.subject} concentram ${formatPercent(share)} do total.`,
  };
};

// ── Barra de volume + linha de taxa ────────────────────────────────────────
const buildRate = (
  data: ChartData,
  spec: ChartInsightSpec,
  today: Date
): ChartInsight | null => {
  const volume = data.series[0];
  const rate = data.series[1];
  if (!volume || !rate) return null;

  const { labels, closedLength, ongoing } = splitOngoing(data, today);
  const volumes = volume.values.slice(0, closedLength);
  const rates = rate.values.slice(0, closedLength);
  if (rates.length === 0) return null;

  // Média ponderada pelo volume do mês: um mês com 2 visitas não pode pesar o
  // mesmo que um com 80 na hora de dizer a taxa do período.
  const total = sum(volumes);
  const weighted =
    total > 0 ? sum(volumes.map((v, i) => v * (rates[i] ?? 0))) / total : 0;

  const lastLabel = labels[rates.length - 1];
  const lastRate = rates[rates.length - 1];

  return {
    text: `No período, ${formatPercent(weighted)} ${lower(rate.name)}. Em ${lastLabel}, ${formatPercent(lastRate)}.`,
    note: ongoing ? `${ongoing} ainda está em andamento.` : undefined,
  };
};

// ── Barras empilhadas ──────────────────────────────────────────────────────
const buildStacked = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const totals = data.series
    .map((s) => ({ name: s.name, value: sum(s.values) }))
    .sort((a, b) => b.value - a.value);
  const total = sum(totals.map((t) => t.value));
  if (total <= 0) return null;

  const [first, second] = totals;
  const shares = [first, second]
    .filter((t) => t && t.value > 0)
    .map((t) => `${formatPercent(t.value / total)} ${lower(t.name)}`)
    .join(" e ");

  // Só cita o total quando somar as séries faz sentido: pedidos e dinheiro
  // contam uma vez cada; "clientes por mês" contaria o mesmo cliente 12 vezes.
  const head = spec.additive
    ? `${formatValue(total, spec.unit)}${spec.unit === "count" ? ` ${spec.subject}` : ""} no período: `
    : "No período: ";

  return { text: `${head}${shares}.` };
};

// ── Duas barras por entidade ───────────────────────────────────────────────
const buildCompare = (
  data: ChartData,
  spec: ChartInsightSpec
): ChartInsight | null => {
  const [reference, actual] = data.series;
  if (!reference || !actual) return null;

  // Referência zerada = sem previsão cadastrada; não dá para comparar.
  const comparable = data.categories
    .map((_, i) => ({
      reference: reference.values[i] ?? 0,
      actual: actual.values[i] ?? 0,
    }))
    .filter((pair) => pair.reference > 0);
  if (comparable.length === 0) return null;

  const over = comparable.filter((pair) => pair.actual > pair.reference).length;

  return {
    text: `Em ${over} de ${comparable.length} ${spec.subject}, ${lower(actual.name)} passou de ${lower(reference.name)}.`,
  };
};

const BUILDERS: Record<
  ChartInsightSpec["kind"],
  (data: ChartData, spec: ChartInsightSpec, today: Date) => ChartInsight | null
> = {
  trend: buildTrend,
  leader: buildLeader,
  ranking: buildRanking,
  share: buildShare,
  concentration: buildConcentration,
  rate: buildRate,
  stacked: buildStacked,
  compare: buildCompare,
};

/**
 * Lê os números que estão no gráfico e devolve a frase que resume o resultado.
 *
 * Devolve `null` sempre que não dá para afirmar nada com segurança (série curta
 * demais, total zerado, forma que não bate com o `kind`) — no tooltip é melhor
 * não ter a linha do que ter uma leitura errada.
 */
export const buildChartInsight = (
  option: EChartsCoreOption,
  spec: ChartInsightSpec,
  today: Date = new Date()
): ChartInsight | null => {
  const data = optionToData(option);
  if (data.series.length === 0 || data.categories.length === 0) return null;
  return BUILDERS[spec.kind](data, spec, today);
};
