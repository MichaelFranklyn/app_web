import { describe, expect, it } from "vitest";
import { PlatformTenant } from "./interface";
import { tenantName } from "./utils";

const tenant = (partial: Partial<PlatformTenant>): PlatformTenant =>
  ({
    id: "1",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Empresa Demo LTDA",
    nomeFantasia: "Demo",
    ...partial,
  }) as PlatformTenant;

describe("tenantName", () => {
  it("prefere o nome fantasia", () => {
    expect(tenantName(tenant({}))).toBe("Demo");
  });

  it("cai para a razão social quando não há fantasia", () => {
    expect(tenantName(tenant({ nomeFantasia: null }))).toBe(
      "Empresa Demo LTDA"
    );
  });

  it("fantasia vazia também cai para a razão social", () => {
    expect(tenantName(tenant({ nomeFantasia: "" }))).toBe("Empresa Demo LTDA");
  });
});
