import { describe, expect, it } from "vitest";

import { findTermIdByName } from "./utils";

const TERMS = [
  { id: "t1", name: "30/45/60" },
  { id: "t2", name: "À vista" },
];

describe("achar a condição pelo nome", () => {
  it("acha pelo nome que a ficha guardou", () => {
    expect(findTermIdByName(TERMS, "30/45/60")).toBe("t1");
  });

  it("não se perde em caixa e espaço sobrando", () => {
    // A ficha é um arquivo que passa por Excel, LibreOffice e cópia manual.
    expect(findTermIdByName(TERMS, " à  VISTA ")).toBe("t2");
  });

  it("devolve null quando a condição não existe mais na fábrica", () => {
    // Ficha velha, condição apagada: melhor o campo vazio do que o prazo errado.
    expect(findTermIdByName(TERMS, "30/60/90")).toBeNull();
    expect(findTermIdByName(TERMS, "")).toBeNull();
  });
});
