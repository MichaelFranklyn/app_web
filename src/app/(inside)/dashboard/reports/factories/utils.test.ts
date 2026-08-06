import { describe, expect, it } from "vitest";

import { FactoryOrdersRow } from "./interface";
import { buildFactoryExportRows, invoicedRate, sumBy } from "./utils";

const row = (patch: Partial<FactoryOrdersRow>): FactoryOrdersRow => ({
  entityId: "f1",
  entityName: "HERC",
  orderCount: 10,
  totalAmount: "1000",
  avgTicket: "100",
  clientCount: 4,
  invoicedCount: 6,
  invoicedAmount: "600",
  commissionAmount: "50",
  lastOrderDate: "2026-07-20",
  share: 0.5,
  ...patch,
});

describe("invoicedRate", () => {
  it("é a fatia do colocado que já foi faturada", () => {
    expect(
      invoicedRate(row({ totalAmount: "1000", invoicedAmount: "250" }))
    ).toBe(0.25);
  });

  it("não divide por zero quando a fábrica não teve valor", () => {
    // Fábrica com pedido zerado existe (pedido em aberto sem itens) e não pode
    // devolver Infinity para a coluna de porcentagem.
    expect(invoicedRate(row({ totalAmount: "0", invoicedAmount: "0" }))).toBe(
      0
    );
  });
});

describe("sumBy", () => {
  it("soma dinheiro que chega como string", () => {
    expect(
      sumBy(
        [row({ totalAmount: "1000.50" }), row({ totalAmount: "0.50" })],
        (r) => r.totalAmount
      )
    ).toBe(1001);
  });

  it("soma contagens que já chegam como número", () => {
    expect(
      sumBy(
        [row({ orderCount: 3 }), row({ orderCount: 4 })],
        (r) => r.orderCount
      )
    ).toBe(7);
  });
});

describe("buildFactoryExportRows", () => {
  it("exporta dinheiro como número e taxa como texto", () => {
    const [line] = buildFactoryExportRows([
      row({ totalAmount: "1000", invoicedAmount: "500", share: 0.25 }),
    ]);
    expect(line[2]).toBe(1000);
    expect(line[6]).toBe(500);
    expect(line[7]).toBe("50%");
    expect(line[10]).toBe("25%");
  });

  it("fábrica sem pedido não inventa data", () => {
    const [line] = buildFactoryExportRows([row({ lastOrderDate: null })]);
    expect(line[9]).toBe("—");
  });
});
