/**
 * A conta das metas — compartilhada pela tela de metas e pelo dashboard (que
 * mostra o acompanhamento do mês sem repetir a tela inteira).
 *
 * Só números: quem é o vendedor e qual a fábrica ficam no `GoalRow` da tela de
 * metas, que estende `GoalAmounts`.
 */

/** Meta e realizado de uma linha (vendedor × fábrica × mês). Decimais em string. */
export interface GoalAmounts {
  targetInvoicedAmount: string | null;
  targetOrderedAmount: string | null;
  targetPositivations: number | null;
  targetVisits: number | null;
  invoicedAmount: string;
  orderedAmount: string;
  positivations: number;
  visits: number;
}

/** Os quatro indicadores acompanhados, na ordem em que aparecem na tela. */
export const GOAL_METRICS = [
  {
    id: "invoiced",
    label: "Faturamento",
    help: "O que a fábrica faturou no mês. É o número que anda junto com a comissão.",
    money: true,
  },
  {
    id: "ordered",
    label: "Vendas",
    help: "O que foi vendido no mês, mesmo que a fábrica ainda não tenha faturado.",
    money: true,
  },
  {
    id: "positivations",
    label: "Clientes que compraram",
    help: "Quantos clientes diferentes fizeram pedido no mês.",
    money: false,
  },
  {
    id: "visits",
    label: "Visitas",
    help: "Visitas presenciais concluídas no mês (ligações não entram).",
    money: false,
  },
] as const;

export type GoalMetricId = (typeof GOAL_METRICS)[number]["id"];

/** Meta e realizado de um indicador. `target` nulo = não acompanhado no mês. */
export interface MetricValues {
  target: number | null;
  done: number;
}

export const metricValues = (
  row: GoalAmounts,
  metric: GoalMetricId
): MetricValues => {
  switch (metric) {
    case "invoiced":
      return {
        target: toNumber(row.targetInvoicedAmount),
        done: Number(row.invoicedAmount ?? 0),
      };
    case "ordered":
      return {
        target: toNumber(row.targetOrderedAmount),
        done: Number(row.orderedAmount ?? 0),
      };
    case "positivations":
      return { target: row.targetPositivations, done: row.positivations };
    case "visits":
      return { target: row.targetVisits, done: row.visits };
  }
};

const toNumber = (value: string | null): number | null =>
  value === null || value === undefined ? null : Number(value);

/**
 * Quanto da meta foi cumprido, em %. Nulo quando não há meta — a barra não pode
 * mostrar "0%" para um indicador que ninguém combinou, isso leria como atraso.
 */
export const percentOf = ({ target, done }: MetricValues): number | null => {
  if (target === null) return null;
  if (target === 0) return done > 0 ? 100 : 0;
  return (done / target) * 100;
};

/** Cor da barra: vermelho atrasado, âmbar no caminho, verde batida. */
export const percentTone = (
  percent: number | null
): "red" | "amber" | "green" => {
  if (percent === null) return "amber";
  if (percent >= 100) return "green";
  if (percent >= 70) return "amber";
  return "red";
};

/** Soma as linhas num só conjunto de números — os KPIs do topo da tela. */
export const sumRows = (rows: GoalAmounts[]) => {
  const sum = (get: (row: GoalAmounts) => MetricValues) =>
    rows.reduce(
      (acc, row) => {
        const { target, done } = get(row);
        return {
          // Meta total só soma o que tem meta: fábrica sem meta não vira zero,
          // some da conta (senão o total do mês cairia a cada fábrica nova).
          target: target === null ? acc.target : (acc.target ?? 0) + target,
          done: acc.done + done,
        };
      },
      { target: null as number | null, done: 0 }
    );

  return {
    invoiced: sum((row) => metricValues(row, "invoiced")),
    ordered: sum((row) => metricValues(row, "ordered")),
    positivations: sum((row) => metricValues(row, "positivations")),
    visits: sum((row) => metricValues(row, "visits")),
  };
};

/**
 * O quanto do combinado o conjunto cumpriu, em %.
 *
 * É a MÉDIA dos indicadores que têm meta, e não o percentual do faturamento
 * sozinho: quem bateu a venda mas não visitou ninguém não cumpriu o mês, e um
 * número só esconderia isso. Indicador sem meta fica de fora da média — ele não
 * foi combinado, e contá-lo como zero puniria quem não tinha aquele alvo.
 *
 * Nulo quando nada foi combinado: aí a tela mostra "sem meta", não "0%".
 */
export const overallPercent = (totals: {
  invoiced: MetricValues;
  ordered: MetricValues;
  positivations: MetricValues;
  visits: MetricValues;
}): number | null => {
  const percents = [
    totals.invoiced,
    totals.ordered,
    totals.positivations,
    totals.visits,
  ]
    .map(percentOf)
    .filter((percent): percent is number => percent !== null);

  if (percents.length === 0) return null;
  return percents.reduce((sum, percent) => sum + percent, 0) / percents.length;
};

export type GoalTotals = ReturnType<typeof sumRows>;

/**
 * Uma meta só "está atrás" quando o mês já andou o bastante para a conta
 * significar alguma coisa: no dia 2 todo mundo está atrás de tudo.
 */
export const MIN_MONTH_PROGRESS = 0.15;

/**
 * Folga antes de apontar atraso: bater exatamente o ritmo teórico todo dia é
 * ficção — quase toda venda entra em rajada. Só fica "atrás do ritmo" quem
 * está mais de 10% abaixo do que o calendário já pediu.
 */
export const BEHIND_TOLERANCE = 0.1;

/** Quanto do mês já passou, de 0 a 1 (pelo calendário; o dia de hoje conta). */
export const monthProgress = (todayIso: string): number => {
  const [year, month, day] = todayIso.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.min(1, Math.max(0, day / daysInMonth));
};

/**
 * O indicador está atrás do RITMO — não do total. Comparar com a meta cheia
 * acusaria todo mundo até o dia 31; o que interessa é se o realizado
 * acompanha o que o calendário já consumiu, com a folga acima. Era a régua do
 * cartão "metas atrás do ritmo" de /insights, que veio para o dashboard.
 */
export const isBehindPace = (
  { target, done }: MetricValues,
  progress: number
): boolean => {
  if (target === null || target <= 0) return false;
  if (progress < MIN_MONTH_PROGRESS) return false;
  return done < target * progress * (1 - BEHIND_TOLERANCE);
};
