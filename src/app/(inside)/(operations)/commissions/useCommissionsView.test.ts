import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommissionRow } from "./interface";
import { useCommissionsView } from "./useCommissionsView";
import { OFFICE_LENS, SELLER_LENS, type YearMonth } from "./utils";

const row = (over: Partial<CommissionRow>) =>
  ({
    installmentId: "i1",
    amount: "10",
    status: "receivable",
    receiveDate: "2026-10-10",
    sellerAmount: "4",
    sellerStatus: "receivable",
    sellerReceiveDate: "2026-10-10",
    factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "Alfa SA" },
    ...over,
  }) as CommissionRow;

const OCTOBER: YearMonth = { year: 2026, month: 10 };

const ROWS = [
  row({ installmentId: "a" }),
  row({
    installmentId: "b",
    amount: "30",
    factory: { id: "f2", nomeFantasia: "Beta", razaoSocial: "Beta SA" },
  }),
  row({ installmentId: "c", status: "received", sellerStatus: "received" }),
  // Fora do mês: vem na resposta, mas não é do recorte.
  row({
    installmentId: "d",
    receiveDate: "2026-09-10",
    sellerReceiveDate: "2026-09-10",
  }),
];

describe("useCommissionsView", () => {
  it("soma o mês e agrupa por fábrica só o que o mês e a situação deixam", () => {
    const { result } = renderHook(() =>
      useCommissionsView({
        rows: ROWS,
        visibleRows: ROWS,
        month: OCTOBER,
        tab: "receivable",
        lens: OFFICE_LENS,
      })
    );

    expect(result.current.monthTotals.receivable).toBe(40);
    expect(result.current.monthTotals.received).toBe(10);
    expect(result.current.filteredRows.map((r) => r.installmentId)).toEqual([
      "a",
      "b",
    ]);
    expect(result.current.scopeTotal).toBe(2);
    expect(result.current.groups.map((g) => g.factoryId).sort()).toEqual([
      "f1",
      "f2",
    ]);
  });

  it("o painel de filtros recorta os totais; o escopo segue contando tudo", () => {
    const { result } = renderHook(() =>
      useCommissionsView({
        rows: ROWS,
        // O painel deixou passar só a fábrica Alfa.
        visibleRows: ROWS.filter((r) => r.factory?.id === "f1"),
        month: OCTOBER,
        tab: "receivable",
        lens: OFFICE_LENS,
      })
    );

    expect(result.current.monthTotals.receivable).toBe(10);
    expect(result.current.filteredRows).toHaveLength(1);
    // "1 de 2": a frase de escopo compara com o que o mês e a aba têm.
    expect(result.current.scopeTotal).toBe(2);
  });

  it("na ótica do vendedor a conta é a da fatia dele", () => {
    const { result } = renderHook(() =>
      useCommissionsView({
        rows: ROWS,
        visibleRows: ROWS,
        month: OCTOBER,
        tab: "receivable",
        lens: SELLER_LENS,
      })
    );

    expect(result.current.monthTotals.receivable).toBe(8);
    expect(result.current.monthTotals.received).toBe(4);
  });
});
