import { describe, expect, it } from "vitest";

import {
  packMinimumText,
  pickPriceItems,
  quantityHint,
  rankActivePriceLists,
  suggestedQuantity,
} from "./utils";

describe("suggestedQuantity", () => {
  it("preenche o campo vazio com a embalagem mínima", () => {
    expect(suggestedQuantity("", "", 12)).toBe("12");
    expect(suggestedQuantity("", "", 25.5)).toBe("25.5");
  });

  it("troca o valor automático do produto anterior", () => {
    expect(suggestedQuantity("12", "12", 6)).toBe("6");
    // Produto sem múltiplo: o automático do anterior não vale para ele.
    expect(suggestedQuantity("12", "12", null)).toBe("");
  });

  it("nunca reescreve o que foi digitado", () => {
    expect(suggestedQuantity("30", "12", 6)).toBe("30");
    expect(suggestedQuantity("30", "", undefined)).toBe("30");
  });
});

describe("quantityHint", () => {
  it("diz a embalagem mínima quando ela passa de uma unidade", () => {
    expect(quantityHint(12)).toBe(
      "Em unidades. Embalagem mínima: 12 — vendido de 12 em 12."
    );
  });

  it("sem múltiplo, lembra que é em unidades", () => {
    expect(quantityHint(null)).toBe("Em unidades (peças), não em embalagens.");
    expect(quantityHint(1)).toBe("Em unidades (peças), não em embalagens.");
  });
});

describe("packMinimumText", () => {
  it("mostra as unidades da embalagem, ou que não há mínimo", () => {
    expect(packMinimumText(12)).toBe("12 unidades");
    expect(packMinimumText(null)).toBe("Sem mínimo (vende por unidade)");
    expect(packMinimumText(1)).toBe("Sem mínimo (vende por unidade)");
  });
});

describe("tabela que sugere o preço com 2+ vigentes", () => {
  const list = (
    id: string,
    region: string,
    validFrom: string,
    isActive = true
  ) => ({ id, region, validFrom, isActive });

  it("geral antes da regional, mais recente antes, id no empate; encerrada fora", () => {
    expect(
      rankActivePriceLists([
        list("icms7", "ICMS 7%", "2026-11-01"),
        list("velha", "", "2026-01-01"),
        list("nova", "", "2026-10-01"),
        list("b", "", "2026-10-01"),
        list("encerrada", "", "2026-12-01", false),
      ])
    ).toEqual(["b", "nova", "velha", "icms7"]);
  });

  it("um preço por produto+nível, da tabela mais bem colocada", () => {
    const item = (priceListId: string, product: string, price: string) => ({
      priceListId,
      product: { id: product },
      tier: { id: "t1" },
      price,
    });
    const picked = pickPriceItems(
      [
        item("icms7", "p1", "9"),
        item("geral", "p1", "10"),
        item("icms7", "p2", "5"),
        item("fora", "p3", "1"),
      ],
      ["geral", "icms7"]
    );
    expect(picked.map((i) => `${i.product.id}=${i.price}`).sort()).toEqual([
      "p1=10",
      "p2=5",
    ]);
  });
});
