import { describe, expect, it } from "vitest";

import { reasonOf, SUSPEND_STEPS } from "./utils";

describe("suspensão de empresa — motivo", () => {
  it("é obrigatório", () => {
    // O backend recusa sem motivo; antes o botão só ficava apagado, sem dizer
    // por quê. Agora o campo cobra e explica.
    const field = SUSPEND_STEPS[0].sections[0].fields[0];
    expect(field.name).toBe("reason");
    expect(field.required).toBe(true);
  });

  it("em branco vira null, não string vazia", () => {
    expect(reasonOf({ reason: "   " })).toBeNull();
    expect(reasonOf({})).toBeNull();
  });

  it("preserva o texto sem os espaços das pontas", () => {
    expect(reasonOf({ reason: " inadimplência " })).toBe("inadimplência");
  });
});
