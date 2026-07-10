import { describe, expect, it } from "vitest";
import { clientDisplayName } from "./client";

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
