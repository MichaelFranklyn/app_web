import { describe, expect, it } from "vitest";

import { visibleCommission } from "./commission";

describe("visibleCommission", () => {
  it("gestor: a comissão da fábrica", () => {
    expect(
      visibleCommission({
        commissionAmount: "500",
        sellerCommissionAmount: "300",
      })
    ).toBe("500");
  });

  it("vendedor (fábrica nula no servidor): a parte dele", () => {
    expect(
      visibleCommission({
        commissionAmount: null,
        sellerCommissionAmount: "300",
      })
    ).toBe("300");
  });

  it("zero da fábrica é valor, não ausência", () => {
    expect(
      visibleCommission({
        commissionAmount: "0",
        sellerCommissionAmount: "300",
      })
    ).toBe("0");
  });
});
