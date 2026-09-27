import { describe, expect, it } from "vitest";

import {
  NFE_STATUS_LABEL,
  billsSummary,
  isInvoiceable,
  orderLinkFor,
} from "./utils";

describe("isInvoiceable", () => {
  it("só a nota pronta fatura daqui", () => {
    expect(isInvoiceable("READY")).toBe(true);
    expect(isInvoiceable("NEEDS_REVIEW")).toBe(false);
    expect(isInvoiceable("ALREADY_IMPORTED")).toBe(false);
  });
});

describe("orderLinkFor", () => {
  it("leva ao pedido quando é lá que se resolve", () => {
    expect(orderLinkFor("NEEDS_REVIEW", "o1")).toBe("/orders/o1");
    expect(orderLinkFor("ALREADY_IMPORTED", "o1")).toBe("/orders/o1");
  });

  it("sem pedido não há link", () => {
    expect(orderLinkFor("NO_OPEN_ORDER", null)).toBeNull();
    expect(orderLinkFor("READY", "o1")).toBeNull();
  });
});

describe("NFE_STATUS_LABEL", () => {
  it("toda situação do backend tem rótulo", () => {
    expect(Object.keys(NFE_STATUS_LABEL)).toHaveLength(8);
  });
});

describe("billsSummary", () => {
  const row = (usesInvoiceBills: boolean) =>
    ({
      usesInvoiceBills,
      installments: [
        { number: "001", dueDate: "2026-10-10", amount: "550.00" },
        { number: "002", dueDate: "2026-11-09", amount: "550.00" },
      ],
    }) as unknown as import("./interface").NfePreviewRow;

  it("lista vencimento e valor de cada boleto que vira parcela", () => {
    const text = billsSummary(row(true));
    expect(text).toContain("10/10");
    expect(text).toContain("09/11");
    expect(text).toContain("550,00");
  });

  it("vazio quando as parcelas seguem o prazo do pedido", () => {
    expect(billsSummary(row(false))).toBe("");
  });
});
