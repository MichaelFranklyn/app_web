import { describe, expect, it } from "vitest";

import { clientName, factoryName } from "./company";

describe("factoryName / clientName", () => {
  it("priorizam o nomeFantasia", () => {
    expect(factoryName({ nomeFantasia: "NF", razaoSocial: "RS" })).toBe("NF");
    expect(clientName({ nomeFantasia: "NF", razaoSocial: "RS" })).toBe("NF");
  });

  it("caem para a razaoSocial quando não há fantasia", () => {
    expect(factoryName({ nomeFantasia: null, razaoSocial: "RS" })).toBe("RS");
    expect(clientName({ nomeFantasia: null, razaoSocial: "RS" })).toBe("RS");
  });

  it("retornam — sem dados", () => {
    expect(factoryName(null)).toBe("—");
    expect(clientName(undefined)).toBe("—");
    expect(factoryName({})).toBe("—");
  });
});
