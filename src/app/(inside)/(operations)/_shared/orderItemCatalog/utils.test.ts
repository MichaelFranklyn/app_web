import { describe, expect, it } from "vitest";

import { packMinimumText, quantityHint, suggestedQuantity } from "./utils";

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
