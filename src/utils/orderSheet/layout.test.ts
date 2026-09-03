import { describe, expect, it } from "vitest";

import { columnLetter } from "./layout";

describe("columnLetter", () => {
  it("converte as primeiras colunas", () => {
    expect(columnLetter(1)).toBe("A");
    expect(columnLetter(9)).toBe("I");
    expect(columnLetter(26)).toBe("Z");
  });

  it("vira duas letras depois de Z", () => {
    // O CATALOGO passa de Z quando a empresa tem muitos níveis de preço, e a
    // fórmula do preço aponta para a última coluna por letra.
    expect(columnLetter(27)).toBe("AA");
    expect(columnLetter(28)).toBe("AB");
    expect(columnLetter(52)).toBe("AZ");
    expect(columnLetter(53)).toBe("BA");
  });
});
