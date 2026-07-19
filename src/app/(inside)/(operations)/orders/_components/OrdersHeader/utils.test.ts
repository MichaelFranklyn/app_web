import { describe, expect, it } from "vitest";
import { normalizeInput } from "./utils";

describe("normalizeInput (criar pedido)", () => {
  it("desembrulha selects ({value}) e mantém strings diretas", () => {
    const result = normalizeInput({
      sellerId: { value: "s1", label: "Vendedor" },
      clientId: "c1",
      factoryId: { value: "f1" },
      orderDate: "2026-05-31",
      paymentTermId: { value: "pt1", label: "30/60/90" },
      freightType: { value: "FOB" },
      notes: "obs",
    });

    expect(result).toEqual({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-05-31",
      paymentTermId: "pt1",
      freightType: "FOB",
      notes: "obs",
      isQuote: false,
    });
  });

  it("marca isQuote quando orderKind é 'quote' (orçamento)", () => {
    const base = {
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-05-31",
    };
    expect(normalizeInput({ ...base, orderKind: "quote" }).isQuote).toBe(true);
    expect(normalizeInput({ ...base, orderKind: "order" }).isQuote).toBe(false);
    // Ausente (default) = pedido de fato.
    expect(normalizeInput(base).isQuote).toBe(false);
  });

  it("manda paymentTermId/freightType/notes como null quando ausentes", () => {
    const result = normalizeInput({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-05-31",
    });

    expect(result.paymentTermId).toBeNull();
    expect(result.freightType).toBeNull();
    expect(result.notes).toBeNull();
  });
});
