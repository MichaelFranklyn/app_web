import { describe, expect, it } from "vitest";

import { OrderInstallment } from "../../interface";
import { isSettled, isValidReversalReason } from "./utils";

const installment = (overrides: Partial<OrderInstallment> = {}) =>
  ({
    id: "1",
    sequence: 1,
    status: "PENDING",
    paidAt: null,
    isCommissionReceived: false,
    isSellerCommissionPaid: false,
    hasSettlement: false,
    ...overrides,
  }) as OrderInstallment;

describe("isSettled", () => {
  it("segue o servidor: repasse ao vendedor sozinho é baixa", () => {
    expect(
      isSettled(
        installment({ isSellerCommissionPaid: true, hasSettlement: true })
      )
    ).toBe(true);
  });

  it("não reinterpreta os campos: sem a marca do servidor, não é baixa", () => {
    expect(isSettled(installment({ paidAt: "2026-08-09" }))).toBe(false);
    expect(isSettled(installment())).toBe(false);
  });
});

describe("isValidReversalReason", () => {
  it("exige uma frase, não só um 'ok'", () => {
    expect(isValidReversalReason("  ok  ")).toBe(false);
    expect(isValidReversalReason("nota reemitida")).toBe(true);
  });
});
