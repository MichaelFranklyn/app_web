import { describe, expect, it } from "vitest";

import {
  clientName,
  companyDisplayName,
  companyInitials,
  factoryName,
} from "./company";

describe("factoryName", () => {
  it("prioriza o apelido dado pela empresa", () => {
    expect(
      factoryName({
        nickname: "Apelido",
        nomeFantasia: "NF",
        razaoSocial: "RS",
      })
    ).toBe("Apelido");
  });

  it("ignora apelido ausente e usa o nomeFantasia", () => {
    expect(
      factoryName({ nickname: null, nomeFantasia: "NF", razaoSocial: "RS" })
    ).toBe("NF");
  });

  it("prioriza o nomeFantasia", () => {
    expect(factoryName({ nomeFantasia: "NF", razaoSocial: "RS" })).toBe("NF");
  });

  it("cai para a razaoSocial quando não há fantasia", () => {
    expect(factoryName({ nomeFantasia: null, razaoSocial: "RS" })).toBe("RS");
  });

  it("retorna — sem dados", () => {
    expect(factoryName(null)).toBe("—");
    expect(factoryName({})).toBe("—");
  });
});

describe("clientName", () => {
  // Ao contrário de factoryName, clientName delega ao canônico clientDisplayName:
  // a RAZÃO SOCIAL é o identificador do cliente (o que a carteira e a busca
  // priorizam), com o nome fantasia como fallback. Antes divergia (fantasia
  // primeiro) e o mesmo cliente aparecia com nomes diferentes entre telas.
  it("prioriza a razaoSocial", () => {
    expect(clientName({ nomeFantasia: "NF", razaoSocial: "RS" })).toBe("RS");
  });

  it("cai para o nomeFantasia quando não há razão social", () => {
    expect(clientName({ nomeFantasia: "NF", razaoSocial: null })).toBe("NF");
  });

  it("ignora razão social em branco (trim) e cai para a fantasia", () => {
    expect(clientName({ nomeFantasia: "NF", razaoSocial: "   " })).toBe("NF");
  });

  it("retorna — sem dados", () => {
    expect(clientName(undefined)).toBe("—");
    expect(clientName(null)).toBe("—");
    expect(clientName({})).toBe("—");
  });
});

describe("companyInitials", () => {
  it("ignora tokens sem letra", () => {
    // "CONTATO - REPRESENTACOES LTDA." rendia "C-": o hífen virava inicial.
    expect(companyInitials("CONTATO - REPRESENTACOES LTDA.")).toBe("CR");
  });

  it("usa as duas primeiras palavras", () => {
    expect(companyInitials("Padrão Forte Indústria")).toBe("PF");
  });

  it("tolera vazio", () => {
    expect(companyInitials(null)).toBe("");
    expect(companyInitials("   ")).toBe("");
  });
});

describe("companyDisplayName", () => {
  it("tira a razão social da CAIXA ALTA", () => {
    expect(companyDisplayName("MENEZES REPRESENTACOES")).toBe(
      "Menezes Representacoes"
    );
  });

  it("mantém conectivos minúsculos e siglas societárias", () => {
    expect(companyDisplayName("COMERCIO DE TINTAS DA SILVA LTDA")).toBe(
      "Comercio de Tintas da Silva LTDA"
    );
  });

  it("respeita o nome que já tem caixa própria", () => {
    expect(companyDisplayName("Contato Repres. iFood")).toBe(
      "Contato Repres. iFood"
    );
  });

  it("devolve vazio sem nome", () => {
    expect(companyDisplayName(null)).toBe("");
  });
});
