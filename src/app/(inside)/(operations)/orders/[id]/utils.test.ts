import { describe, expect, it } from "vitest";

import { formatNumber } from "@/utils/format/masks";

import { OrderItemProductTax } from "./interface";
import {
  byCreatedAtAsc,
  commissionModeLabel,
  isPaymentBasis,
  matchesProductSearch,
  taxRatesLabel,
} from "./utils";

const tax = (name: string, rate: string): OrderItemProductTax => ({
  id: `t-${name}`,
  rate,
  taxRule: { id: `r-${name}`, name },
});

describe("taxRatesLabel", () => {
  it("lista as alíquotas do produto", () => {
    expect(taxRatesLabel([tax("IPI", "3.2500")], formatNumber)).toBe(
      "IPI 3,25%"
    );
  });

  it("junta vários impostos na ordem em que vieram", () => {
    expect(
      taxRatesLabel([tax("IPI", "9.7500"), tax("ST", "12.0000")], formatNumber)
    ).toBe("IPI 9,75% + ST 12%");
  });

  it("descarta alíquota zero", () => {
    // A importação grava 0 nos produtos fora do regime (coluna vazia da
    // planilha); mostrar "ST 0%" em centenas de linhas só polui.
    expect(
      taxRatesLabel([tax("IPI", "3.2500"), tax("ST", "0.0000")], formatNumber)
    ).toBe("IPI 3,25%");
  });

  it("produto sem imposto vira travessão", () => {
    expect(taxRatesLabel([], formatNumber)).toBe("—");
    expect(taxRatesLabel(undefined, formatNumber)).toBe("—");
  });

  it("imposto sem regra carregada não quebra a linha", () => {
    const orfao = { id: "t-x", rate: "5.0000", taxRule: null };
    expect(taxRatesLabel([orfao], formatNumber)).toBe("—");
  });
});

describe("isPaymentBasis", () => {
  it("reconhece o valor canônico e o legado", () => {
    expect(isPaymentBasis("Pagamento")).toBe(true);
    expect(isPaymentBasis("Pedido")).toBe(true);
    expect(isPaymentBasis("Faturado")).toBe(false);
    expect(isPaymentBasis(null)).toBe(false);
  });

  it("commissionModeLabel traduz o modo", () => {
    expect(commissionModeLabel("Pedido")).toBe("Pagamento");
    expect(commissionModeLabel("Faturado")).toBe("Faturamento");
  });
});

describe("matchesProductSearch", () => {
  const product = { name: "Cimento CP-II 50kg", sku: "ABC-123" };

  it("casa por trecho do nome, sem acento e sem caixa", () => {
    expect(matchesProductSearch(product, "cimento")).toBe(true);
    expect(matchesProductSearch({ name: "Sifão", sku: "S1" }, "sifao")).toBe(
      true
    );
  });

  it("casa por trecho do código (SKU)", () => {
    expect(matchesProductSearch(product, "abc")).toBe(true);
    expect(matchesProductSearch(product, "123")).toBe(true);
  });

  it("não casa quando o termo não está no nome nem no código", () => {
    expect(matchesProductSearch(product, "torneira")).toBe(false);
  });

  it("termo vazio (ou só espaços) casa tudo", () => {
    expect(matchesProductSearch(product, "")).toBe(true);
    expect(matchesProductSearch(product, "   ")).toBe(true);
  });

  it("tolera produto ausente ou campos nulos", () => {
    expect(matchesProductSearch(null, "abc")).toBe(false);
    expect(matchesProductSearch({ name: null, sku: null }, "abc")).toBe(false);
  });
});

describe("byCreatedAtAsc", () => {
  it("ordena do mais antigo para o mais novo (ordem da planilha)", () => {
    const items = [
      { id: "c", createdAt: "2026-07-22T10:00:03Z" },
      { id: "a", createdAt: "2026-07-22T10:00:01Z" },
      { id: "b", createdAt: "2026-07-22T10:00:02Z" },
    ];
    expect(
      items
        .slice()
        .sort(byCreatedAtAsc)
        .map((i) => i.id)
    ).toEqual(["a", "b", "c"]);
  });

  it("itens sem createdAt vão para o começo (não quebram)", () => {
    const items = [
      { id: "b", createdAt: "2026-07-22T10:00:02Z" },
      { id: "x", createdAt: null },
    ];
    expect(
      items
        .slice()
        .sort(byCreatedAtAsc)
        .map((i) => i.id)
    ).toEqual(["x", "b"]);
  });
});
