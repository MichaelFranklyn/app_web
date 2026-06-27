import { describe, expect, it } from "vitest";

import { getNestedValue } from "./object";

describe("getNestedValue", () => {
  it("acessa um caminho aninhado", () => {
    expect(getNestedValue({ a: { b: { c: 1 } } }, "a.b.c")).toBe(1);
  });

  it("retorna undefined p/ caminho inexistente", () => {
    expect(getNestedValue({ a: {} }, "a.b.c")).toBeUndefined();
  });

  it("retorna undefined p/ obj nulo ou path vazio", () => {
    expect(getNestedValue(null, "a")).toBeUndefined();
    expect(getNestedValue({ a: 1 }, "")).toBeUndefined();
  });
});
