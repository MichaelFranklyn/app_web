import { describe, expect, it } from "vitest";
import { extractSelectValue, parseDeliveryDays } from "./form";

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

describe("parseDeliveryDays", () => {
  it("vazio/nulo → null (backend usa o padrão da fábrica)", () => {
    expect(parseDeliveryDays("")).toBeNull();
    expect(parseDeliveryDays("   ")).toBeNull();
    expect(parseDeliveryDays(null)).toBeNull();
    expect(parseDeliveryDays(undefined)).toBeNull();
  });

  it("número válido → inteiro arredondado", () => {
    expect(parseDeliveryDays("15")).toBe(15);
    expect(parseDeliveryDays(20)).toBe(20);
    expect(parseDeliveryDays("7.6")).toBe(8);
    expect(parseDeliveryDays("0")).toBe(0);
  });

  it("negativo ou lixo → null", () => {
    expect(parseDeliveryDays("-3")).toBeNull();
    expect(parseDeliveryDays("abc")).toBeNull();
  });
});
