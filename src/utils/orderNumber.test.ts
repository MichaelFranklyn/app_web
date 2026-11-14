import { describe, expect, it } from "vitest";
import { formatOrderNumber, orderShortCode } from "./orderNumber";

describe("orderNumber", () => {
  it("formata o número legível com cerquilha", () => {
    expect(formatOrderNumber(128)).toBe("#128");
  });

  it("deriva o código curto do id, em caixa alta", () => {
    expect(orderShortCode("a3f9c2e1-0000-4000-8000-000000000000")).toBe(
      "A3F9C2E1"
    );
  });
});
