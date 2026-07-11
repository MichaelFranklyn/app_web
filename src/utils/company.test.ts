import { describe, expect, it } from "vitest";

import { clientName, factoryName } from "./company";

describe("factoryName", () => {
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
