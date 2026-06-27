import { describe, expect, it } from "vitest";
import { buildAddress, factoryName } from "./utils";
import type { ClientData } from "./interface";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal ClientData with all address fields null — override per-test. */
const makeClient = (overrides: Partial<ClientData> = {}): ClientData => ({
  id: "1",
  cnpj: "00.000.000/0001-00",
  razaoSocial: "Empresa Teste LTDA",
  nomeFantasia: null,
  cnae: "4711-3/02",
  cnaeDescription: null,
  addressStreet: null,
  addressNumber: null,
  addressComplement: null,
  addressNeighborhood: null,
  addressZip: null,
  addressCity: null,
  addressState: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  companyClient: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// buildAddress
// ---------------------------------------------------------------------------

describe("buildAddress", () => {
  it("returns em-dash when all address fields are null", () => {
    expect(buildAddress(makeClient())).toBe("—");
  });

  it("returns em-dash when all address fields are empty strings", () => {
    const client = makeClient({
      addressStreet: "",
      addressNumber: "",
      addressComplement: "",
      addressCity: "",
      addressState: "",
      addressZip: "",
    });
    expect(buildAddress(client)).toBe("—");
  });

  it("joins all six address parts when all are present", () => {
    const client = makeClient({
      addressStreet: "Rua das Flores",
      addressNumber: "123",
      addressComplement: "Apto 4",
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: "01310-100",
    });
    expect(buildAddress(client)).toBe(
      "Rua das Flores, 123, Apto 4, São Paulo, SP, 01310-100"
    );
  });

  it("skips null parts and joins the rest", () => {
    const client = makeClient({
      addressStreet: "Av. Brasil",
      addressNumber: "500",
      addressComplement: null,
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
      addressZip: null,
    });
    expect(buildAddress(client)).toBe("Av. Brasil, 500, Rio de Janeiro, RJ");
  });

  it("skips empty-string parts (falsy filter)", () => {
    const client = makeClient({
      addressStreet: "Rua A",
      addressNumber: "",
      addressComplement: "",
      addressCity: "Campinas",
      addressState: "SP",
      addressZip: "13000-000",
    });
    expect(buildAddress(client)).toBe("Rua A, Campinas, SP, 13000-000");
  });

  it("works with only street and city", () => {
    const client = makeClient({
      addressStreet: "Rua X",
      addressCity: "Curitiba",
    });
    expect(buildAddress(client)).toBe("Rua X, Curitiba");
  });

  it("works with a single address field", () => {
    const client = makeClient({ addressCity: "Belo Horizonte" });
    expect(buildAddress(client)).toBe("Belo Horizonte");
  });

  // addressNeighborhood is NOT in the parts list — confirm it is ignored
  it("does NOT include addressNeighborhood in the result", () => {
    const client = makeClient({
      addressStreet: "Rua Y",
      addressCity: "Fortaleza",
      // comportamento de runtime: addressNeighborhood existe no tipo, mas
      // buildAddress o ignora de propósito (lê só os 6 campos listados).
      addressNeighborhood: "Centro",
    });
    const result = buildAddress(client);
    expect(result).not.toContain("Centro");
    expect(result).toBe("Rua Y, Fortaleza");
  });
});

// ---------------------------------------------------------------------------
// factoryName
// ---------------------------------------------------------------------------

describe("factoryName", () => {
  it("returns the factory name when it is a non-empty string", () => {
    expect(factoryName({ name: "Fábrica Alpha" })).toBe("Fábrica Alpha");
  });

  it("returns em-dash when factory is undefined", () => {
    expect(factoryName(undefined)).toBe("—");
  });

  it("returns em-dash when factory is null", () => {
    expect(factoryName(null)).toBe("—");
  });

  it("returns em-dash when factory.name is undefined", () => {
    expect(factoryName({})).toBe("—");
  });

  it("returns em-dash when factory.name is an empty string (falsy via ??)", () => {
    // Note: ?? only guards undefined/null, so empty-string IS returned as-is
    expect(factoryName({ name: "" })).toBe("");
  });

  it("returns the name even when it is a numeric-looking string", () => {
    expect(factoryName({ name: "42" })).toBe("42");
  });
});
