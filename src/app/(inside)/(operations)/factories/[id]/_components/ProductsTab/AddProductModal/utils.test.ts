import { describe, expect, it } from "vitest";

import {
  buildExtrasSummary,
  findIncompleteStep,
  parsePriceRows,
  parseTaxRows,
  toNumber,
} from "./utils";

describe("toNumber", () => {
  it("aceita vírgula decimal", () => {
    expect(toNumber("18,5")).toBe(18.5);
  });

  it("devolve 0 para vazio ou lixo", () => {
    expect(toNumber("")).toBe(0);
    expect(toNumber("abc")).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });
});

describe("parseTaxRows", () => {
  it("descarta linhas sem imposto ou sem alíquota", () => {
    const rows = parseTaxRows([
      { taxRuleId: "rule-1", rate: "5" },
      { taxRuleId: "", rate: "10" },
      { taxRuleId: "rule-2", rate: "" },
      {},
    ]);
    expect(rows).toEqual([{ taxRuleId: "rule-1", rate: 5 }]);
  });

  it("aceita o formato de opção do select", () => {
    const rows = parseTaxRows([
      { taxRuleId: { value: "rule-9", label: "IPI" }, rate: "2,5" },
    ]);
    expect(rows).toEqual([{ taxRuleId: "rule-9", rate: 2.5 }]);
  });

  it("devolve vazio quando o passo não foi preenchido", () => {
    expect(parseTaxRows(undefined)).toEqual([]);
  });
});

describe("parsePriceRows", () => {
  it("exige tabela, nível e preço maior que zero", () => {
    const rows = parsePriceRows([
      { priceListId: "list-1", tierId: "tier-1", unitPrice: "1.234,56" },
      { priceListId: "list-1", tierId: "tier-1", unitPrice: "0,00" },
      { priceListId: "list-1", unitPrice: "10,00" },
    ]);
    expect(rows).toEqual([
      { priceListId: "list-1", tierId: "tier-1", unitPrice: 1234.56 },
    ]);
  });
});

describe("buildExtrasSummary", () => {
  it("resume o que foi gravado além do produto", () => {
    expect(buildExtrasSummary(0, 0)).toBe("Produto cadastrado com sucesso");
    expect(buildExtrasSummary(1, 0)).toBe("Produto cadastrado com 1 imposto");
    expect(buildExtrasSummary(2, 3)).toBe(
      "Produto cadastrado com 2 impostos e 3 preços"
    );
  });
});

describe("findIncompleteStep", () => {
  it("aponta imposto sem alíquota", () => {
    expect(findIncompleteStep([{ taxRuleId: "rule-1" }], [])).toMatch(
      /sem alíquota/
    );
  });

  it("aponta preço sem nível", () => {
    expect(
      findIncompleteStep([], [{ priceListId: "list-1", unitPrice: "10,00" }])
    ).toMatch(/preço incompleto/);
  });

  it("aceita linhas completas ou totalmente vazias", () => {
    expect(
      findIncompleteStep(
        [{ taxRuleId: "rule-1", rate: "5" }, {}],
        [{ priceListId: "l", tierId: "t", unitPrice: "1,00" }]
      )
    ).toBeNull();
  });
});
