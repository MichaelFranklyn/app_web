import { describe, expect, it } from "vitest";

import { OrderInstallment } from "../../interface";
import { describeSettlements, isSettled } from "./utils";

const installment = (overrides: Partial<OrderInstallment> = {}) =>
  ({
    id: "1",
    sequence: 1,
    amount: "500.00",
    commissionAmount: "25.00",
    dueDate: "2026-08-09",
    status: "PENDING",
    paidAt: null,
    isCommissionReceived: false,
    commissionReceivedAt: null,
    ...overrides,
  }) as OrderInstallment;

describe("isSettled", () => {
  it("parcela pendente não tem baixa", () => {
    expect(isSettled(installment())).toBe(false);
  });

  it("boleto pago conta como baixa", () => {
    expect(isSettled(installment({ paidAt: "2026-08-09" }))).toBe(true);
  });

  it("comissão recebida conta como baixa mesmo sem pagamento", () => {
    expect(isSettled(installment({ isCommissionReceived: true }))).toBe(true);
  });
});

describe("describeSettlements", () => {
  it("sem baixa, não há o que avisar", () => {
    expect(describeSettlements([])).toBe("");
  });

  it("usa o singular com uma parcela", () => {
    expect(describeSettlements([installment({ paidAt: "2026-08-09" })])).toBe(
      "1 parcela paga"
    );
  });

  it("soma os dois tipos de baixa numa frase só", () => {
    const rows = [
      installment({ paidAt: "2026-08-09", isCommissionReceived: true }),
      installment({ id: "2", paidAt: "2026-09-08" }),
    ];
    expect(describeSettlements(rows)).toBe(
      "2 parcelas pagas e 1 comissão recebida"
    );
  });
});
