import { describe, expect, it } from "vitest";
import { personInitials } from "./initials";

describe("personInitials", () => {
  it("usa o primeiro e o último nome", () => {
    expect(personInitials("João Sacramento")).toBe("JS");
    expect(personInitials("Ana Paula Ribeiro Lima")).toBe("AL");
  });

  it("pula os conectivos", () => {
    expect(personInitials("Maria das Dores")).toBe("MD");
    expect(personInitials("Pedro de Souza e Silva")).toBe("PS");
  });

  it("nome único vira uma letra só", () => {
    expect(personInitials("Rafael")).toBe("R");
  });

  it("acento e caixa não atrapalham", () => {
    expect(personInitials("  élio   ávila ")).toBe("ÉÁ");
  });

  it("vazio devolve vazio", () => {
    expect(personInitials("")).toBe("");
    expect(personInitials(null)).toBe("");
  });
});
