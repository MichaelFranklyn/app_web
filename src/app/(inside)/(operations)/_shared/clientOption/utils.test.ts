import { describe, expect, it } from "vitest";

import { clientOptionLabel, clientOptionSearchText } from "./utils";

describe("clientOptionLabel", () => {
  it("mostra nome fantasia e CNPJ formatado", () => {
    expect(
      clientOptionLabel({
        razaoSocial: "Bom Preço Comércio LTDA",
        nomeFantasia: "Mercado Bom Preço",
        cnpj: "12345678000190",
      })
    ).toBe("Mercado Bom Preço · 12.345.678/0001-90");
  });

  it("cai na razão social quando não há nome fantasia", () => {
    expect(
      clientOptionLabel({
        razaoSocial: "Bom Preço Comércio LTDA",
        nomeFantasia: null,
        cnpj: "12345678000190",
      })
    ).toBe("Bom Preço Comércio LTDA · 12.345.678/0001-90");
  });

  it("omite o separador quando o cliente não tem CNPJ", () => {
    expect(
      clientOptionLabel({ razaoSocial: "Bom Preço", nomeFantasia: null })
    ).toBe("Bom Preço");
  });
});

describe("clientOptionSearchText", () => {
  it("junta razão social, nome fantasia e CNPJ sem pontuação", () => {
    expect(
      clientOptionSearchText({
        razaoSocial: "Bom Preço Comércio LTDA",
        nomeFantasia: "Mercado Bom Preço",
        cnpj: "12.345.678/0001-90",
      })
    ).toBe("Bom Preço Comércio LTDA Mercado Bom Preço 12345678000190");
  });

  it("ignora campos ausentes", () => {
    expect(clientOptionSearchText({ razaoSocial: "Bom Preço" })).toBe(
      "Bom Preço"
    );
  });
});
