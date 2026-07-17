import { describe, expect, it } from "vitest";

import { formatNumber } from "@/utils/format/masks";

import { OrderItemProductTax } from "./interface";
import { commissionModeLabel, isPaymentBasis, taxRatesLabel } from "./utils";

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
