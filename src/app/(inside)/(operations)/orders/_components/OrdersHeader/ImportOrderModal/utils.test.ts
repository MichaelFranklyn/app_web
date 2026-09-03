import { describe, expect, it } from "vitest";

import type { OrderSheetRead } from "@/utils/orderSheet/read";

import { clientLabelFromSheet, sheetSummary, sheetToOrderInput } from "./utils";

const sheet = (over: Partial<OrderSheetRead>): OrderSheetRead =>
  ({
    meta: { sellerId: "s-1" },
    cnpjDigits: "04865025000109",
    razaoSocial: "",
    nomeFantasia: "",
    clientId: "c-1",
    factoryId: "f-1",
    factoryName: "HERC",
    paymentTermName: "",
    freightType: "",
    deliveryEstimateDays: null,
    coverageDays: null,
    notes: "",
    items: [],
    ...over,
  }) as OrderSheetRead;

describe("como chamar o cliente da ficha", () => {
  it("usa nome e CNPJ, no mesmo formato da lista da carteira", () => {
    expect(
      clientLabelFromSheet(
        sheet({
          razaoSocial: "ANTONIO JOAQUIM FERREIRA LTDA",
          nomeFantasia: "Casa do Construtor",
        })
      )
    ).toBe("Casa do Construtor · 04.865.025/0001-09");
  });

  it("cai na razão social quando não há fantasia", () => {
    expect(
      clientLabelFromSheet(
        sheet({ razaoSocial: "ANTONIO JOAQUIM FERREIRA LTDA" })
      )
    ).toBe("ANTONIO JOAQUIM FERREIRA LTDA · 04.865.025/0001-09");
  });

  it("cai no CNPJ quando a ficha nunca foi recalculada", () => {
    // Razão social e fantasia são fórmula: numa planilha aberta e fechada sem
    // recálculo elas chegam vazias, e o CNPJ digitado é o que sobra.
    expect(clientLabelFromSheet(sheet({}))).toBe("04.865.025/0001-09");
  });
});

describe("a ficha virando pedido", () => {
  it("monta o input sem passar por campo nenhum", () => {
    const input = sheetToOrderInput(
      sheet({
        freightType: "CIF",
        deliveryEstimateDays: 30,
        coverageDays: 50,
        notes: "Entregar depois do dia 10.",
      }),
      "term-1",
      "2026-09-02"
    );

    expect(input).toEqual({
      sellerId: "s-1",
      clientId: "c-1",
      factoryId: "f-1",
      orderDate: "2026-09-02",
      paymentTermId: "term-1",
      freightType: "CIF",
      notes: "Entregar depois do dia 10.",
      deliveryEstimateDays: 30,
      coverageDays: 50,
      isQuote: false,
    });
  });

  it("recusa frete que não é CIF nem FOB", () => {
    // A célula tem lista suspensa, mas o arquivo pode ser editado à mão — e o
    // backend recusaria o enum inválido com um erro que não explica nada.
    const input = sheetToOrderInput(
      sheet({ freightType: "GRÁTIS" }),
      null,
      "2026-09-02"
    );

    expect(input.freightType).toBeNull();
  });
});

describe("o resumo que substitui os campos", () => {
  it("diz o que o sistema entendeu da ficha", () => {
    const texto = sheetSummary(
      sheet({
        razaoSocial: "ANTONIO JOAQUIM FERREIRA LTDA",
        freightType: "CIF",
        items: [{ sku: "1", packQty: 1, quantity: 1, discountPercent: 0 }],
      }),
      "45/60/90 (45/60/90)"
    );

    expect(texto).toContain("ANTONIO JOAQUIM FERREIRA LTDA");
    expect(texto).toContain("HERC");
    expect(texto).toContain("45/60/90");
    expect(texto).toContain("frete CIF");
    expect(texto).toContain("1 item(ns)");
  });

  it("avisa quando a condição da ficha não existe mais", () => {
    // É o único dado da ficha que pode se perder: a fábrica pode ter renomeado
    // a condição depois que o vendedor baixou a planilha.
    expect(
      sheetSummary(sheet({ paymentTermName: "30/60/90" }), null)
    ).toContain('condição "30/60/90" não existe mais nesta fábrica');
  });
});
