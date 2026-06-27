import { describe, expect, it } from "vitest";
import { normalizeInput } from "./utils";

describe("normalizeInput (criar pedido)", () => {
  it("desembrulha selects ({value}) e mantém strings diretas", () => {
    const result = normalizeInput({
      sellerId: { value: "s1", label: "Vendedor" },
      clientId: "c1",
      factoryId: { value: "f1" },
      orderDate: "2026-05-31",
      freightType: { value: "FOB" },
      notes: "obs",
    });

    expect(result).toEqual({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-05-31",
      freightType: "FOB",
      notes: "obs",
    });
  });

  it("manda freightType/notes como null quando ausentes", () => {
    const result = normalizeInput({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-05-31",
    });

    expect(result.freightType).toBeNull();
    expect(result.notes).toBeNull();
  });
});
