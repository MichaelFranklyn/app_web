import { GoalRow } from "./interface";

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
  row: GoalRow,
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
export const sumRows = (rows: GoalRow[]) => {
  const sum = (get: (row: GoalRow) => MetricValues) =>
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

/** Agrupa as linhas por vendedor — a leitura do gestor é por pessoa. */
export interface SellerGroup {
  sellerId: string;
  sellerName: string;
  rows: GoalRow[];
}

export const groupBySeller = (rows: GoalRow[]): SellerGroup[] => {
  const groups = new Map<string, SellerGroup>();
  for (const row of rows) {
    const group = groups.get(row.sellerId) ?? {
      sellerId: row.sellerId,
      sellerName: row.seller?.name ?? "Vendedor",
      rows: [],
    };
    group.rows.push(row);
    groups.set(row.sellerId, group);
  }
  return [...groups.values()].sort((a, b) =>
    a.sellerName.localeCompare(b.sellerName, "pt-BR")
  );
};
