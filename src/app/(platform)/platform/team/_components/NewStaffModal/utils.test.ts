import { describe, expect, it } from "vitest";

import { FORM_STEPS, normalizeStaffInput } from "./utils";

const fields = FORM_STEPS[0].sections[0].fields;

describe("conta de suporte — campos", () => {
  it("nome e e-mail são obrigatórios", () => {
    // Era `canSubmit` à mão, com o botão apagado e sem dizer o que faltava.
    expect(fields.map((f) => f.name)).toEqual(["name", "email"]);
    expect(fields.every((f) => f.required)).toBe(true);
  });

  it("o e-mail é do tipo que valida formato", () => {
    // A conta criada com endereço torto só apareceria como erro do backend,
    // depois de gasto o clique.
    expect(fields.find((f) => f.name === "email")?.type).toBe("email");
  });
});

describe("normalizeStaffInput", () => {
  it("tira os espaços das pontas", () => {
    expect(
      normalizeStaffInput({ name: "  Ana Souza ", email: " a@b.com " })
    ).toEqual({
      name: "Ana Souza",
      email: "a@b.com",
    });
  });

  it("campo ausente vira string vazia, não 'undefined'", () => {
    expect(normalizeStaffInput({})).toEqual({ name: "", email: "" });
  });
});
