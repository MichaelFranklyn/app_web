import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommissionMonthData, CommissionRow } from "./interface";
import { useCommissionsView } from "./useCommissionsView";

const group = (factoryId: string, name: string, receivable: string) => ({
  factoryId,
  name,
  count: 3,
  reconciledCount: 1,
  receivable,
  received: "0",
  pending: "0",
  chargeback: "0",
  refund: "0",
  overdueCount: 0,
  receivableIds: [`${factoryId}-1`],
});

const SUMMARY: CommissionMonthData = {
  latestReceiveDate: "2026-10-20",
  hasMovement: true,
  hasAnyCommission: true,
  isFiltered: true,
  scopeTotal: 9,
  totalCount: 6,
  monthTotals: {
    receivable: "40.00",
    received: "10.00",
    pending: "0",
    countReceivable: 2,
    chargeback: "0",
    refund: "0",
  },
  split: {
    company: "50.00",
    seller: "20.00",
    office: "30.00",
    margin: 0.6,
    count: 3,
  },
  groups: [group("f1", "Alfa", "10.00"), group("f2", "Beta", "30.00")],
  chargebacks: [{ installmentId: "cb1" } as CommissionRow],
  sellerMonthCommissions: [
    { sellerId: "s1", amount: "1000.00" },
    { sellerId: "s2", amount: "-12.50" },
  ],
  factoryOptions: [],
  sellerOptions: [],
  statusOptions: [],
};

describe("useCommissionsView", () => {
  it("lê os números que o servidor somou — nenhuma conta é refeita aqui", () => {
    const { result } = renderHook(() => useCommissionsView(SUMMARY));

    expect(result.current.monthTotals.receivable).toBe(40);
    expect(result.current.monthTotals.received).toBe(10);
    expect(result.current.split.office).toBe(30);
    // A ordem dos cartões é a do servidor (nome da fábrica).
    expect(result.current.groups.map((g) => g.name)).toEqual(["Alfa", "Beta"]);
    expect(result.current.groups[1].summary.receivable).toBe(30);
    expect(result.current.groups[0].summary.receivableIds).toEqual(["f1-1"]);
  });

  it("a frase de escopo compara o que sobrou com o que o mês e a aba têm", () => {
    const { result } = renderHook(() => useCommissionsView(SUMMARY));
    // "6 de 9 parcela(s) após os filtros".
    expect(result.current.shown).toBe(6);
    expect(result.current.scopeTotal).toBe(9);
    expect(result.current.isFiltered).toBe(true);
  });

  it("entrega o painel de estornos e o mês de cada vendedor", () => {
    const { result } = renderHook(() => useCommissionsView(SUMMARY));
    expect(result.current.chargebacks.map((r) => r.installmentId)).toEqual([
      "cb1",
    ]);
    expect(result.current.monthBySeller).toEqual({ s1: 1000, s2: -12.5 });
  });

  it("sem resposta, a tela fica vazia e zerada (não quebra)", () => {
    const { result } = renderHook(() => useCommissionsView(undefined));
    expect(result.current.groups).toEqual([]);
    expect(result.current.chargebacks).toEqual([]);
    expect(result.current.monthTotals.receivable).toBe(0);
    expect(result.current.shown).toBe(0);
    expect(result.current.hasAnyCommission).toBe(false);
  });
});
