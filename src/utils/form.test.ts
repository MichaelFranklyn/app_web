import { describe, expect, it } from "vitest";
import { extractSelectValue } from "./form";

describe("extractSelectValue", () => {
  it("extrai o `value` de um option de select", () => {
    expect(extractSelectValue({ value: "abc", label: "ABC" })).toBe("abc");
  });

  it("retorna o valor direto quando é string", () => {
    expect(extractSelectValue("texto")).toBe("texto");
  });

  it("normaliza number para string", () => {
    expect(extractSelectValue(42)).toBe("42");
    expect(extractSelectValue({ value: 7 })).toBe("7");
  });

  it("retorna string vazia para null/undefined", () => {
    expect(extractSelectValue(null)).toBe("");
    expect(extractSelectValue(undefined)).toBe("");
  });
});
