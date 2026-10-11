import { type YearMonth } from "@/utils/format/month";

import { GoalRow } from "./interface";

/**
 * De quais meses a grade pode ser repetida, do mais recente para o mais antigo.
 *
 * São os meses JÁ DECORRIDOS do ano do mês aberto: é neles que existe meta
 * combinada para copiar, e o ano é o recorte em que o gestor pensa a grade.
 * Em JANEIRO não há nenhum — aí a lista é o ano anterior inteiro, que é
 * exatamente quando repetir a grade mais importa: a virada do ano é o momento
 * em que ninguém quer redigitar cinco fábricas por vendedor.
 */
export const copySourceMonths = (month: YearMonth): YearMonth[] => {
  if (month.month === 1) {
    return Array.from({ length: 12 }, (_, i) => ({
      year: month.year - 1,
      month: 12 - i,
    }));
  }
  return Array.from({ length: month.month - 1 }, (_, i) => ({
    year: month.year,
    month: month.month - 1 - i,
  }));
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
