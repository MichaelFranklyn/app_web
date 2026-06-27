import { describe, expect, it } from "vitest";

import { distinctValues, parseNumber, valueForChoice } from "./columns";

describe("valueForChoice", () => {
  it("none/undefined → ''", () => {
    expect(valueForChoice(undefined, ["a"])).toBe("");
    expect(valueForChoice({ kind: "none" }, ["a"])).toBe("");
  });

  it("fixed → o valor fixo", () => {
    expect(valueForChoice({ kind: "fixed", value: "X" }, [])).toBe("X");
  });

  it("column → a célula (ou '' fora do range)", () => {
    expect(valueForChoice({ kind: "column", index: 1 }, ["a", "b"])).toBe("b");
    expect(valueForChoice({ kind: "column", index: 5 }, ["a"])).toBe("");
  });
});

describe("distinctValues", () => {
  it("coluna: distintos não vazios, na ordem de aparição", () => {
    const rows = [["a"], ["b"], ["a"], [" "]];
    expect(distinctValues(rows, { kind: "column", index: 0 })).toEqual([
      "a",
      "b",
    ]);
  });

  it("fixed: único (trim) ou vazio", () => {
    expect(distinctValues([], { kind: "fixed", value: " X " })).toEqual(["X"]);
    expect(distinctValues([], { kind: "fixed", value: "  " })).toEqual([]);
  });

  it("none/undefined → []", () => {
    expect(distinctValues([["a"]], undefined)).toEqual([]);
    expect(distinctValues([["a"]], { kind: "none" })).toEqual([]);
  });
});

describe("parseNumber", () => {
  it("ponto decimal com símbolo", () => {
    expect(parseNumber("R$ 1.41")).toBe(1.41);
  });

  it("vírgula decimal + milhar com ponto", () => {
    expect(parseNumber("1.234,56")).toBe(1234.56);
  });

  it("milhar com vírgula + ponto decimal", () => {
    expect(parseNumber("1,234.56")).toBe(1234.56);
  });

  it("texto sem número → NaN", () => {
    expect(parseNumber("abc")).toBeNaN();
  });
});
