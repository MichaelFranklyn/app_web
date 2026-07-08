import { describe, expect, it } from "vitest";
import { normalizeInput } from "./utils";

describe("normalizeInput (provisionar empresa)", () => {
  it("envia ownerPassword nulo quando a senha fica em branco (gera link)", () => {
    const out = normalizeInput({
      cnpj: "11.222.333/0001-81",
      segment: "Representação",
      ownerName: "Contato Demo",
      ownerEmail: "owner@demo.com",
      ownerPassword: "",
    });
    expect(out.ownerPassword).toBeNull();
  });

  it("preserva a senha quando informada", () => {
    const out = normalizeInput({
      cnpj: "11.222.333/0001-81",
      segment: "Representação",
      ownerName: "Contato Demo",
      ownerEmail: "owner@demo.com",
      ownerPassword: "segredo123",
    });
    expect(out.ownerPassword).toBe("segredo123");
  });

  it("trata só-espaços na senha como em branco", () => {
    const out = normalizeInput({
      ownerPassword: "   ",
    });
    expect(out.ownerPassword).toBeNull();
  });

  it("faz trim dos campos de texto e mantém o CNPJ mascarado (backend limpa)", () => {
    const out = normalizeInput({
      cnpj: "11.222.333/0001-81",
      segment: "  Representação  ",
      ownerName: "  Contato Demo  ",
      ownerEmail: "  owner@demo.com  ",
    });
    expect(out.segment).toBe("Representação");
    expect(out.ownerName).toBe("Contato Demo");
    expect(out.ownerEmail).toBe("owner@demo.com");
    expect(out.cnpj).toBe("11.222.333/0001-81");
  });
});
