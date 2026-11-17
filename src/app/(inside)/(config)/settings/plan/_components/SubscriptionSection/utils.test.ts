import { describe, expect, it } from "vitest";

import { MySubscription } from "./interface";
import {
  describePrice,
  describeSubscription,
  isSafePaymentUrl,
  subscribeHref,
} from "./utils";

const base: MySubscription = {
  isBillingEnabled: true,
  paidUntil: null,
  status: null,
  plan: "basic",
  planLabel: "Básico",
  cycle: "MONTHLY",
  extraUsers: 0,
  value: "54.90",
  overdueSince: null,
  invoiceUrl: null,
};

describe("describeSubscription", () => {
  it("sem o pagamento ligado, manda falar com o suporte e não oferece botão", () => {
    const copy = describeSubscription({
      ...base,
      isBillingEnabled: false,
      status: "ACTIVE",
    });
    expect(copy.description).toContain("fale com o suporte");
    expect([copy.canPay, copy.canSubscribe, copy.canCancel]).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("sem assinatura, oferece Assinar", () => {
    const copy = describeSubscription(base);
    expect(copy.title).toBe("Sem assinatura");
    expect(copy.canSubscribe).toBe(true);
    expect(copy.canCancel).toBe(false);
  });

  it("em dia, mostra até quando está pago e deixa cancelar", () => {
    const copy = describeSubscription({
      ...base,
      status: "ACTIVE",
      paidUntil: "2026-12-17",
    });
    expect(copy.variant).toBe("success");
    expect(copy.title).toBe("Plano Básico: em dia");
    expect(copy.description).toContain("17/12/2026");
    expect(copy.description).toContain("por mês");
    expect(copy.description).toContain("Para mudar de plano");
    expect(copy.canCancel).toBe(true);
    expect(copy.canPay).toBe(false);
  });

  it("a frase de troca de plano só aparece com a assinatura em dia", () => {
    for (const status of ["CANCELED", "PENDING", "OVERDUE", null] as const) {
      const copy = describeSubscription({ ...base, status });
      expect(copy.description).not.toContain("Para mudar de plano");
    }
  });

  it("pendente com link seguro oferece Pagar", () => {
    const copy = describeSubscription({
      ...base,
      status: "PENDING",
      invoiceUrl: "https://sandbox.asaas.com/i/abc",
    });
    expect(copy.canPay).toBe(true);
  });

  it("link que não é https não vira botão", () => {
    const copy = describeSubscription({
      ...base,
      status: "OVERDUE",
      invoiceUrl: "javascript:alert(1)",
    });
    expect(copy.canPay).toBe(false);
  });

  it("atrasado diz desde quando", () => {
    const copy = describeSubscription({
      ...base,
      status: "OVERDUE",
      overdueSince: "2026-11-10",
    });
    expect(copy.variant).toBe("error");
    expect(copy.description).toContain("10/11/2026");
  });

  it("cancelada lembra o período pago e oferece assinar de novo", () => {
    const copy = describeSubscription({
      ...base,
      status: "CANCELED",
      paidUntil: "2026-12-01",
    });
    expect(copy.description).toContain("01/12/2026");
    expect(copy.canSubscribe).toBe(true);
    expect(copy.canCancel).toBe(false);
  });
});

describe("describePrice", () => {
  it("anual diz por ano", () => {
    expect(describePrice({ ...base, cycle: "YEARLY", value: 549 })).toMatch(
      /549,00 por ano/
    );
  });
  it("sem valor, vazio", () => {
    expect(describePrice({ ...base, value: null })).toBe("");
  });
});

describe("isSafePaymentUrl / subscribeHref", () => {
  it("aceita só https", () => {
    expect(isSafePaymentUrl("https://x")).toBe(true);
    expect(isSafePaymentUrl("http://x")).toBe(false);
    expect(isSafePaymentUrl(null)).toBe(false);
  });
  it("leva ao checkout com o plano", () => {
    expect(subscribeHref("basic")).toBe("/assinar?plano=basic");
    expect(subscribeHref(null)).toBe("/assinar");
  });
});
