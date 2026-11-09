import { describe, expect, it } from "vitest";
import {
  clientDisplayName,
  clientOptionLabel,
  clientOptionSearchText,
  matchesClientSearch,
} from "./client";

describe("clientDisplayName", () => {
  it("prioriza a razão social sobre o nome fantasia", () => {
    expect(
      clientDisplayName({
        razaoSocial: "Zé Alimentos LTDA",
        nomeFantasia: "Padaria do Zé",
      })
    ).toBe("Zé Alimentos LTDA");
  });

  it("usa o nome fantasia quando a razão social está vazia", () => {
    expect(
      clientDisplayName({ razaoSocial: "  ", nomeFantasia: "Padaria do Zé" })
    ).toBe("Padaria do Zé");
  });

  it("cai no fallback quando não há cliente ou nome algum", () => {
    expect(clientDisplayName(null)).toBe("Cliente —");
    expect(clientDisplayName({ razaoSocial: "", nomeFantasia: null })).toBe(
      "Cliente —"
    );
    expect(clientDisplayName(null, "Cliente")).toBe("Cliente");
  });
});

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

describe("matchesClientSearch", () => {
  const client = {
    name: "Mercado Bom Preço",
    razaoSocial: "Bom Preço Comércio LTDA",
    cnpj: "12345678000190",
  };

  it("acha pelo nome, pela razão social e pelo CNPJ", () => {
    expect(matchesClientSearch(client, "mercado")).toBe(true);
    expect(matchesClientSearch(client, "comércio ltda")).toBe(true);
    expect(matchesClientSearch(client, "12.345.678/0001-90")).toBe(true);
    expect(matchesClientSearch(client, "0001")).toBe(true);
  });

  it("não acha cliente de outro nome nem de outro CNPJ", () => {
    expect(matchesClientSearch(client, "padaria")).toBe(false);
    expect(matchesClientSearch(client, "99.999")).toBe(false);
  });

  it("aguenta linha sem razão social nem CNPJ", () => {
    expect(matchesClientSearch({ name: "Loja" }, "loja")).toBe(true);
  });
});
