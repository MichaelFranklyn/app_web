import { describe, expect, it } from "vitest";

import { buildRevokeSteps, reasonOf } from "./utils";

const fieldOf = (isRevoking: boolean) =>
  buildRevokeSteps(isRevoking)[0].sections[0].fields[0];

describe("revogar/devolver acesso — motivo", () => {
  it("continua opcional: a mutation aceita nulo", () => {
    // Marcar como obrigatório aqui inventaria uma regra que o backend não cobra.
    expect(fieldOf(true).required).toBeUndefined();
  });

  it("o exemplo muda com a ação", () => {
    // "saiu da equipe" não serve de modelo para quem está devolvendo acesso.
    expect(fieldOf(true).placeholder).toMatch(/saiu da equipe/);
    expect(fieldOf(false).placeholder).toMatch(/retorno de férias/);
  });

  it("em branco vira null", () => {
    expect(reasonOf({ reason: "  " })).toBeNull();
    expect(reasonOf({ reason: " férias " })).toBe("férias");
  });
});
