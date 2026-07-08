import { describe, expect, it } from "vitest";
import { SignUpFormData } from "./interface";
import { MIN_PASSWORD_LENGTH, normalizeInput, validateSignUp } from "./utils";

const base: SignUpFormData = {
  cnpj: "11.222.333/0001-81",
  segment: "Representação",
  ownerName: "Contato Demo",
  ownerEmail: "owner@demo.com",
  ownerPassword: "segredo123",
  confirmPassword: "segredo123",
};

describe("validateSignUp", () => {
  it("aceita quando senha ok e confere", () => {
    expect(validateSignUp(base)).toBeNull();
  });

  it("rejeita senha curta", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    const msg = validateSignUp({
      ...base,
      ownerPassword: short,
      confirmPassword: short,
    });
    expect(msg).toMatch(/ao menos/);
  });

  it("rejeita senhas diferentes", () => {
    expect(validateSignUp({ ...base, confirmPassword: "outra-senha" })).toMatch(
      /não conferem/
    );
  });
});

describe("normalizeInput", () => {
  it("faz trim e não envia confirmPassword", () => {
    const out = normalizeInput({
      ...base,
      segment: "  Representação  ",
      ownerName: "  Contato Demo  ",
      ownerEmail: "  owner@demo.com  ",
    });
    expect(out).toEqual({
      cnpj: "11.222.333/0001-81",
      segment: "Representação",
      ownerName: "Contato Demo",
      ownerEmail: "owner@demo.com",
      ownerPassword: "segredo123",
    });
    expect("confirmPassword" in out).toBe(false);
  });
});
