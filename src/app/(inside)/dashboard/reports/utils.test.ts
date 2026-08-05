import { describe, expect, it } from "vitest";

import {
  getCurrentMonthRangeIso,
  PLACED_ORDER_STATUSES,
  REPORT_TABS,
  reportFileName,
  safeRate,
} from "./utils";

describe("REPORT_TABS", () => {
  it("tem as cinco abas, com slugs únicos", () => {
    const slugs = REPORT_TABS.map((tab) => tab.slug);
    expect(slugs).toEqual([
      "sales",
      "sent-orders",
      "commissions",
      "positivation",
      "clients",
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("getCurrentMonthRangeIso", () => {
  it("vai do dia 1 do mês corrente até hoje", () => {
    const range = getCurrentMonthRangeIso();
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    expect(range.from).toBe(`${now.getFullYear()}-${month}-01`);
    expect(range.to).toBe(
      `${now.getFullYear()}-${month}-${String(now.getDate()).padStart(2, "0")}`
    );
  });

  it("nunca devolve um período invertido", () => {
    const range = getCurrentMonthRangeIso();
    expect(range.from <= range.to).toBe(true);
  });
});

describe("PLACED_ORDER_STATUSES", () => {
  it("não inclui orçamento nem cancelado", () => {
    // DRAFT/SENT são proposta em aberto: contá-los infla o relatório com venda
    // que não existe.
    expect(PLACED_ORDER_STATUSES).not.toContain("DRAFT");
    expect(PLACED_ORDER_STATUSES).not.toContain("SENT");
    expect(PLACED_ORDER_STATUSES).not.toContain("CANCELLED");
    expect(PLACED_ORDER_STATUSES).toEqual([
      "CONFIRMED",
      "INVOICED",
      "DELIVERED",
    ]);
  });
});

describe("safeRate", () => {
  it("divide normalmente quando há base", () => {
    expect(safeRate(1, 4)).toBe(0.25);
  });

  it("sem base devolve 0, não Infinity nem NaN", () => {
    expect(safeRate(3, 0)).toBe(0);
    expect(safeRate(0, 0)).toBe(0);
  });
});

describe("reportFileName", () => {
  it("põe o recorte no nome do arquivo", () => {
    expect(reportFileName("vendas", "2026-07-01", "xlsx")).toBe(
      "vendas-2026-07-01.xlsx"
    );
    expect(reportFileName("positivacao", "2026-07-01", "pdf")).toBe(
      "positivacao-2026-07-01.pdf"
    );
  });
});
