import { describe, expect, it } from "vitest";

import { CompanyFactoryDetail } from "../../../interface";
import { normalizeInput } from "./utils";

const initial = (
  over: Partial<CompanyFactoryDetail> = {}
): CompanyFactoryDetail => ({
  id: "cf1",
  commissionRate: 5,
  commissionCalcBasis: "Faturamento",
  paymentTermDays: 10,
  commissionPaymentDays: [10],
  commissionCutoffDay: null,
  installmentDueBasis: null,
  territory: "Bahia",
  contractStart: null,
  contractEnd: null,
  specialConditions: null,
  ipiInOrder: false,
  deliveryEstimateDays: null,
  minOrderAmount: null,
  freeFreightCifAmount: null,
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
  commissionCalcBasis: "Faturamento",
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

describe("normalizeInput — pisos de valor do pedido", () => {
  it("grava o pedido mínimo da fábrica", () => {
    const input = normalizeInput(form({ minOrderAmount: "1000" }), initial());
    expect(input.minOrderAmount).toBe(1000);
  });

  it("grava o piso de frete grátis separadamente do mínimo", () => {
    // São regras diferentes: o mínimo barra a confirmação, o frete grátis não.
    // Mexer em um não pode arrastar o outro. O FormBuilder sempre devolve os
    // dois campos, então ambos aparecem no `form`.
    const input = normalizeInput(
      form({ minOrderAmount: "1000", freeFreightCifAmount: "5000" }),
      initial({ minOrderAmount: 1000 })
    );
    expect(input.freeFreightCifAmount).toBe(5000);
    expect("minOrderAmount" in input).toBe(false);
  });

  it("campo esvaziado limpa o piso", () => {
    const input = normalizeInput(
      form({ minOrderAmount: "" }),
      initial({ minOrderAmount: 1000 })
    );
    expect(input.minOrderAmount).toBeNull();
  });

  it("zero é ausência de piso, não piso de zero reais", () => {
    // Guardar 0 funcionaria no backend, mas a tela leria de volta
    // "mínimo: R$ 0,00" onde não há mínimo nenhum.
    const input = normalizeInput(
      form({ minOrderAmount: "0" }),
      initial({ minOrderAmount: 1000 })
    );
    expect(input.minOrderAmount).toBeNull();
  });

  it("aceita vírgula como separador decimal", () => {
    const input = normalizeInput(
      form({ minOrderAmount: "1500,50" }),
      initial()
    );
    expect(input.minOrderAmount).toBe(1500.5);
  });

  it("não manda o campo quando nada mudou", () => {
    const input = normalizeInput(
      form({ minOrderAmount: "1000" }),
      initial({ minOrderAmount: 1000 })
    );
    expect("minOrderAmount" in input).toBe(false);
  });
});

describe("base do vencimento do boleto", () => {
  it("envia a troca para contar da data do pedido", () => {
    const input = normalizeInput(
      { ...form(), installmentDueBasis: { value: "Pedido", label: "Pedido" } },
      initial()
    );
    expect(input.installmentDueBasis).toBe("Pedido");
  });

  it("não envia nada quando a fábrica continua contando da nota", () => {
    // Nulo no banco já significa Faturamento: mandar o campo à toa marcaria o
    // contrato como alterado sem nenhuma mudança real.
    const input = normalizeInput(
      {
        ...form(),
        installmentDueBasis: { value: "Faturamento", label: "Faturamento" },
      },
      initial()
    );
    expect(input.installmentDueBasis).toBeUndefined();
  });
});
