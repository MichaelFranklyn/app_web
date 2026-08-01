import { factoryName } from "@/utils/company";

import { ChartFilters } from "../../interface";
import {
  CommissionChartRow,
  CommissionEntityTotals,
  ScopedCommissionRow,
} from "./interface";

const SELLERLESS_ID = "__sem_vendedor__";
const FACTORYLESS_ID = "__sem_fabrica__";

/**
 * Recorta as linhas de comissão pelos filtros da página e as normaliza.
 *
 * Três exclusões deliberadas, todas para o gráfico não afirmar o que não houve:
 *
 * * **cancelada** — o cliente não pagou o boleto (modo Pagamento), então não
 *   existe comissão a somar em lugar nenhum;
 * * **sem data de recebimento** — parcela prevista sem base para prever quando
 *   cai; colocá-la em algum mês seria inventar o mês;
 * * **fora do período / de outro vendedor** — a query traz a empresa inteira
 *   (não aceita esses argumentos), então o recorte é feito aqui.
 *
 * O mês de toda a seção é o da **data de recebimento**, não o do pedido: é a
 * pergunta que a comissão responde ("o que cai em agosto"), e é assim que a
 * tela de Comissões e o PDF já leem.
 */
export const scopeCommissionRows = (
  rows: CommissionChartRow[],
  { from, to, sellerId }: ChartFilters
): ScopedCommissionRow[] => {
  const scoped: ScopedCommissionRow[] = [];

  for (const row of rows) {
    if (row.status === "cancelled") continue;
    if (!row.receiveDate) continue;

    const date = row.receiveDate.slice(0, 10);
    if (date < from || date > to) continue;
    if (sellerId && row.seller?.id !== sellerId) continue;

    scoped.push({
      date,
      month: date.slice(0, 7),
      status: row.status,
      amount: Number(row.amount) || 0,
      base: Number(row.installmentAmount) || 0,
      sellerId: row.seller?.id ?? SELLERLESS_ID,
      sellerName: row.seller?.name ?? "Sem vendedor",
      factoryId: row.factory?.id ?? FACTORYLESS_ID,
      factoryName: factoryName(row.factory),
    });
  }

  return scoped;
};

/** Meses presentes nas linhas, do mais antigo ao mais novo ("2026-01", …). */
export const commissionMonths = (rows: ScopedCommissionRow[]): string[] =>
  [...new Set(rows.map((row) => row.month))].sort();

/**
 * Consolida as linhas por vendedor ou por fábrica, já separando o que é
 * recebido, a receber e previsto — é o número que os rankings da seção usam.
 * Sai ordenado pela comissão total, do maior para o menor.
 */
export const commissionTotalsBy = (
  rows: ScopedCommissionRow[],
  entity: "seller" | "factory"
): CommissionEntityTotals[] => {
  const byId = new Map<string, CommissionEntityTotals>();

  for (const row of rows) {
    const id = entity === "seller" ? row.sellerId : row.factoryId;
    const name = entity === "seller" ? row.sellerName : row.factoryName;
    const totals = byId.get(id) ?? {
      id,
      name,
      total: 0,
      received: 0,
      receivable: 0,
      pending: 0,
      base: 0,
    };

    totals.total += row.amount;
    totals[row.status] += row.amount;
    totals.base += row.base;
    byId.set(id, totals);
  }

  return [...byId.values()].sort((a, b) => b.total - a.total);
};

/** Data de hoje em "YYYY-MM-DD", pelo calendário de quem está olhando a tela. */
export const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};
