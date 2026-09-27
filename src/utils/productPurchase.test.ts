import { describe, expect, it } from "vitest";
import { daysAgoLabel, unitsLabel } from "./productPurchase";

describe("daysAgoLabel", () => {
  it("conta o tempo como a pessoa conta", () => {
    expect(daysAgoLabel(0)).toBe("hoje");
    expect(daysAgoLabel(1)).toBe("ontem");
    expect(daysAgoLabel(12)).toBe("há 12 dias");
  });
});

describe("unitsLabel", () => {
  it("quantidade inteira sai sem casas decimais", () => {
    expect(unitsLabel("12")).toBe("12");
    expect(unitsLabel("12.0000")).toBe("12");
  });

  it("quantidade fracionada mantém as casas que importam", () => {
    expect(unitsLabel("12.5")).toBe("12,5");
  });

  it("valor inválido não vira NaN na tela", () => {
    expect(unitsLabel("abc")).toBe("—");
  });
});
