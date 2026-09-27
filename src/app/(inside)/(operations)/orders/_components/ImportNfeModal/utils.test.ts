import { describe, expect, it } from "vitest";

import { NFE_STATUS_LABEL, isInvoiceable, orderLinkFor } from "./utils";

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
