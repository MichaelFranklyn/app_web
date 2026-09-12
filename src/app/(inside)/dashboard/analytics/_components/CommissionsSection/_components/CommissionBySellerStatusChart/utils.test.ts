import { describe, expect, it } from "vitest";

import { CommissionEntityTotals, ScopedCommissionRow } from "../../interface";
import {
  buildCommissionBySellerStatusOption,
  rankSellerCommissions,
} from "./utils";

const row = (
  sellerId: string,
  amount: number,
  status: ScopedCommissionRow["status"] = "received"
): ScopedCommissionRow => ({
  date: "2026-09-10",
  month: "2026-09",
  status,
  amount,
  base: amount * 10,
  sellerId,
  sellerName: `Vendedor ${sellerId}`,
  factoryId: "f1",
  factoryName: "HERC",
});

const totals = (
  name: string,
  parts: Partial<CommissionEntityTotals>
): CommissionEntityTotals =>
  ({
    id: name,
    name,
    total: 0,
    received: 0,
    receivable: 0,
    pending: 0,
    base: 0,
    ...parts,
  }) as CommissionEntityTotals;

describe("rankSellerCommissions", () => {
  it("ordena do que mais ganhou para o que menos ganhou", () => {
    const ranking = rankSellerCommissions([
      row("a", 100),
      row("b", 300),
      row("c", 200),
    ]);

    expect(ranking.map((seller) => seller.id)).toEqual(["b", "c", "a"]);
  });

  it("corta a cauda: o gráfico mostra oito barras", () => {
    // Acima disso a barra fica fina demais para comparar — quem quer a lista
    // inteira abre o relatório de comissões.
    const rows = Array.from({ length: 12 }, (_, i) => row(`s${i}`, i + 1));

    expect(rankSellerCommissions(rows)).toHaveLength(8);
    expect(rankSellerCommissions(rows, 3)).toHaveLength(3);
  });
});

describe("comissão por vendedor e situação", () => {
  const chart = () =>
    buildCommissionBySellerStatusOption([
      totals("Rafael", {
        total: 900,
        received: 500,
        receivable: 300,
        pending: 100,
      }),
    ]) as unknown as {
      series: { name: string; stack?: string; data: number[] }[];
      tooltip: { formatter: (params: unknown) => string };
    };

  it("empilha as três situações numa barra só por vendedor", () => {
    // A barra inteira é o quanto ele ganha no período; as partes dizem em que
    // pé está cada pedaço.
    const series = chart().series;

    expect(series.map((s) => s.name)).toEqual([
      "Recebido",
      "A receber",
      "Previsto",
    ]);
    expect(series.every((s) => s.stack === "total")).toBe(true);
    expect(series.map((s) => s.data[0])).toEqual([500, 300, 100]);
  });

  it("o tooltip abre o total do período nas três situações", () => {
    // O formatMoney usa espaço não-quebrável entre "R$" e o número.
    const text = chart()
      .tooltip.formatter([{ dataIndex: 0 }])
      .replace(/\u00a0/g, " ");

    expect(text).toContain("Rafael");
    expect(text).toContain("R$ 900,00");
    expect(text).toContain("Recebido: R$ 500,00");
    expect(text).toContain("A receber: R$ 300,00");
    expect(text).toContain("Previsto: R$ 100,00");
  });
});
