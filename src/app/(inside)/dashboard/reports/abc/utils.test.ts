import { describe, expect, it } from "vitest";

import { AbcRow } from "./interface";
import {
  buildAbcExportRows,
  filterByScope,
  summarizeByClass,
  sumBy,
} from "./utils";

const row = (patch: Partial<AbcRow>): AbcRow => ({
  clientId: "c1",
  clientName: "CLIENTE",
  rank: 1,
  totalAmount: "1000",
  orderCount: 3,
  commissionAmount: "50",
  share: 0.5,
  cumulativeShare: 0.5,
  abcClass: "A",
  lastOrderDate: "2026-07-10",
  ...patch,
});

describe("filterByScope", () => {
  const rows = [
    row({ clientId: "a", abcClass: "A" }),
    row({ clientId: "b", abcClass: "B" }),
    row({ clientId: "c", abcClass: "C" }),
  ];

  it("devolve a curva inteira em 'all'", () => {
    expect(filterByScope(rows, "all")).toHaveLength(3);
  });

  it("recorta por classe", () => {
    expect(filterByScope(rows, "C").map((r) => r.clientId)).toEqual(["c"]);
  });
});

describe("summarizeByClass", () => {
  it("conta clientes e soma faturamento por classe", () => {
    const totals = summarizeByClass([
      row({ abcClass: "A", totalAmount: "800" }),
      row({ abcClass: "A", totalAmount: "200" }),
      row({ abcClass: "B", totalAmount: "150" }),
    ]);
    expect(totals.A).toEqual({ clients: 2, amount: 1000 });
    expect(totals.B).toEqual({ clients: 1, amount: 150 });
    // Classe sem cliente devolve zero, e não `undefined`: o KPI dela é exibido
    // sempre, e um "undefined" no cartão seria pior do que um zero.
    expect(totals.C).toEqual({ clients: 0, amount: 0 });
  });

  it("curva vazia devolve as três classes zeradas", () => {
    const totals = summarizeByClass([]);
    expect(totals).toEqual({
      A: { clients: 0, amount: 0 },
      B: { clients: 0, amount: 0 },
      C: { clients: 0, amount: 0 },
    });
  });
});

describe("sumBy", () => {
  it("soma dinheiro que chega como string", () => {
    expect(
      sumBy(
        [row({ totalAmount: "10.25" }), row({ totalAmount: "0.75" })],
        (r) => r.totalAmount
      )
    ).toBe(11);
  });
});

describe("buildAbcExportRows", () => {
  it("exporta faturamento como número e as taxas como texto", () => {
    const [line] = buildAbcExportRows([
      row({ totalAmount: "1234.50", share: 0.25, cumulativeShare: 0.8 }),
    ]);
    expect(line[3]).toBe(1234.5);
    expect(line[4]).toBe("25%");
    expect(line[5]).toBe("80%");
  });

  it("mantém a posição na curva, que é a ordem do papel", () => {
    const rows = buildAbcExportRows([row({ rank: 1 }), row({ rank: 2 })]);
    expect(rows.map((line) => line[0])).toEqual([1, 2]);
  });
});
