import { describe, expect, it } from "vitest";

import { CompanyFactoryDetail } from "../../../interface";
import { normalizeInput } from "./utils";

const initial = (
  over: Partial<CompanyFactoryDetail> = {}
): CompanyFactoryDetail => ({
  id: "cf1",
  commissionRate: 5,
  commissionCalcBasis: "Faturado",
  paymentTermDays: 10,
  commissionPaymentDays: [10],
  commissionCutoffDay: null,
  territory: "Bahia",
  contractStart: null,
  contractEnd: null,
  specialConditions: null,
  ipiInOrder: false,
  deliveryEstimateDays: null,
  factory: {
    id: "f1",
    cnpj: "123",
    razaoSocial: "Fábrica LTDA",
    nomeFantasia: null,
    nickname: null,
    logoUrl: null,
    addressCity: null,
    addressState: null,
    deletedAt: null,
  },
  ...over,
});

// Só os campos que o formulário sempre envia; cada teste acrescenta o seu.
const form = (over: Record<string, unknown> = {}) => ({
  commissionRate: 5,
  commissionCalcBasis: "Faturado",
  paymentDays: "10",
  territory: "Bahia",
  ...over,
});

describe("normalizeInput — corte do faturamento", () => {
  it("grava o dia informado", () => {
    const input = normalizeInput(
      form({ commissionCutoffDay: "25" }),
      initial()
    );
    expect(input.commissionCutoffDay).toBe(25);
  });

  it("campo em branco limpa o corte da fábrica", () => {
    const input = normalizeInput(
      form({ commissionCutoffDay: "" }),
      initial({ commissionCutoffDay: 25 })
    );
    expect(input.commissionCutoffDay).toBeNull();
  });

  it("não manda o campo quando nada mudou", () => {
    const input = normalizeInput(
      form({ commissionCutoffDay: "25" }),
      initial({ commissionCutoffDay: 25 })
    );
    expect("commissionCutoffDay" in input).toBe(false);
  });

  it("descarta dia fora do mês (vira sem corte)", () => {
    const input = normalizeInput(
      form({ commissionCutoffDay: "45" }),
      initial({ commissionCutoffDay: 25 })
    );
    expect(input.commissionCutoffDay).toBeNull();
  });

  it("arredonda um decimal digitado por engano", () => {
    const input = normalizeInput(
      form({ commissionCutoffDay: "25.4" }),
      initial()
    );
    expect(input.commissionCutoffDay).toBe(25);
  });
});
