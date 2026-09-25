import { describe, expect, it } from "vitest";

import { CompanyFactory } from "../../interface";
import { commissionTermsFor } from "./useSellerCommissionTerms";

const vinculo = {
  id: "cf-1",
  commissionRate: 8,
  commissionCalcBasis: "Faturamento",
  factory: { id: "f-1" },
} as CompanyFactory;

const acesso = (
  sellerCommissionRate: string | null,
  sellerCommissionBasis: string | null = null
) => ({
  id: "a-1",
  factoryId: "f-1",
  isActive: true,
  sellerCommissionRate,
  sellerCommissionBasis,
});

describe("commissionTermsFor", () => {
  it("mostra o percentual do VENDEDOR, não o que a fábrica paga à empresa", () => {
    // O bug: o vendedor via os 8% da fábrica e achava que ganhava aquilo.
    expect(commissionTermsFor(vinculo, acesso("3.5")).rate).toBe(3.5);
  });

  it("sem percentual cadastrado fica em branco — nunca o da fábrica", () => {
    expect(commissionTermsFor(vinculo, acesso(null)).rate).toBeNull();
  });

  it("sem acesso nenhum também fica em branco", () => {
    expect(commissionTermsFor(vinculo, undefined).rate).toBeNull();
  });

  it("repasse com base própria vence a base da fábrica", () => {
    expect(commissionTermsFor(vinculo, acesso("3", "Pagamento")).basis).toBe(
      "Pagamento"
    );
    expect(commissionTermsFor(vinculo, acesso("3")).basis).toBe("Faturamento");
  });
});
