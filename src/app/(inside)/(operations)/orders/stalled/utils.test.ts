import { describe, expect, it } from "vitest";

import { assumedDeliveryDate, daysBetween, sumAmount } from "./utils";

describe("assumedDeliveryDate", () => {
  it("soma o prazo do pedido ao faturamento", () => {
    expect(assumedDeliveryDate("2026-07-01", 10, 30, "2026-09-26")).toBe(
      "2026-07-11"
    );
  });

  it("sem prazo usa o padrão", () => {
    expect(assumedDeliveryDate("2026-07-01", null, 30, "2026-09-26")).toBe(
      "2026-07-31"
    );
  });

  it("nunca passa de hoje", () => {
    expect(assumedDeliveryDate("2026-09-20", null, 30, "2026-09-26")).toBe(
      "2026-09-26"
    );
  });
});

describe("daysBetween", () => {
  it("conta dias corridos", () => {
    expect(daysBetween("2026-09-01", "2026-09-26")).toBe(25);
  });
});

describe("sumAmount", () => {
  it("soma valores em string", () => {
    expect(sumAmount([{ totalAmount: "10.5" }, { totalAmount: "4.5" }])).toBe(
      15
    );
  });
});
